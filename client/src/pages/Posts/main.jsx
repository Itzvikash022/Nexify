import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconHeart, IconMessage } from '@tabler/icons-react';
import ClipLoader from 'react-spinners/ClipLoader';
import Sidebar from '../../components/sidebar';
import { links } from '../Home/data';
import defaultImg from '../../assets/default.jpg';
import Button from '../../components/button/Button';
import Mainbg from '../../assets/login_background.jpg';

const Post = () => {
    const [postData, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({});
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const getPost = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/post?id=${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`,
                    },
                });
                const data = await response.json();
                setPost(data.post || null);
            } catch (error) {
                console.error('Failed to fetch post:', error);
            } finally {
                setLoading(false);
            }
        };
        getPost();
    }, [id]);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/user', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`,
                    },
                });
                const userData = await response.json();
                setUser(userData.user || {});
            } catch (error) {
                console.error('Failed to fetch user:', error);
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
                    },
                });
                const data = await response.json();
                if (data.success) {
                    setComments(data.comments);
                } else {
                    console.error('Failed to fetch comments:', data.message);
                }
            } catch (error) {
                console.error('Failed to fetch comments:', error);
            }
        };
        getComments();
    }, [id]);

    const handleAddComment = async () => {
        if (newComment.trim()) {
            try {
                const response = await fetch('http://localhost:8000/api/comment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('user:token')}`,
                    },
                    body: JSON.stringify({
                        postId: postData._id,
                        userId: user._id,
                        commentText: newComment,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    setNewComment('');
                    window.location.reload();
                } else {
                    console.error('Failed to add comment:', data.message);
                }
            } catch (error) {
                console.error('Failed to add comment:', error);
            }
        }
    };

    const handleLike = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/like', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}`,
                },
                body: JSON.stringify({ id: postData._id }),
            });
            const { updatedPost } = await response.json();
    
            // Only update the likes count while keeping the user data and other post information intact
            setPost(prevPostData => ({
                ...prevPostData,
                likes: updatedPost.likes, // Update likes
            }));
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    };
    
    const handleUnlike = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/unlike', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}`,
                },
                body: JSON.stringify({ id: postData._id }),
            });
            const { updatedPost } = await response.json();
    
            // Only update the likes count while keeping the user data and other post information intact
            setPost(prevPostData => ({
                ...prevPostData,
                likes: updatedPost.likes, // Update likes
            }));
        } catch (error) {
            console.error('Failed to unlike post:', error);
        }
    };
    

    const deletePost = async () => {
        try {
            await fetch(`http://localhost:8000/api/delete-post?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('user:token')}`,
                },
                body: JSON.stringify({ id: postData._id }),
            });
            navigate('/');
        } catch (error) {
            console.error('Failed to delete the post:', error);
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
    const formattedDate = new Date(postData.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="flex" style={{ backgroundImage: `url(${Mainbg})` }}>
            <Sidebar
                className="w-[20%] bg-white fixed h-screen overflow-y-auto"
                links={links}
                btn_class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[170px]"
            />
            <div className="ml-[25%] justify-center flex flex-col items-center w-[900px] h-screen p-10" id="post-section">
                {
                    loading ?
                    <ClipLoader
                        size={75}
                        color="black"
                    /> :
                <div className="w-full bg-white p-6 rounded-lg shadow-md">
                    {user.username === postData.user.username && (
                        <div className="mb-4 flex justify-end">
                            <Button
                                label="Delete this Post?"
                                onClick={deletePost}
                            />
                        </div>
                    )}
                    <div className="flex items-center mb-4 cursor-pointer" onClick={() => user.username === postData.user.username ? navigate('/profile') : navigate(`/user/${postData.user.username}`)}>
                        <div className="flex justify-center items-center w-16 h-16 rounded-full overflow-hidden">
                            <img src={postData.user.profileImgUrl || defaultImg} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-4">
                            <h3 className="font-semibold text-xl">@{postData.user.username}</h3>
                            <p className="text-sm text-gray-600">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="flex justify-center bg-gray-200 p-2 mb-4">
                        <img
                            src={postData.imageUrl}
                            alt="Post"
                            className="w-auto max-h-[600px] rounded-lg shadow-md"
                        />
                    </div>
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg">{postData.user.username}: {postData.caption}</h3>
                        <p className="text-gray-700">{postData.description}</p>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <div className="flex items-center cursor-pointer" onClick={isAlreadyLiked ? handleUnlike : handleLike}>
                            <IconHeart size={24} color={isAlreadyLiked ? 'red' : 'black'} fill={isAlreadyLiked ? 'red' : 'white'} />
                            <span className="ml-2">{postData.likes.length} Likes</span>
                        </div>
                        <div className="flex items-center">
                            <IconMessage size={24} />
                            <span className="ml-2">{comments.length} Comments</span>
                        </div>
                    </div>
                </div> }
            </div>
            <div className="ml-[2%] flex flex-col mt-[2%] w-[500px] h-[900px] bg-white rounded-lg shadow-lg p-6">
    {
        loading ? (
            <div className="flex justify-center items-center flex-1">
                <ClipLoader size={75} color="black" />
            </div>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment._id} className="flex items-start border-b-4 pb-2 mb-4">
                                <img
                                    src={comment.user.profileImgUrl || defaultImg}
                                    alt={`${comment.user.username}'s profile`}
                                    className="w-10 h-10 rounded-full mr-4"
                                />
                                <div>
                                    <p className="font-bold">@{comment.user.username}</p>
                                    <p className="text-gray-700"> : {comment.comment}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">No comments yet, be the first one to leave a comment!!</p>
                    )}
                </div>
                <div className="flex items-center border-t pt-4">
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full border rounded-l-lg p-2"
                    />
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
                        onClick={handleAddComment}
                    >
                        Post
                    </button>
                </div>
            </>
        )
    }
</div>

        </div>
    );
};

export default Post;
