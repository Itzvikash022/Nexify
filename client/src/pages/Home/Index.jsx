import React, { useEffect, useState } from 'react'
import Input from '../../components/input/Input'
import Button from '../../components/button/Button'
import {IconUser, IconSearch, IconHeart, IconMessage, IconShare, IconBookmark, IconMessageCircle, IconNews} from '@tabler/icons-react'
import {links} from './data'
import {Link, useNavigate} from 'react-router-dom'
 
// import { links } from "./data";
const Home = () => {
    const navigate = useNavigate()
    const [postData, setData] = useState([])
    const [user, setUser] = useState({})
    const [isLiked, setIsLiked] = useState(false)

    useEffect(()=>{
        const getPosts = async()=>{
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
        }
        getPosts()
    },[])
    console.log(postData, 'data');
    const { _id = '', username = '', email = '', followers = '', following = ''  } = user || {}

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
        postData[index] = updatedPost
    }

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
        postData[index] = updatedPost
    }
  return (
    <div className='h-screen w-full bg-gray-200 flex overflow-hidden'>
        {/* SideBar one */}
        <div className='w-[20%] bg-white'>
            <div className='h-[30%] flex justify-center items-center border-b'>
                <div className='flex flex-col items-center'>
                    <div className='flex justify-center flex-col items-center w-[100px] h-[100px] rounded-full border-2 border-gray-200 '>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="75px" height="75px" color="#000000" fill="black">
                            <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                    <p className='mt-4 text-center font-bold text-xl'>{username}</p>
                    <p className='mb-4 text-center'>{email}</p>
                    <div className='h-[50px] flex justify-around w-[300px] text-center'>
                        {/* {
                            data.map(({id, name, count}) => {
                                return(
                                <div key={id} className='flex flex-col justify-around items-center'>
                                    <h4 className='font-bold'>{count}</h4>
                                    <p>{name}</p>
                                </div> 
                                )
                            })
                        } */}
                        <div className='flex flex-col justify-around items-center'>
                            <h4 className='font-bold'>{followers}</h4>
                            <p>Followers</p>
                        </div> 
                        <div className='flex flex-col justify-around items-center'>
                            <h4 className='font-bold'>{following}</h4>
                            <p>Following</p>
                        </div> 
                    </div>
                </div>
            </div>
            {/* <div className='h-[55%] flex flex-col justify-evenly pl-12  border-b'>
                <div>Home</div>
                <div>Trending</div>
                <div>Messages</div>
                <div>Profile</div>
            </div> */}
            <div className='h-[55%] flex flex-col justify-evenly pl-12 border-b'>
                {
                    links.map(({id, name, icon, url}) =>{
                        return(
                            <Link to={url} key={id} className='flex items-center space-x-2 cursor-pointer hover:text-gray-500 border-b p-3'>
                            <span className='font-bold text-xl'>{icon}</span>{name}
                            </ Link>
                        )   
                    })
                }
            </div>
            <div className='h-[15%] p-12'>'
                <Button label='Log Out'className='w-[190px] text-xl bg-black  hover:bg-gray-700'/>
            </div>
        </div>
        <div className='w-[60%] overflow-scroll h-full scrollbar-hide'>
            <div className='bg-white h-[75px] border-l flex justify-evenly pt-4 items-center sticky top-0 shadow-lg'>
                <div className='flex justify-center items-center'>
                    <Input placeholder='Search' className='w-[650px] rounder-full'/>
                    <Button icon={<IconSearch/>} className='p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center w-13 h-10 mb-4 ml-4'/>
                </div>
                <Button label='Create new Post' className='rounded bg-red-600 hover:bg-red-500 mb-4 ml-12 ' onClick={()=> navigate('/new-post')}/>
            </div>

                {/* POST Mapping */}
            {
                postData?.map(({_id = '', caption = '', description = '', imageUrl = '', likes = [] .user = {}. likes = []}, index) => {
                    const isAlreadyLiked = likes.length > 0 && likes.includes(user._id)
                    return(
                        <div className='bg-white w-[78%] mx-auto mt-32 p-8 rounded-md'>
                            <div className='border-b flex items-center pb-4 mb-4 cursor-pointer' onClick={()=> email === user.email ? navigate('/profile') : navigate(`/user/${user?.email }`)}>
                                <div className='w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50px" height="50px" color="#000000" fill="none">
                                        <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
                                    </svg>
                                </div>
                                <div className='ml-4'>
                                    <h3 className='font-bold text-xl'>{user.username}</h3>
                                    <p>{user.email}</p>
                                </div>
                            </div>
                            <div className='border-b pb-4 mb-2'>
                                <img src={imageUrl} alt="Failed to load image" className='w-full rounded-lg bg-gray-200'/>
                            </div>
                            <div className='pb-2'>
                                <p>{caption}</p>
                            </div>
                            <div className='border-b pb-2'>
                                {description}
                            </div>
                            <div className='flex justify-evenly font-bold mt-2'>
                                <div className='flex items-center'>
                                    <IconHeart size={24} className='mr-2' color={isAlreadyLiked? 'red' : 'black'} fill={isAlreadyLiked? 'red' : 'white'} cursor='pointer' onClick={()=> isAlreadyLiked? handleUnlike(_id, index) : handleLike(_id, index)}/> 
                                    <span>{likes.length} Likes</span>
                                </div>
                                <div className='flex items-center'>
                                    <IconMessage size={24} className='mr-2' cursor='pointer'/> 
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