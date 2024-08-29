import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconHeart, IconMessage } from '@tabler/icons-react';
import ClipLoader from "react-spinners/ClipLoader";
import Sidebar from '../../components/sidebar';
import { links } from '../Home/data';

const Post = () => {
    const [postData, setPost] = useState(null); // Changed to null to indicate no data initially
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    
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
            setLoading(true);
                const response = await fetch(`http://localhost:8000/api/post?id=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`
                    }
                });
                const data = await response.json();
                setPost(data.post); // Directly set the post object
        };
        getPost();
    }, [id, navigate]);

    useEffect(() => {
        const getUsers = async () => {
            setLoading(true);
            const response = await fetch("http://localhost:8000/api/user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("user:token")}`,
                },
            });
            const userData = await response.json();
            setUser(userData.user);
            setLoading(false);
        };
        getUsers();
    }, []);

    const handleLike = async () => {
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
    };
    
    const handleUnlike = async () => {
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
    };

    if (!postData) {
        return <p>No post found.</p>;
    }

    const isAlreadyLiked = postData.likes.includes(user._id);

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

            <div className='ml-[20%] flex w-[800px] items-center h-screen p-[20px]'>
                <div className="w-full justify-center ml-[10%] flex flex-col p-6 border bg-gray-100 rounded-lg">
                    <div>
                        <div className="pb-4 mb-2">
                            <img
                                src={postData.imageUrl}
                                alt="Failed to load image"
                                className="w-full rounded-lg shadow max-h-[800px]"
                            />
                        </div>
                        <div className="pb-2">
                            <h3 className="font-bold border-b">{postData.caption}</h3>
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
                            <span>10.5K Comments</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex w-[500px] flex-col h-[900px] border ml-[6%] items-center justify-center my-[2%]'>
                <div className='h-[825px] w-[470px] bg-slate-600'></div>
                <div className=' bg-black h-[55px] w-[470px]'></div>
            </div>
        </div>
    );
};

export default Post;
