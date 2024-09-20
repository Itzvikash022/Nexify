import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import defaultImg from "../../assets/default.jpg";
import Sidebar from "@/components/sidebar";
import Sidebar2 from "@/components/sidebar/sidebar2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const Profile = () => {
  const [userData, setUserData] = useState({});
  const [postData, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState([]);
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
        const data = await response.json();
        setUserData(data.userDetails);
        setPosts(data.posts);
        setSavedPosts(data.savedPosts); 
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setError("Failed to fetch user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8000/api/user/followers",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Error fetching followers");
        const data = await response.json();
        setFollowers(data.followers);
        setFollowerCount(data.followers.length);
      } catch (error) {
        console.error("Failed to fetch followers:", error);
        setError("Failed to fetch followers.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  useEffect(() => {
    const fetchFollowing = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:8000/api/user/following",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        if (!response.ok) throw new Error("Error fetching following");
        const data = await response.json();
        setFollowing(data.following);
        setFollowingCount(data.following.length);
      } catch (error) {
        console.error("Failed to fetch following:", error);
        setError("Failed to fetch following.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, []);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const PostGrid = ({ posts, isSaved = false, loading }) => (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {loading ? (
        <div className="col-span-full flex justify-center py-20">
          <ClipLoader size={50} color="black" />
        </div>
      ) : posts.length === 0 ? (
        <div className="col-span-full text-center py-20">
          {isSaved ? "No Saved Posts" : "No Posts Available"}
        </div>
      ) : (
        posts.map(({ _id, imageUrl, commentCount, likes }) => (
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
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
  

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
                    src={userData.profileImgUrl || defaultImg}
                    alt="Profile Image"
                  /> 
                </Avatar> )}
                <div className="ml-8 flex-1">
                  <h1 className="text-2xl font-bold mb-1">@{userData.username}</h1>
                  <p className="text-gray-600">{userData.name}</p>
                  <p className="text-gray-500 text-sm">
                    - {userData.occupation}
                  </p>
                  <div
                    className={`mt-4 ${isExpanded ? "max-h-none" : "max-h-[55px]"} overflow-hidden transition-all`}
                  >
                    <p className="text-gray-700 font-poppins text-[12px] whitespace-pre-line">{userData.bio}</p>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="text-center cursor-pointer">
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
                        <><p className="text-center text-gray-500">No followers found.</p>
                        <p className="text-center text-gray-500">Share your profile to let your friends know you're on Nexify!</p></>
                      ) :  
                      (followers.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/user/${follower.username}`)}
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
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="text-center cursor-pointer">
                      <p className="font-bold">{followingCount}</p>
                      <p className="text-gray-500 text-sm">Following</p>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Following</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[400px]">
                      { followingCount == 0 ? (
                        <><p className="text-center text-gray-500">You're not following anyone</p>
                        <p className="text-center text-gray-500">Follow someone to get started with your Nexify Journey!</p></>
                      ) : 
                      
                      (following.map((following) => (
                        <div
                          key={following.id}
                          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigate(`/user/${following.username}`)}
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

            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                <PostGrid posts={postData} />
              </TabsContent>
              <TabsContent value="saved">
                <PostGrid posts={savedPosts} isSaved={true} />
              </TabsContent>
            </Tabs>
          </div>

          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
              onClick={handleCloseModal}
            >
              <img
                src={userData.profileImgUrl || defaultImg}
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

export default Profile;
