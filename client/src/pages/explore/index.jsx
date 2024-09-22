import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search as SearchIcon } from "lucide-react";
import Sidebar from "@/components/sidebar";
import Sidebar2 from "@/components/sidebar/sidebar2";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultImg from "../../assets/default.jpg";
import ClipLoader from "react-spinners/ClipLoader";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";

const Explore = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [postData, setData] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    if (query.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        fetch(`https://nexify-backend.vercel.app/api/search-users?username=${query}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setResults(data);
            setShowDropdown(data.length > 0); // Show dropdown if there are results
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
            setShowDropdown(false); // Hide dropdown in case of error
          });
      }, 300); // Debounce delay

      return () => clearTimeout(delayDebounceFn);
    } else {
      setResults([]); // Clear results if the query is empty
      setShowDropdown(false); // Hide dropdown if query is cleared
    }
  }, [query]);

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://nexify-backend.vercel.app/api/trending-post", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const postData = await response.json();
        setData(postData.posts);
        setUser(postData.user);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, [navigate]);

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Sidebar2 />
        <div className="md:ml-72 p-4 sm:p-6">
          {/* Search bar */}
          <div className="relative mb-8 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users"
              className="pl-10 pr-4 py-2 w-full"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {/* Search results dropdown */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-popover rounded-md shadow-lg">
                {results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-muted cursor-pointer"
                    onClick={() => handleUserClick(user.username)}
                  >
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage
                        src={user.profileImgUrl || defaultImg}
                        alt={user.username}
                      />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>



{/* Trending posts grid */}
<h1 className="text-3xl font-bold mb-6 text-center">Trending</h1>

{loading ? (
  <div className="flex flex-col h-full items-center justify-center">
    <ClipLoader size={50} color="black" />
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {postData.length > 0 ? (
      postData.map(
        (
          {
            _id = "",
            imageUrl = "",
            likes = [],
            commentCount = 0,
          },
          index
        ) => {

          return (
            <div 
              key={_id} 
              className="relative aspect-square bg-muted rounded-md overflow-hidden shadow-xl border group"
            >
              {/* Post Image */}
              <img
                src={imageUrl || "/placeholder.svg?height=300&width=300"}
                alt={`Post ${index + 1}`}
                className="w-full h-full object-cover group-hover:blur-sm transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/post/${_id}`)}
              />
              {/* Overlay with Icons */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <IconHeart className="text-white text-xl" />
                    <span className="text-white text-lg font-semibold">{likes.length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <IconMessageCircle className="text-white text-xl" />
                    <span className="text-white text-lg font-semibold">{commentCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      )
    ) : (
      <div className="col-span-3 text-center">No posts found</div>
    )}
  </div>
)}



        </div>
      </div>
    </div>
  );
};

export default Explore;
