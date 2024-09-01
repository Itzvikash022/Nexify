import React, { useEffect, useState } from "react";
import { IconHeart, IconMessage } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import Button from "../../components/button/Button";
import ClipLoader from "react-spinners/ClipLoader";
import BarLoader from "react-spinners/BarLoader";
import { links } from "../Home/data";
import { Link, useNavigate } from "react-router-dom";
import defaultImg from '../../assets/default.jpg'
import Sidebar from "../../components/sidebar";

const Others = () => {
  const { username } = useParams();
  const [postData, setData] = useState([]);
  const [user, setUser] = useState({});
  const [isFollowed, setIsFollowed] = useState(false);
  const [LoggedUser, setLoggedUser] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getPosts = async () => {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/others?username=${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        }
      );
      const postData = await response.json();
      setData(postData.posts);
      setUser(postData.userDetails);
      setIsFollowed(postData?.isFollowed);
      setLoggedUser(postData.follower);
      setLoading(false);
    };
    getPosts();
  }, [username]);
  // console.log(LoggedUser._id, "follower");

  const postCount = postData.length;

  const handleFollow = async () => {
    setLoading(true);
    const response = await fetch(`http://localhost:8000/api/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({ id: user.id }),
    });
    const followData = await response.json();
    setIsFollowed(followData?.isFollowed);
    setUser(prevUser => ({
      ...prevUser,
      followers: prevUser.followers + 1
    }));
    setLoggedUser(prevLoggedUser => ({
      ...prevLoggedUser,
      following: prevLoggedUser.following + 1
    }));
    setLoading(false);
  };

  const handleUnfollow = async () => {
    setLoading(true);
    const response = await fetch(`http://localhost:8000/api/unfollow`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({ id: user.id }),
    });
    const followData = await response.json();
    setIsFollowed(followData?.isFollowed);
    setUser(prevUser => ({
      ...prevUser,
      followers: prevUser.followers - 1
    }));
    setLoggedUser(prevLoggedUser => ({
      ...prevLoggedUser,
      following: prevLoggedUser.following - 1
    }));
    setLoading(false);
  };

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
    // postData[index] = updatedPost
    setData(updatePost);
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
    // postData[index] = updatedPost
    setData(updatePost);
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
        // Clear token from local storage
        localStorage.removeItem("user:token");
        // Redirect to login or home page
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
    <>
      <div className="flex">
        <Sidebar
          className={"w-[20%] bg-white fixed h-screen overflow-y-auto"}
          loading={loading}
          username={LoggedUser.username}
          email={LoggedUser.email}
          followers={LoggedUser.followers}
          following={LoggedUser.following}
          links={links}
          handleLogout={handleLogout}
          btn_class={
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[170px]"
          }
          profileImgUrl={LoggedUser.profileImgUrl}
        />

        <div className="flex flex-col items-center flex-1 ml-[20%] overflow-y-auto p-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center border w-full p-4">
            {loading ? (
              <div className="h-[317px] flex items-center justify-center">
                <BarLoader />
              </div>
            ) : (
              <>
                <div className="flex justify-center flex-col items-center w-[150px] h-[150px] rounded-full border-2 border-gray-200 overflow-hidden">
                  <img
                    src={user?.profileImgUrl || defaultImg}
                    alt="Failed to load image"
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="mt-4 text-center font-bold text-xl">
                  {user?.username}
                </p>
                <p className="mb-4 text-center text-xl">{user?.email}</p>
                <div className="text-lg flex justify-around w-[600px] text-center mb-6">
                  <div className="flex flex-col justify-around items-center">
                    <h4 className="font-bold text-xl">{postCount}</h4>
                    <p className="text-lg font-bold">Posts</p>
                  </div>
                  <div className="flex flex-col justify-around items-center">
                    <h4 className="font-bold text-xl">{user?.followers}</h4>
                    <p className="text-lg font-bold">Followers</p>
                  </div>
                  <div className="flex flex-col justify-around items-center">
                    <h4 className="font-bold text-xl">{user?.following}</h4>
                    <p className="text-lg font-bold">Following</p>
                  </div>
                </div>
              </>
            )}
            <div>
              {!isFollowed ? (
                <Button
                  label="Follow"
                  disabled={loading}
                  onClick={() => handleFollow()}
                  className="w-[200px] bg-green-600 hover:bg-green-400 my-6"
                />
              ) : (
                <Button
                  label="Unfollow"
                  disabled={loading}
                  onClick={() => handleUnfollow()}
                  className="w-[200px] bg-red-600 hover:bg-red-500 my-6"
                />
              )}
            </div>
          </div>

          {/* Grid for Posts */}
          <div className="flex justify-center w-full">
            {loading ? (
              <div className="pt-[80px]">
                <ClipLoader size={75} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[50px] p-6 border mt-6 w-[1500px]">
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
                      const isAlreadyLiked =
                        likes.length > 0 && likes.includes(LoggedUser._id);

                      return (
                        <div
                            key={_id}
                            className="w-full flex flex-col p-6 border bg-gray-100 rounded-lg max-h-[600px] flex-1"
                          >
                            <div className="flex-1">
                              <div className="pb-4 mb-2">
                                <img
                                  src={imageUrl}
                                  alt="Failed to load image"
                                  className="w-full rounded-lg shadow max-h-[400px] cursor-pointer"
                                  onClick={() => navigate(`/post/${_id}`)}
                                />
                              </div>
                            </div>
                              <div className="pb-2">
                                <h3 className="font-bold border-b">{caption}</h3>
                                <p className="break-words">{truncateText(description, 100)}</p>
                              </div>
                            <div className="flex justify-evenly font-bold mt-auto">
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
                                <span>{commentCount} Comments</span>
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
    </>
  );
};

export default Others;
