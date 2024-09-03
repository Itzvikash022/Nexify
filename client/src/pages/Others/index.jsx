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
import bg_img from "../../assets/login_background.jpg";

const Others = () => {
  const { username } = useParams();
  const [postData, setData] = useState([]);
  const [user, setUser] = useState({});
  const [isFollowed, setIsFollowed] = useState(false);
  const [LoggedUser, setLoggedUser] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [followerCount, setFollowerCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);

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

  const postCount = postData.length;

  useEffect(() => {
    const getFollowersCount = async () => {
      if (!user.id) return;

      try {
        const response = await fetch("http://localhost:8000/api/followerCount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const followerCount = await response.json();
        setFollowerCount(followerCount.followers);
      } catch (error) {
        console.error("Failed to fetch follower count:", error);
      } finally {
        setLoading(false);
      }
    };

    getFollowersCount();
  }, [user.id]);

  useEffect(() => {
    const getFollowingCount = async () => {
      if (!user.id) return;

      try {
        const response = await fetch("http://localhost:8000/api/followingCount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const followingCount = await response.json();
        setFollowingCount(followingCount.following);
      } catch (error) {
        console.error("Failed to fetch following count:", error);
      } finally {
        setLoading(false);
      }
    };

    getFollowingCount();
  }, [user.id]);

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
    window.location.reload();
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
    window.location.reload();
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
    setData(updatePost);
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
          className="w-[20%] bg-white fixed h-screen overflow-y-auto"
          links={links}
          btn_class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[170px]"
        />

        <div className="flex flex-col items-center flex-1 ml-[20%] overflow-y-auto p-6" style={{ 
            backgroundImage: `url(${bg_img})`}}>
          {/* Profile Header */}
          <div className="flex flex-col items-center border w-full p-4 bg-white shadow-lg rounded-lg">
            {loading ? (
              <div className="h-[317px] flex items-center justify-center">
                <BarLoader />
              </div>
            ) : (
              <>
                <div className="flex justify-center items-center w-[150px] h-[150px] rounded-full border-2 border-gray-200 overflow-hidden">
                  <img
                    src={user?.profileImgUrl || defaultImg}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="mt-4 text-center font-bold text-xl">
                  {user?.username}
                </p>
                <p className="mb-4 text-center text-xl">{user?.email}</p>
                <div className="text-lg flex justify-around w-full md:w-[600px] text-center mb-6">
                  <div className="flex flex-col justify-center items-center">
                    <h4 className="font-bold text-xl">{postCount}</h4>
                    <p className="text-lg font-bold">Posts</p>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <h4 className="font-bold text-xl">{followerCount}</h4>
                    <p className="text-lg font-bold">Followers</p>
                  </div>
                  <div className="flex flex-col justify-center items-center">
                    <h4 className="font-bold text-xl">{followingCount}</h4>
                    <p className="text-lg font-bold">Following</p>
                  </div>
                </div>
              </>
            )}
            <div>
              {
                user?.username !== LoggedUser.username &&
                (!isFollowed ? (
                  <Button
                    label="Follow"
                    disabled={loading}
                    onClick={handleFollow}
                    className="w-[200px] bg-green-600 hover:bg-green-400 my-6"
                  />
                ) : (
                  <Button
                    label="Unfollow"
                    disabled={loading}
                    onClick={handleUnfollow}
                    className="w-[200px] bg-red-600 hover:bg-red-400 my-6"
                  />
                ))
              }
            </div>
          </div>

          {/* Posts */}
          <div className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
            {postData.map((post, index) => (
              <div
                key={post._id}
                className="flex flex-col border bg-white shadow-md rounded-lg p-4"
              >
                <div className="relative">
                  <img
                    src={post.imageUrl}
                    alt="Post"
                    className="w-full h-[300px] object-cover rounded-md"
                  />
                  
                </div>
                  <p className="font-semibold border-t mt-2 p-2">{post.caption}</p>
                <div className="mt-4 flex  justify-around items-center">
                  <div className="flex items-center">
                    {post?.likes?.includes(LoggedUser?._id) ? (
                      <IconHeart
                        size={24}
                        className="text-red-500 fill-red-500 cursor-pointer"
                        onClick={() => handleUnlike(post._id, index)}
                      />
                    ) : (
                      <IconHeart
                        size={24}
                        className="text-black-500  cursor-pointer"
                        onClick={() => handleLike(post._id, index)}
                      />
                    )}
                    <span className="ml-2">{post.likes.length}</span>
                  </div>
                  <div className="flex items-center">
                    <IconMessage size={24} className="text-gray-500" />
                    <span className="ml-2">{post.commentCount}</span>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Others;
