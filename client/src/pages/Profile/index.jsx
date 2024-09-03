import React, { useEffect, useState } from "react";
import { IconHeart, IconMessage } from "@tabler/icons-react";
import ClipLoader from "react-spinners/ClipLoader";
import { links } from "../Home/data";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import Button from "../../components/button/Button";
import bg_img from "../../assets/login_background.jpg";

const Profile = () => {
  const [postData, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
        const postData = await response.json();
        setPosts(postData.posts);
        setUser(postData.userDetails);
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        setError("Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };
    getPosts();
  }, []);

  const handleLike = async (_id, index) => {
    const response = await fetch("http://localhost:8000/api/like", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({ id: _id }),
    });
    const { updatedPost } = await response.json();
    setPosts(postData.map((post, i) => (i === index ? updatedPost : post)));
  };

  const handleUnlike = async (_id, index) => {
    const response = await fetch("http://localhost:8000/api/unlike", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({ id: _id }),
    });
    const { updatedPost } = await response.json();
    setPosts(postData.map((post, i) => (i === index ? updatedPost : post)));
  };

  const deleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (!confirmDelete) return; // Exit the function if the user does not confirm

    setLoading(true);
    setError('');
    try {
      const response = await fetch("http://localhost:8000/api/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.removeItem("user:token");
        navigate("/ac/signin");
      } else {
        setError(data.message || "An error occurred while deleting the account.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        className="w-[20%] bg-white fixed h-screen overflow-y-auto"
        links={links}
        btn_class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[170px]"
      />

      <div className="flex-1 ml-[20%] p-6" style={{ 
            backgroundImage: `url(${bg_img})`}}>
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center">
            <img
              src={user.profileImgUrl || "/default-profile.png"}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              label="Edit Profile"
              onClick={() => navigate("/edit-profile")}
              className="mr-4"
            />
            <Button
              label="Delete Account"
              onClick={deleteAccount}
              className="bg-red-500 hover:bg-red-700"
            />
          </div>
        </div>

        {/* Posts Section */}
        <div className="flex flex-col">
          {loading ? (
            <div className="flex justify-center items-center h-screen">
              <ClipLoader size={75} color="black" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {postData.length > 0 ? (
                postData.map(
                  (
                    {
                      _id,
                      caption = "",
                      description = "",
                      imageUrl = "",
                      commentCount = "",
                      likes = [],
                    },
                    index
                  ) => {
                    const isAlreadyLiked = likes.includes(user?.id);

                    return (
                      <div
                        key={_id}
                        className="bg-white p-4 rounded-lg shadow-lg"
                      >
                        <img
                          src={imageUrl}
                          alt="Post"
                          className="w-full h-[300px] object-cover rounded-lg cursor-pointer"
                          onClick={() => navigate(`/post/${_id}`)}
                        />
                        <div className="mt-2 border-t p-2">
                          <h3 className="font-semibold">{caption}</h3>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center">
                            <IconHeart
                              size={24}
                              className={`mr-2 cursor-pointer ${isAlreadyLiked ? 'text-red-500 fill-red-500' : 'text-black-500'}`}
                              onClick={() =>
                                isAlreadyLiked
                                  ? handleUnlike(_id, index)
                                  : handleLike(_id, index)
                              }
                            />
                            <span>{likes.length} Likes</span>
                          </div>
                          <div className="flex items-center">
                            <IconMessage
                              size={24}
                              className="mr-2 cursor-pointer"
                              onClick={() => navigate(`/post/${_id}`)}
                            />
                            <span>{commentCount} Comments</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="text-center text-lg text-gray-600 col-span-3">
                  No posts available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
