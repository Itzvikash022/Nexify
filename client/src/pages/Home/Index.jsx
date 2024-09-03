import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { IconHeart, IconMessage } from '@tabler/icons-react';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import Sidebar from '../../components/sidebar';
import defaultImg from '../../assets/default.jpg';
import Mainbg from '../../assets/login_background.jpg';
import { links } from './data';

const Home = () => {
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
                const response = await fetch('http://localhost:8000/api/feed', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('user:token')}`
                    }
                });

                if (response.status === 401) {
                    const data = await response.json();
                    if (data === 'Token expired') {
                        alert('Your session has expired. Please log in again.');
                        localStorage.removeItem('user:token');
                        navigate('/ac/signin');
                        return;
                    }
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }

                const postData = await response.json();
                setData(postData.posts);
                setUser(postData.user);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        getPosts();
    }, [navigate]);

    const handleLike = async (_id, index) => {
        try {
            const response = await fetch('http://localhost:8000/api/like', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('user:token')}`
                },
                body: JSON.stringify({ id: _id })
            });

            const { updatedPost } = await response.json();

            const updatePost = postData.map((post, i) => 
                i === index ? { ...updatedPost, user: { ...post.user, profileImgUrl: post.user.profileImgUrl } } : post
            );

            setData(updatePost);
        } catch (error) {
            console.error('Error liking the post:', error);
        }
    };

    const handleUnlike = async (_id, index) => {
        try {
            const response = await fetch('http://localhost:8000/api/unlike', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('user:token')}`
                },
                body: JSON.stringify({ id: _id })
            });

            const { updatedPost } = await response.json();

            const updatePost = postData.map((post, i) => 
                i === index ? { ...updatedPost, user: { ...post.user, profileImgUrl: post.user.profileImgUrl } } : post
            );

            setData(updatePost);
        } catch (error) {
            console.error('Error unliking the post:', error);
        }
    };

    const { username = '' } = user || {};

    return (
        <div className='h-screen w-full bg-gray-100 flex overflow-hidden bg-cover bg-center' style={{ backgroundImage: `url(${Mainbg})` }}>
            {/* Sidebar */}
            <div className='w-[20%] shadow-md'>
                <Sidebar
                    className='h-full'
                    links={links}
                    btn_class='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full'
                />
            </div>

            {/* Main Content */}
            <div className='w-[60%] overflow-y-auto h-full scrollbar-hide'>
                <div className='bg-gradient-to-b from-purple-400 to-purple-400 text-white h-16 flex items-center px-6 sticky  shadow-md'>
                    <div className='text-xl md:text-2xl font-bold'>
                        Nexify
                    </div>
                    <Button label='Create new Post' className='ml-auto rounded bg-white text-blue-700 hover:bg-gray-200 px-4 py-2 font-semibold' onClick={() => navigate('/new-post')} />
                </div>

                {/* POST Mapping */}
                {loading ? (
                    <div className='flex flex-col h-full items-center justify-center'>
                        <ClipLoader size={80} color="black" />
                    </div>
                ) : (
                    postData.map(({ _id = '', caption = '', description = '', createdAt = '', imageUrl = '', commentCount = '', likes = [], user: postUser = {} }, index) => {
                        const isAlreadyLiked = likes.includes(user._id);
                        const formattedDate = new Date(createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <div key={_id} className='bg-white w-[80%] mx-auto mt-10 p-6 rounded-lg  shadow-lg'>
                                <div className='border-b pb-4 flex items-center cursor-pointer' onClick={() => username === postUser.username ? navigate('/profile') : navigate(`/user/${postUser?.username}`)}>
                                    <div className='w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300'>
                                        <img src={postUser.profileImgUrl || defaultImg} alt="Profile" className='w-full h-full object-cover' />
                                    </div>
                                    <div className='ml-4'>
                                        <h3 className='font-semibold text-xl'>@{postUser.username}</h3>
                                        <p className='text-sm text-gray-500'>{formattedDate}</p>
                                    </div>
                                </div>
                                <div className='my-4 cursor-pointer flex justify-center bg-gray-100 rounded-lg' onClick={() => navigate(`/post/${_id}`)}>
                                    <img src={imageUrl} alt="Post" className='rounded-lg max-h-[600px] object-cover' />
                                </div>
                                <div className='border-b pb-2'>
                                    <p className='font-semibold'><b>{postUser.username} :</b> {caption}</p>
                                </div>
                                <div className='border-b pb-2'>
                                    <p className='text-gray-700'>
                                        {truncateText(description, 100)}
                                    </p>
                                </div>
                                <div className='flex justify-around mt-4 text-gray-700'>
                                    <div className='flex items-center'>
                                        <IconHeart 
                                            size={24} 
                                            className='mr-2 cursor-pointer' 
                                            color={isAlreadyLiked ? 'red' : 'black'} 
                                            fill={isAlreadyLiked ? 'red' : 'white'} 
                                            onClick={() => isAlreadyLiked ? handleUnlike(_id, index) : handleLike(_id, index)} 
                                        />
                                        <span>{likes.length} Likes</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <IconMessage size={24} className='mr-2 cursor-pointer' onClick={() => navigate(`/post/${_id}`)} />
                                        <span>{commentCount} Comments</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Right Sidebar or extra space */}
            <div className='w-1/5 bg-gray-50 p-4 hidden md:block'>
                <div className='bg-white p-4 rounded-lg shadow-md'>
                    <h3 className='font-semibold text-lg mb-4'>Trending Now</h3>
                    {/* Placeholder content for trending posts or suggestions */}
                    <div className='flex flex-col space-y-4'>
                        <div className='flex items-center mb-2'>
                            <img src={defaultImg} alt="Trending" className='w-10 h-10 rounded-full object-cover' />
                            <div className='ml-3'>
                                <p className='font-semibold'>Post Title</p>
                                <p className='text-xs text-gray-500'>Description</p>
                            </div>
                        </div>
                        <div className='flex items-center mb-2'>
                            <img src={defaultImg} alt="Trending" className='w-10 h-10 rounded-full object-cover' />
                            <div className='ml-3'>
                                <p className='font-semibold'>Post Title</p>
                                <p className='text-xs text-gray-500'>Description</p>
                            </div>
                        </div>
                        <div className='flex items-center mb-2'>
                            <img src={defaultImg} alt="Trending" className='w-10 h-10 rounded-full object-cover' />
                            <div className='ml-3'>
                                <p className='font-semibold'>Post Title</p>
                                <p className='text-xs text-gray-500'>Description</p>
                            </div>
                        </div>
                        {/* Repeat the above div for more items */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
