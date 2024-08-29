import React, { useEffect, useState } from 'react'
import Input from '../../components/input/Input'
import Button from '../../components/button/Button'
import {IconUser, IconSearch, IconHeart, IconMessage, IconShare, IconBookmark, IconMessageCircle, IconNews} from '@tabler/icons-react'
import {links} from './data'
import {Link, useNavigate} from 'react-router-dom'
import ClipLoader from "react-spinners/ClipLoader";
import BarLoader from "react-spinners/BarLoader";
import Sidebar from '../../components/sidebar'

 
// import { links } from "./data";
const Home = () => {
    const navigate = useNavigate()
    const [postData, setData] = useState([])
    const [user, setUser] = useState({})
    const [loading, setLoading] = useState(false)
    const truncateText = (text, maxLength) => {
        if (text.length > maxLength) {
          return text.substring(0, maxLength) + "...";
        }
        return text;
      };
    useEffect(()=>{
        const getPosts = async()=>{
            setLoading(true)
            const response =await fetch('http://localhost:8000/api/feed',{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('user:token')}`
                }
            })
            const postData = await response.json()
            setData(postData.posts)
            setUser(postData.user)
            setLoading(false)
        }
        getPosts()
    },[])
    console.log(postData, 'data');
    const { _id = '', username = '', email = '', followers = '', following = '', profileImgUrl  } = user || {}

    const handleLike = async (_id, index) =>{
        const response =await fetch('http://localhost:8000/api/like',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('user:token')}`
            },
            body: JSON.stringify({ id: _id })
        }) 
        const { updatedPost} = await response.json()
        const updatePost = postData.map((post, i) => {
            if( i === index) return updatedPost
            else return post
        })
        // postData[index] = updatedPost
        setData(updatePost)
    }

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

    const handleUnlike = async (_id, index) =>{
        const response =await fetch('http://localhost:8000/api/unlike',{
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('user:token')}`
            },
            body: JSON.stringify({ id: _id })
        }) 
        const { updatedPost} = await response.json()
        const updatePost = postData.map((post, i) => {
            if( i === index) return updatedPost
            else return post
        })
        // postData[index] = updatedPost
        setData(updatePost)
        
        
    }
  return (
    <div className='h-screen w-full bg-gray-200 flex overflow-hidden'>
        {/* SideBar one */}
        <Sidebar
        className={'w-[20%] bg-white'}
        loading={loading}
        username={username}
        email={email}
        followers={followers}
        following={following}
        links={links}
        handleLogout={handleLogout}
        btn_class={'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[170px]'}
        profileImgUrl={profileImgUrl}/>
        
        {/* Main Content */}
        <div className='w-[60%] overflow-scroll h-full scrollbar-hide'>
            <div className='bg-white h-[75px] border-l flex justify-evenly pt-4 items-center sticky top-0 shadow-lg'>
                <div className='flex justify-center items-center'>
                    <b>Nexify Logo here</b>
                </div>
                <Button label='Create new Post' className='rounded bg-red-600 hover:bg-red-500 mb-4 ml-12' onClick={()=> navigate('/new-post')}/>
            </div>

                {/* POST Mapping */}
            {
                loading ?
                <div className='flex flex-col h-full items-center justify-center'>
                    <ClipLoader size={60}/>
                </div> :
                postData?.map(({_id = '', caption = '', description = '',createdAt = '', imageUrl = '', likes = [], user: postUser = {}}, index) => {
                    const isAlreadyLiked = likes.length > 0 && likes.includes(user._id)
                    console.log(user._id);
                    const formattedDate = new Date(createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                
                    return(
                        <div className='bg-white w-[78%] mx-auto mt-32 p-8 rounded-md'>
                            <div className='border-b flex items-center pb-4 mb-4 cursor-pointer' onClick={()=> username === postUser.username ? navigate('/profile') : navigate(`/user/${postUser?.username }`)}>
                            <div className='flex justify-center flex-col items-center w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden'>
                                <img src={postUser.profileImgUrl} alt="Failed to load image" className='w-full h-full object-cover' />
                            </div>
                                <div className='ml-4'>
                                    <h3 className='font-semibold text-xl font-poppins'>@{postUser.username}</h3>
                                    <p className='text-[13px] font-poppins'>{formattedDate}</p>
                                </div>
                            </div>
                            <div className='border-b pb-4 mb-2 cursor-pointer' onClick={() => navigate(`/post/${_id}`)}>
                                <img src={imageUrl} alt="Failed to load image" className='w-full rounded-lg bg-gray-200'/>
                            </div>

                            <div className='border-b pb-2'>
                                <p className='font-poppins'><b>{postUser.username} :</b> {caption}</p>
                            </div>
                            <div className='border-b pb-2 '>
                                <p className="break-words font-poppins">
                                {truncateText(description, 100)}
                                </p>
                            </div>
                            <div className='flex justify-evenly font-bold mt-2'>
                                <div className='flex items-center'>
                                    <IconHeart size={24} className='mr-2' color={isAlreadyLiked? 'red' : 'black'} fill={isAlreadyLiked? 'red' : 'white'} cursor='pointer' onClick={()=> isAlreadyLiked? handleUnlike(_id, index) : handleLike(_id, index)}/> 
                                    <span>{likes.length} Likes</span>
                                </div>
                                <div className='flex items-center'>
                                    <IconMessage size={24} className='mr-2' cursor='pointer' onClick={() => navigate(`/post/${_id}`)}/> 
                                    <span>10.5K Comments</span>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
        <div className='w-[20%] bg-[#F2F5F8]'></div>
    </div>
  )
}

export default Home