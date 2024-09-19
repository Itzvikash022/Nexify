import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Heart } from "lucide-react";
import { ClipLoader } from "react-spinners";
import defaultImg from "../../assets/default.jpg";
import Sidebar from "@/components/sidebar";
import Sidebar2 from "@/components/sidebar/sidebar2";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);

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

  useEffect(() => {
    const getFollowersCount = async () => {
      if (!user.id) return;

      try {
        const response = await fetch(
          "http://localhost:8000/api/followerCount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );

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
        const response = await fetch(
          "http://localhost:8000/api/followingCount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }
        );

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
    setUser((prevUser) => ({
      ...prevUser,
      followers: prevUser.followers + 1,
    }));
    setLoggedUser((prevLoggedUser) => ({
      ...prevLoggedUser,
      following: prevLoggedUser.following + 1,
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
    setUser((prevUser) => ({
      ...prevUser,
      followers: prevUser.followers - 1,
    }));
    setLoggedUser((prevLoggedUser) => ({
      ...prevLoggedUser,
      following: prevLoggedUser.following - 1,
    }));
    setLoading(false);
    window.location.reload();
  };

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  const handleImageClick = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  // Fetch followers
  useEffect(() => {
    const getFollowers = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/user/${username}/followers`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        const data = await response.json();
        setFollowerCount(data.followers.length);
        setFollowers(data.followers);
      } catch (error) {
        console.error("Failed to fetch followers:", error);
      }
    };

    getFollowers();
  }, [username]);

  // Fetch following
  useEffect(() => {
    const getFollowing = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/user/${username}/following`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        const data = await response.json();
        setFollowingCount(data.following.length);
        setFollowing(data.following);
      } catch (error) {
        console.error("Failed to fetch following:", error);
      }
    };

    getFollowing();
  }, [username]);

  const handleUserClick = (username) => {
    if (username === LoggedUser.username) {
      navigate("/profile");
    } else {
      navigate(`/user/${username}`);
    }
    setIsFollowersDialogOpen(false);
    setIsFollowingDialogOpen(false);
  };

  const followersMap = new Map(followers.map(follower => [follower.username, follower]));
  console.log(followersMap,'followers');
  
  const followingMap = new Map(following.map(followingUser => [followingUser.username, followingUser]));
  console.log(followingMap, 'following');

  // Check if logged-in user is in followers list
const isLoggedUserInFollowers = followersMap.has(LoggedUser.username);

// Check if logged-in user is in following list
const isLoggedUserInFollowing = followingMap.has(LoggedUser.username);

// Conditional flag: true if logged-in user is in following list but not in followers list
const isFollowBack = isLoggedUserInFollowing && !isLoggedUserInFollowers;

console.log(isFollowBack, 'tf');

  
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Sidebar2 />
        <div className="flex-1 p-4 mt-2 md:ml-40">
          <div className="w-full max-w-5xl mx-auto">
            <div className="bg-white p-8 shadow-lg rounded-lg mb-3">
              <div className="flex items-start">
              {loading ? (
            <div className="ml-12 mt-12 m-auto">
              <ClipLoader color="gray"/>
            </div>
          ) : (
                <Avatar
                  className="w-32 h-32 border-2 cursor-pointer"
                  onClick={handleImageClick}
                >
                  <AvatarImage
                    src={user.profileImgUrl || defaultImg}
                    alt="Profile Image"
                  />
                </Avatar> )}
                <div className="ml-8 flex-1">
                  <div className="flex">
                  <h1 className="text-2xl font-bold mb-1">@{user.username}</h1>
                  <div className="flex -mt-4 ml-6">
                  {user?.username !== LoggedUser.username &&
                      <Button
                      label={isFollowed ? "Unfollow" : (isFollowBack ? "Follow Back" : "Follow")}
                      disabled={loading}
                      onClick={isFollowed ? handleUnfollow : handleFollow}
                      className={`w-[110px] ${isFollowed ? 'bg-red-600 hover:bg-red-400' : 'bg-green-600 hover:bg-green-400'} mt-4 ml-6 h-[30px]`}
                    >
                      {isFollowed ? "Unfollow" : (isFollowBack ? "Follow Back" : "Follow")}
                    </Button>
                    
                  }
                </div>
                  </div>
                  <p className="text-gray-600">{user.name}</p>
                  <p className="text-gray-500 text-[10px]">
                    - {user.occupation}
                  </p>
                  <div
                    className={`mt-4 ${
                      isExpanded ? "max-h-none" : "max-h-[55px]"
                    } overflow-hidden transition-all`}
                  >
                    <p className="text-gray-700 font-poppins text-[12px] whitespace-pre-line">
                      {user.bio}
                    </p>
                  </div>
                  <button
                    onClick={handleToggle}
                    className="text-[10px] text-blue-500 hover:underline mt-1"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                </div>
                
              </div>

              <div className="flex justify-around mt-6">
                <div className="text-center">
                  <p className="font-bold">{postData.length}</p>
                  <p className="text-gray-500 text-sm">Posts</p>
                </div>
                <Dialog
                  open={isFollowersDialogOpen}
                  onOpenChange={setIsFollowersDialogOpen}
                >
                  <DialogTrigger asChild>
                    <div
                      className="text-center cursor-pointer"
                      onClick={() => setIsFollowersDialogOpen(true)}
                    >
                      <p className="font-bold">{followerCount}</p>
                      <p className="text-gray-500 text-sm">Followers</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Followers</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[400px]">
                      { followerCount == 0 ? (
                        <p className="text-center text-gray-500">No followers found.</p>
                      ) : 
                      
                      (followers.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleUserClick(follower.username)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={follower.profileImgUrl || defaultImg}
                              alt={follower.name}
                            />
                          </Avatar>
                          <div className="ml-2">
                            <p className="font-semibold">{follower.name}</p>
                            <p className="text-sm text-gray-500">
                              @{follower.username}
                            </p>
                          </div>
                        </div>
                      )))}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <Dialog
                  open={isFollowingDialogOpen}
                  onOpenChange={setIsFollowingDialogOpen}
                >
                  <DialogTrigger asChild>
                    <div
                      className="text-center cursor-pointer"
                      onClick={() => setIsFollowingDialogOpen(true)}
                    >
                      <p className="font-bold">{followingCount}</p>
                      <p className="text-gray-500 text-sm">Following</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Following</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[400px]">
                      
                      {  followingCount == 0 ? (
                        <p className="text-center text-gray-500">No following found.</p>
                      ) : 
                      
                       (following.map((following) => (
                        <div
                          key={following.id}
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleUserClick(following.username)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={following.profileImgUrl || defaultImg}
                              alt={following.name}
                            />
                          </Avatar>
                          <div className="ml-2">
                            <p className="font-semibold">{following.name}</p>
                            <p className="text-sm text-gray-500">
                              @{following.username}
                            </p>
                          </div>
                        </div>
                      )))}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Posts grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {loading ? (
                <div className="col-span-full flex justify-center py-20">
                  <ClipLoader size={50} color="black" />
                </div>
              ) : postData.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  No Posts Available
                </div>
              ) : (
                postData.map(({ _id, imageUrl, commentCount, likes }) => (
                  <div
                    key={_id}
                    className="relative group aspect-square shadow-md overflow-hidden"
                    onClick={() => navigate(`/post/${_id}`)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Post ${_id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-4 text-white">
                        <span className="flex items-center">
                          <Heart className="mr-1" /> {likes.length}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="mr-1" /> {commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={handleCloseModal}
            >
              <img
                src={user.profileImgUrl || defaultImg}
                alt="Full Screen Profile"
                className="max-w-full max-h-full object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Others;
