import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconHeart, IconMessage } from '@tabler/icons-react';
import ClipLoader from "react-spinners/ClipLoader";
import Sidebar from '../../components/sidebar';
import { links } from '../Home/data';
import defaultImg from '../../assets/default.jpg';


const Post = () => {
    const [postData, setPost] = useState(null); // Indicates no data initially
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

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

    useEffect(() => {
        const getPost = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/post?id=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    }
                });
                const data = await response.json();
                setPost(data.post || null); // Set the post or null if not found
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
                const response = await fetch("http://localhost:8000/api/user", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
                    },
                });
                const userData = await response.json();
                setUser(userData.user || {}); // Set user data or empty object
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
                const response = await fetch(`http://localhost:8000/api/comments/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`,
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setComments(data.comments); // Update the state with fetched comments
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
            const response = await fetch("http://localhost:8000/api/comment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user:token")}`,
                },
                body: JSON.stringify({
                    postId: postData._id,
                    userId: user._id,
                    commentText: newComment
                }),
            });

            const data = await response.json();
            
            if (data.success) {

                // Clear the comment input
                setNewComment('');
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
        try {
            const response = await fetch("http://localhost:8000/api/like", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user:token")}`,
                },
                body: JSON.stringify({ id: postData._id }),
            });
            const { updatedPost } = await response.json();
            setPost(updatedPost);
        } catch (error) {
            console.error("Failed to like post:", error);
        }
    };

    const handleUnlike = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/unlike", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user:token")}`,
                },
                body: JSON.stringify({ id: postData._id }),
            });
            const { updatedPost } = await response.json();
            setPost(updatedPost);
        } catch (error) {
            console.error("Failed to unlike post:", error);
        }
    };

    if (loading) {
        return <ClipLoader size={150} />;
    }

    if (!postData) {
        return <p>No post found.</p>;
    }

    const isAlreadyLiked = postData.likes.includes(user._id);
    const formattedDate = new Date(postData.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className='flex'>
            <Sidebar
                className={'w-[20%] bg-white fixed h-screen overflow-y-auto'}
                loading={loading}
                username={user.username}
                email={user.email}
                followers={user.followers}
                following={user.following}
                links={links}
                handleLogout={handleLogout}
                btn_class={'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[170px]'}
                profileImgUrl={user.profileImgUrl}
            />
            
            <div className='ml-[20%] flex w-[800px] items-center h-screen p-[20px]' id='post-section'>
                <div className="w-full justify-center ml-[10%] flex flex-col p-6 border bg-gray-100 rounded-lg">
                    <div>
                        <div className='border-b flex items-center pb-4 mb-4 cursor-pointer' onClick={() => user.username === postData.user.username ? navigate('/profile') : navigate(`/user/${postData.user.username}`)}>
                            <div className='flex justify-center flex-col items-center w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden'>
                                <img src={postData.user.profileImgUrl || defaultImg} alt="Failed to load image" className='w-full h-full object-cover' />
                            </div>
                            <div className='ml-4'>
                                <h3 className='font-semibold text-xl font-poppins'>@{postData.user.username}</h3>
                                <p className='text-[13px] font-poppins'>{formattedDate}</p>
                            </div>
                        </div>
                        <div className="flex justify-center bg-slate-500 p-1 mb-2">
                            <img
                                src={postData.imageUrl}
                                alt="Failed to load image"
                                className="w-auto rounded-lg shadow max-h-[800px]"
                            />
                        </div>
                        <div className="pb-2">
                            <h3 className="font-bold border-b">{postData.user.username} : {postData.caption}</h3>
                            <p className="break-words">{postData.description}</p>
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
                                    isAlreadyLiked ? handleUnlike() : handleLike()
                                }
                            />
                            <span>{postData.likes.length} Likes</span>
                        </div>
                        <div className="flex items-center">
                            <IconMessage
                                size={24}
                                className="mr-2"
                                cursor="pointer"
                            />
                            <span>{comments.length} Comments</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex w-[500px] flex-col h-[900px] border ml-[6%] items-center justify-center my-[2%]' id='comment-section'>
            <div className='h-[825px] w-[470px] bg-slate-600 p-4 overflow-y-auto scrollbar-hide'>
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment._id} className='bg-white p-2 my-2 rounded flex items-start'>
                            <img
                                src={comment.user.profileImgUrl} // Profile image
                                alt={`${comment.user.username}'s profile`}
                                className="w-10 h-10 rounded-full mr-4"
                            />
                            <div>
                                <p className='font-bold'>@{comment.user.username}</p>
                                <p className='font-poppins'>: {comment.comment}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-white">No comments yet. Be the first to comment!</p>
                )}
            </div>

                <div className='bg-black h-[55px] w-[470px] p-2 flex items-center'>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-2"
                    />
                    <button onClick={handleAddComment} className="text-white px-4 py-2">
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Post;
