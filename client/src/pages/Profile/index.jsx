import React, { useEffect, useState } from "react";
import { IconHeart, IconMessage } from "@tabler/icons-react";
import ClipLoader from "react-spinners/ClipLoader";
import { links } from "../Home/data";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/sidebar";
import Button from "../../components/button/Button";

const Profile = () => {
  const [postData, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
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
      setLoading(false);
    };
    getPosts();
  }, []);

  const postCount = postData.length;
  const {
    _id = "",
    username = "",
    email = "",
    followers = "",
    following = "",
    profileImgUrl,
  } = user || {};

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
    const updatePost = postData.map((post, i) => {
      if (i === index) return updatedPost;
      else return post;
    });
    setPosts(updatePost);
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
    const updatePost = postData.map((post, i) => {
      if (i === index) return updatedPost;
      else return post;
    });
    setPosts(updatePost);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("user:token");
        navigate("/ac/signin");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="flex">
      <Sidebar
        className={"w-[20%] bg-white fixed h-screen overflow-y-auto"}
        loading={loading}
        username={username}
        email={email}
        followers={followers}
        following={following}
        links={links}
        handleLogout={handleLogout}
        btn_class={
          "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[170px]"
        }
        profileImgUrl={profileImgUrl}
      />

      <div className="flex-1 ml-[20%] overflow-y-auto p-6" id="posts-area" >
        <Button
          label="Edit Profile"
          onClick={() => navigate("/edit-profile")}
        />

        <div className="flex justify-center w-full">
          {loading ? (
            <div className="pt-[80px]">
              <ClipLoader size={75} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[50px] p-6 border mt-6 w-full">
              {postData.length > 0 ? (
                postData.map(
                  (
                    {
                      _id,
                      caption = "",
                      description = "",
                      imageUrl = "",
                      likes = [],
                    },
                    index
                  ) => {
                    const isAlreadyLiked =
                      likes.length > 0 && likes.includes(user?.id);

                    return (
                      <div
                        key={_id}
                        className="w-full justify-center flex flex-col p-6 border bg-gray-100 rounded-lg max-h-600px"
                      >
                        <div>
                          <div className="pb-4 mb-2">
                            <img
                              src={imageUrl}
                              alt="Failed to load image"
                              className="w-full rounded-lg shadow max-h-[400px] object-cover cursor-pointer"
                              onClick={() => navigate(`/post/${_id}`)}
                            />
                          </div>
                          <div className="pb-2">
                            <h3 className="font-bold border-b">{caption}</h3>
                            <p className="break-words">
                              {truncateText(description, 100)}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-evenly font-bold mt-2">
                          <div className="flex items-center">
                            <IconHeart
                              size={24}
                              className="mr-2"
                              color={isAlreadyLiked ? "red" : "black"}
                              fill={isAlreadyLiked ? "red" : "white"}
                              cursor="pointer"
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
                              className="mr-2"
                              cursor="pointer"
                              onClick={() => navigate(`/post/${_id}`)}
                            />
                            <span>10.5K Comments</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="col-span-3 text-center text-xl font-semibold text-gray-500">
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
