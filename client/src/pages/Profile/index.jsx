import React, { useEffect, useState } from 'react'
import { IconHeart, IconMessage } from '@tabler/icons-react'

const Profile = () => {
    const [postData, setPosts] = useState([])
    const [user, setUser] = useState({})

    useEffect(() => {
        const getPosts = async () => {
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('user:token')}`
                }
            })
            const postData = await response.json()
            setPosts(postData.posts)
            setUser(postData.userDetails)
        }
        getPosts()
    }, [])

    const postCount = postData.length

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
        <div className='flex flex-col items-center mt-[50px]'>
            {/* Profile Header */}
            <div className='flex flex-col items-center'>
                <div className='flex justify-center flex-col items-center w-[150px] h-[150px] rounded-full border-2 border-gray-200'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="130px" height="130px" color="#000000" fill="black">
                        <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
                    </svg>
                </div>
                <p className='mt-4 text-center font-bold text-xl'>{user?.username}</p>
                <p className='mb-4 text-center text-xl'>{user?.email}</p>
                <div className='text-lg flex justify-around w-[600px] text-center mb-6'>
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
            </div>

            {/* Grid for Posts */}
            <div className='flex justify-center w-full'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[50px] p-6 border mt-6 w-[1500px]'>
                    {postData.length > 0 ? (
                        postData.map(({ _id, caption = '', description = '', imageUrl = '' }) => (
                            <div key={_id} className='w-full justify-center flex flex-col p-6 border bg-gray-100 rounded-lg'>
                                <div>
                                    <div className='pb-4 mb-2'>
                                        <img src={imageUrl} alt="Failed to load image" className='w-full rounded-lg shadow' />
                                    </div>
                                    <div className='pb-2'>
                                        <h3 className='font-bold border-b'>{caption}</h3>
                                        <p className='break-words'>{description}</p>
                                    </div>
                                </div>
                                <div className='flex justify-evenly font-bold mt-2'>
                                    <div className='flex items-center'>
                                        <IconHeart size={24} className='mr-2' cursor='pointer' />
                                        <span>10.5K Likes</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <IconMessage size={24} className='mr-2' cursor='pointer' />
                                        <span>10.5K Comments</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='col-span-3 text-center text-xl font-semibold text-gray-500'>
                            No posts available
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
