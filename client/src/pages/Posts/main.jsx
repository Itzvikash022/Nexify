import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HeartIcon,
  MessageCircleIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  TrashIcon,
  ShareIcon,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import Sidebar2 from "@/components/sidebar/sidebar2";
import { useParams, useNavigate } from "react-router-dom";
import { IconHeart, IconMessage, IconBookmark  } from "@tabler/icons-react";
import defaultImg from "../../assets/default.jpg";

const Post = () => {
  const [postData, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const getPost = async () => {
      try {
        const response = await fetch(
          `https://nexify-backend.vercel.app/api/post?id=${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        const data = await response.json();
        setPost(data.post || null);
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    };
    getPost();
  }, [id]);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch("https://nexify-backend.vercel.app/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });
        const userData = await response.json();
        setUser(userData.user || {});
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  useEffect(() => {
    const getComments = async () => {
      try {
        const response = await fetch(
          `https://nexify-backend.vercel.app/api/comments/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setComments(data.comments);
        } else {
          console.error("Failed to fetch comments:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };
    getComments();
  }, [id]);

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await fetch("https://nexify-backend.vercel.app/api/comment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
          body: JSON.stringify({
            postId: postData._id,
            userId: user._id,
            commentText: newComment,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setNewComment("");
          window.location.reload();
        } else {
          console.error("Failed to add comment:", data.message);
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    }
  };

  const handleLike = async () => {
    setLiking(true);
    try {
      const response = await fetch("https://nexify-backend.vercel.app/api/like", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: postData._id }),
      });
      const { updatedPost } = await response.json();

      // Only update the likes count while keeping the user data and other post information intact
      setPost((prevPostData) => ({
        ...prevPostData,
        likes: updatedPost.likes, // Update likes
      }));
    } catch (error) {
      console.error("Failed to like post:", error);
    } finally {
      setLiking(false);
    }
  };

  const handleUnlike = async () => {
    setLiking(true);
    try {
      const response = await fetch("https://nexify-backend.vercel.app/api/unlike", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: postData._id }),
      });
      const { updatedPost } = await response.json();

      // Only update the likes count while keeping the user data and other post information intact
      setPost((prevPostData) => ({
        ...prevPostData,
        likes: updatedPost.likes, // Update likes
      }));
    } catch (error) {
      console.error("Failed to unlike post:", error);
    } finally {
      setLiking(false); //left to implement on icons
    }
  };
  
  const handleSave = async () => {
    setSaving(true); // left to implement on icons
    try {
      const response = await fetch("https://nexify-backend.vercel.app/api/save", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: postData._id }),
      });
      const { savePost } = await response.json();

      window.location.reload();
    } catch (error) {
      console.error("Failed to Save post:", error);
    } finally {
      setSaving(false); //left to implement on icons
    }
  };

  const handleUnsave = async () => {
    setSaving(true); // left to implement on icons
    try {
      const response = await fetch("https://nexify-backend.vercel.app/api/unsave", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: postData._id }),
      });
      const { unsavePost } = await response.json();

      window.location.reload();

    } catch (error) {
      console.error("Failed to UnSave post:", error);
    } finally {
      setSaving(false); //left to implement on icons
    }
  };

    const handleCopy = () => {
      // Get the current URL
      const url = window.location.href;
  
      // Copy the URL to the clipboard
      navigator.clipboard.writeText(url).then(() => {
        // Show a success alert
        alert('Post URL copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy URL:', err);
      });
    };

  const deletePost = async () => {
    try {
      await fetch(`https://nexify-backend.vercel.app/api/delete-post?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ id: postData._id }),
      });
      navigate("/");
    } catch (error) {
      console.error("Failed to delete the post:", error);
    }
  };

  if (!postData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No post found.</p>
      </div>
    );
  }

  const isAlreadyLiked = postData.likes.includes(user._id);
  console.log(user.saves,'saves');
  console.log(user._id,'id');
  

  
  const isAlreadySaved = user.saves.includes(postData._id);
  const formattedDate = new Date(postData.createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedCommentDate = new Date(comments.createdAt).toLocaleString(
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
    <div className="flex min-h-screen w-full bg-muted">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Sidebar2 />
        <main className="flex-1 p-6 md:ml-72">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Post column */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="border cursor-pointer">
                        <AvatarImage
                          src={postData.user.profileImgUrl || defaultImg}
                          alt={"profile image"}
                          onClick={() => navigate(`/user/${postData.user.username}`)}
                        />
                      </Avatar>
                      <div>
                        <h2 className="text-lg font-semibold">
                          {postData.user.username}
                        </h2>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />{" "}
                          {postData.location}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="More options"
                        >
                          <MoreHorizontalIcon className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                        onClick={handleCopy}>
                          <ShareIcon className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        {user.username === postData.user.username && (
                          <DropdownMenuItem
                            onClick={deletePost}
                            className="text-red-600"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <img
                    src={postData.imageUrl}
                    alt="Post image"
                    className="w-auto mx-auto mb-2 lg:max-h-[600px] h-auto border-y py-2 border-box"
                  />
                  <h3 className="text-xl font-semibold mb-2">
                    {postData.caption}
                  </h3>
                  <p className="text-gray-700 mb-4">{postData.description}</p>
                  <p className="text-sm text-gray-500">
                    Posted on {formattedDate}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={isAlreadyLiked ? handleUnlike : handleLike}
                  >
                    <IconHeart
                      size={24}
                      color={isAlreadyLiked ? "red" : "black"}
                      fill={isAlreadyLiked ? "red" : "white"}
                    />
                    <span className="ml-2">{postData.likes.length} Likes</span>
                  </div>
                  <div className="flex items-center">
                    <IconMessage size={24} />
                    <span className="ml-2">{comments.length} Comments</span>
                  </div>
                  <div className="flex items-center cursor-pointer"
                    onClick={isAlreadySaved ? handleUnsave : handleSave}>
                  <IconBookmark 
                      size={24}
                      color="black"
                      fill={isAlreadySaved ? "black" : "white"}
                    />
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Comments column */}
            <div className="lg:col-span-1 max-h-screen">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Comments</h3>
                </CardHeader>
                <ScrollArea className="flex-grow max-h-screen">
                  <CardContent>
                    <ul className="space-y-4">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <li key={comment.id} className="flex space-x-3">
                            <Avatar className=" border w-8 h-8 mt-1 flex-shrink-0 cursor-pointer">
                              <AvatarImage
                                src={comment.user.profileImgUrl || defaultImg}
                                alt={`${comment.user.username}'s profile`}
                                onClick={() => navigate(`/user/${comment.user.username}`)}
                              />
                              <AvatarFallback>
                                {comment.user.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-grow">
                              <p className="font-semibold text-sm">
                                {comment.user.username}
                              </p>
                              <p className="text-sm text-gray-600 break-words w-full">
                                {comment.comment}
                              </p>
                            </div>
                          </li>
                        ))
                      ) : (
                        <p className="text-gray-600">
                          No comments yet, be the first one to leave a comment!!
                        </p>
                      )}
                    </ul>
                  </CardContent>
                </ScrollArea>
                <CardFooter>
                  <form
                    onSubmit={handleAddComment}
                    className="w-full flex space-x-2"
                  >
                    <Input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-grow"
                    />
                    <Button type="submit">Post</Button>
                  </form>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default Post;
