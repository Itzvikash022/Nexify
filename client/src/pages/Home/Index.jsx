import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Sidebar from "@/components/sidebar";
import Sidebar2 from "@/components/sidebar/sidebar2";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";
import defaultImg from "../../assets/default.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [postData, setData] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [trendingUsers, setTrendingUsers] = useState([]);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/feed", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });

        if (response.status === 401) {
          const data = await response.json();
          if (data === "Token expired") {
            alert("Your session has expired. Please log in again.");
            localStorage.removeItem("user:token");
            navigate("/account");
            return;
          }
        }

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

  useEffect(() => {
    const fetchTrendingUsers = async () => {
      try {
        const response = await fetch("http://localhost:8000/trending-users",{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        
        setTrendingUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingUsers();
  }, []);

  // const fetchSuggestedUsers = async () => {
  //   try {
  //     const response = await fetch('/api/suggested-users', {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${localStorage.getItem('user:token')}`,
  //       },
  //     });
  
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('Server Error Response:', errorText);
  //       throw new Error('Failed to fetch suggested users');
  //     }
  
  //     const data = await response.json();
  //     console.log(data, 'Fetched data');
  //     setSuggestedUsers(data);
  //   } catch (error) {
  //     console.error('Failed to fetch suggested users:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

  const handleLike = async (_id, index) => {
    try {
      const response = await fetch("http://localhost:8000/api/like", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: _id }),
      });

      const { updatedPost } = await response.json();

      const updatePost = postData.map((post, i) =>
        i === index
          ? {
              ...updatedPost,
              user: { ...post.user, profileImgUrl: post.user.profileImgUrl },
            }
          : post
      );

      setData(updatePost);
    } catch (error) {
      console.error("Error liking the post:", error);
    }
  };

  const handleUnlike = async (_id, index) => {
    try {
      const response = await fetch("http://localhost:8000/api/unlike", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: _id }),
      });

      const { updatedPost } = await response.json();

      const updatePost = postData.map((post, i) =>
        i === index
          ? {
              ...updatedPost,
              user: { ...post.user, profileImgUrl: post.user.profileImgUrl },
            }
          : post
      );

      setData(updatePost);
    } catch (error) {
      console.error("Error unliking the post:", error);
    }
  };
  

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/suggestions", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Error fetching suggestions");
        }
  
        const data = await response.json();
        console.log("Fetched suggestions: ", data); // Add logging for debugging
        setSuggestions(data); // Assuming data is an array
      } catch (error) {
        console.error("Error fetching suggestions", error);
      }
    };
  
    fetchSuggestions();
  }, []);
  
    
  

  console.log(suggestions, 'suggestions');
  

  const { username = "" } = user || {};
  // const trendingUsers = [
  //   { id: 1, name: "Tech Guru", followers: "1.2M" },
  //   { id: 2, name: "Travel Enthusiast", followers: "890K" },
  //   { id: 3, name: "Foodie Delight", followers: "567K" },
  //   { id: 4, name: "Foodie Delight", followers: "567K" },
  //   { id: 5, name: "Foodie Delight", followers: "567K" },
  // ];

  // const suggestedUsers = [
  //   { id: 1, name: "Alice Wonder", mutualFriends: 5 },
  //   { id: 2, name: "Charlie Brown", mutualFriends: 3 },
  //   { id: 3, name: "David Green", mutualFriends: 7 },
  //   { id: 4, name: "David Green", mutualFriends: 7 },
  //   { id: 5, name: "David Green", mutualFriends: 7 },
  //   { id: 6, name: "David Green", mutualFriends: 7 },
  // ];

  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Sidebar2 />
        <main className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_300px] gap-8 p-8">
          <div className="hidden md:block" />

          {/* Posts */}
          <div className="flex flex-col gap-6">
            {loading ? (
              <div className="flex flex-col h-full items-center justify-center">
                <ClipLoader size={50} color="black" />
              </div>
            ) : (
              postData.map(
                (
                  {
                    _id = "",
                    caption = "",
                    description = "",
                    createdAt = "",
                    imageUrl = "",
                    commentCount = "",
                    likes = [],
                    user: postUser = {},
                  },
                  index
                ) => {
                  const isAlreadyLiked = likes.includes(user._id);
                  const formattedDate = new Date(createdAt).toLocaleString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );
                  return (
                    <Card className="overflow-hidden rounded-lg shadow-lg max-w-xl mx-auto">
                      <CardHeader className="flex items-start justify-between gap-4 border-b bg-muted p-4">
                        <div
                          className="flex items-center gap-4 cursor-pointer"
                          onClick={() =>
                            username === postUser.username
                              ? navigate("/profile")
                              : navigate(`/user/${postUser?.username}`)
                          }
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={postUser.profileImgUrl}
                              alt="Image not found"
                            />
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">
                              @{postUser.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formattedDate}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent
                        className="p-0 cursor-pointer"
                        onClick={() => navigate(`/post/${_id}`)}
                      >
                        <img
                          src={imageUrl}
                          width={400}
                          height={400}
                          alt="Post image"
                          className="w-[650px] h-auto min-h-[300px] max-h-[700px] object-cover"
                        />
                      </CardContent>
                      <div className="bg-muted p-1 pl-[15px] pt-[9px] font-poppins text-sm">
                        <span className="font-semibold">
                          @{postUser.username}
                        </span>{" "}
                        : {caption || "No caption"}
                      </div>
                      <CardFooter className="flex items-center gap-4 border-t bg-muted p-4">
                        <Button variant="ghost" size="icon">
                          <IconHeart
                            size={24}
                            className="mr-2 cursor-pointer"
                            color={isAlreadyLiked ? "red" : "black"}
                            fill={isAlreadyLiked ? "red" : "white"}
                            onClick={() =>
                              isAlreadyLiked
                                ? handleUnlike(_id, index)
                                : handleLike(_id, index)
                            }
                          />
                        </Button>
                        <div className="flex items-center">
                          <IconMessageCircle
                            size={22}
                            className="mr-2 cursor-pointer"
                            onClick={() => navigate(`/post/${_id}`)}
                          />
                          <span>{commentCount} Comments</span>
                        </div>
                        <div className="ml-auto text-sm font-medium">
                          <span className="font-bold">{likes.length}</span>{" "}
                          likes
                        </div>
                      </CardFooter>
                    </Card>
                  );
                }
              )
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6 hidden lg:block ">
            {/* Trending users */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Trending Profiles</h2>
              </CardHeader>
              <CardContent c>
                <ul>
                  {trendingUsers.map((user) => (
                    <li key={user._id} className="flex rounded-r-lg items-center cursor-pointer border-t py-4 w-[270px] hover:bg-gray-100"  onClick={() => navigate(`/user/${user.username}`)}>
                      <img
                        src={user.profileImgUrl || defaultImg}
                        alt={user.username}
                        className="w-12 h-12 rounded-full ml-4"
                      />
                      <div className="ml-4">
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-gray-500">
                          Followers: {user.followerCount}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* User suggestions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Suggested Users</h2>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  { suggestions?.length > 0 ? (
                  suggestions.map((user) => (
                    <li key={user.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={user.profileImgUrl || defaultImg} alt={user.username} />
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                      <Button variant="outline" size="sm">Go to Profile</Button>
                    </li>
                  ))
                 ) : (
                  <p>No suggestions available</p>
                ) 
                }
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
