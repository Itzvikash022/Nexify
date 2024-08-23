import React, { useEffect, useState } from 'react'
import {data} from '../Home/data'
import {IconUser, IconSearch, IconHeart, IconMessage, IconShare, IconBookmark, IconMessageCircle, IconNews} from '@tabler/icons-react'
import { useParams } from 'react-router-dom'
import Button from '../../components/button/Button'
const Others = () => {

    const {email} = useParams()
    const [postData, setData] = useState([])
    const [user, setUser] = useState({})
    const [isFollowed, setIsFollowed] = useState(false)

    useEffect(()=>{
        const getPosts = async()=>{
            const response =await fetch(`http://localhost:8000/api/others?email=${email}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('user:token')}`
                }
            })
            const postData = await response.json()
            setData(postData.posts)
            setUser(postData.userDetails)
            setIsFollowed(postData?.isFollowed)
        }
        getPosts()
    },[])

    console.log(postData, 'data');
    const postCount = postData.length

    const handleFollow = async() =>{
        const response =await fetch(`http://localhost:8000/api/follow`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('user:token')}`
            },
            body: JSON.stringify({id : user.id})
        })
        console.log(response, 'res');
        const followData = await response.json()
        setIsFollowed(followData?.isFollowed)
    }

    const handleUnfollow = async() =>{
        const response =await fetch(`http://localhost:8000/api/unfollow`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('user:token')}`
            },
            body: JSON.stringify({id : user.id})
        })
        console.log(response, 'res');
        const followData = await response.json()
        setIsFollowed(followData?.isFollowed)
    }

  return (
    <div className='flex justify-center mt-[50px]'>
        <div className='p-4 flex flex-col items-center'>
            <div className='h-[30%] flex justify-center items-center'>
                <div className='flex flex-col items-center '>
                    <div className='flex justify-center flex-col items-center w-[150px] h-[150px] rounded-full border-2 border-gray-200 '>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="130px" height="130px" color="#000000" fill="black">
                            <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                    <p className='mt-4 text-center font-bold text-xl'>{user?.username}</p>
                    <p className='mb-4 text-center text-xl'>{user?.email}</p>
                    <div className='text-lg flex justify-around w-[600px] text-center'>
                        <div className='flex flex-col justify-around items-center'>
                            <h4 className='font-bold text-xl'>{postCount}</h4>
                            <p className='text-lg font-bold'>Posts</p>
                        </div>
                        <div className='flex flex-col justify-around items-center'>
                            <h4 className='font-bold text-xl'>{user?.followers}</h4>
                            <p className='text-lg font-bold'>Followers</p>
                        </div>
                        <div className='flex flex-col justify-around items-center'>
                            <h4 className='font-bold text-xl'>{user?.following}</h4>
                            <p className='text-lg font-bold'>Following</p>
                        </div>
                    </div>
                    <div>
                        {
                            !isFollowed ?
                            <Button 
                                label='Follow' 
                                onClick={() => handleFollow()}
                                className='w-[200px] bg-green-600 hover:bg-green-400 my-6'
                            />
                            :
                            <Button 
                                label='Unfollow' 
                                onClick={() => handleUnfollow()}
                                className='w-[200px] bg-red-600 hover:bg-red-500 my-6'
                            />
                        }
                    </div>
                </div>
            </div>
            <div className='flex justify-between items-center flex-wrap border-box w-[1500px] borde mt-[50px]'>
                {
                    postData?.length > 0 &&
                    postData?.map(({_id, caption = '', description = '', imageUrl = ''}) =>{
                        return(
                            <div className='w-[450px] flex flex-col mt-[50px] m-4 p-6 border'>
                                <div>
                                    <div className='pb-4 mb-2'>
                                        <img src={imageUrl} alt="Failed to load image" className='w-full rounded-lg shadow'/>
                                    </div>
                                    <div className='pb-2'>
                                        <h3 className='font-bold border-b'>{caption}</h3>
                                        <p className='break-words'>{description}</p>
                                    </div>
                                </div>
                                <div className='flex justify-evenly font-bold mt-2'>
                                    <div className='flex items-center'>
                                        <IconHeart size={24} className='mr-2' cursor='pointer'/> 
                                        <span>10.5K Likes</span>
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
        </div>
    </div>
  )
}

export default Others