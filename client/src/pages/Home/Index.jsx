import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent, CardFooter,} from "@/components/ui/card";
import Sidebar from "@/components/sidebar";
import Sidebar2 from "@/components/sidebar/sidebar2";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { IconHeart, IconMessageCircle } from "@tabler/icons-react";

const Test = () => {
  const navigate = useNavigate();
  const [postData, setData] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(false);

  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

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

  const { username = "" } = user || {};

  return (
    <div className="flex min-h-screen w-full bg-muted">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Sidebar2 />
        <main className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 p-8">
          <div className="hidden md:block" />
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
                    <Card className="overflow-hidden rounded-lg shadow-sm max-w-xl mx-auto">
                      <CardHeader className="flex items-start justify-between gap-4 border-b bg-muted p-4">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => username === postUser.username ? navigate('/profile') : navigate(`/user/${postUser?.username}`)}>
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
                      <CardContent className="p-0 cursor-pointer" onClick={() => navigate(`/post/${_id}`)}>
                        <img
                          src={imageUrl}
                          width={400}
                          height={400}
                          alt="Post image"
                          className="aspect-square w-full object-cover"
                        />
                      </CardContent>
                        <div className="bg-muted p-1 pl-[15px] pt-[9px] font-poppins text-sm"><span className="font-semibold">@{postUser.username}</span> : {caption || "No caption"}</div>
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
                        <div className='flex items-center'>
                            <IconMessageCircle size={22}  className='mr-2 cursor-pointer' onClick={() => navigate(`/post/${_id}`)} />
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
        </main>
      </div>
    </div>
  );
};
export default Test;
