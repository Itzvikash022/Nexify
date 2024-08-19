import React from 'react'
import Input from '../../components/input/Input'
import Button from '../../components/button/Button'
import postImg from '../../assets/web.png'

const Home = () => {
  return (
    <div className='h-screen w-full bg-slate-300 flex overflow-hidden'>
        {/* SideBar one */}
        <div className='w-[20%] bg-white'>
            <div className='h-[30%] flex justify-center items-center border-b'>
                <div>
                    <div className='flex flex-col items-center'>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="75px" height="75px" color="#000000" fill="black">
                            <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                    <p className='my-4 text-center'>Username here</p>
                    <div className='h-[50px] flex justify-around w-[300px] text-center'>
                        <div className='flex flex-col justify-around items-center'>
                            <h4>1000</h4>
                            <p>Posts</p>
                        </div>
                        <div>
                            <h4>1000</h4>
                            <p>Following</p>
                        </div>
                        <div>
                            <h4>1000</h4>
                            <p>Followers</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='h-[55%] flex flex-col justify-evenly pl-12  border-b'>
                <div>Home</div>
                <div>Trending</div>
                <div>Messages</div>
                <div>Profile</div>
            </div>
            <div className='h-[15%] pt-10'>'
                <div className='ml-10 cursor-pointer'>
                    Log out
                </div>
            </div>
        </div>
        <div className='w-[60%] overflow-scroll h-full scrollbar-hide'>
            <div className='bg-white h-[75px] border-l flex justify-evenly pt-4 items-center'>
                <div className='flex justify-center items-center'>
                    <Input placeholder='Search'/>
                    <Button label='Search'className='mb-4 ml-4'/>
                </div>
                <Button label='Create new Post' className='rounded bg-red-400 hover:bg-red-500 mb-4 '/>
            </div>
            <div className='bg-white w-[60%] mx-auto mt-32 p-8'>
                <div className='border-b flex items-center pb-4 mb-4'>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50px" height="50px" color="#000000" fill="none">
                            <path d="M6.57757 15.4816C5.1628 16.324 1.45336 18.0441 3.71266 20.1966C4.81631 21.248 6.04549 22 7.59087 22H16.4091C17.9545 22 19.1837 21.248 20.2873 20.1966C22.5466 18.0441 18.8372 16.324 17.4224 15.4816C14.1048 13.5061 9.89519 13.5061 6.57757 15.4816Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z" stroke="currentColor" stroke-width="1.5" />
                        </svg>
                    </div>
                    <div className='ml-4'>
                        <h3>Name here</h3>
                        <p>@Username here</p>
                    </div>
                </div>
                <div className='border-b pb-4 mb-4'>
                    <img src={postImg} alt="Failed to load image"/>
                </div>
                <div className='flex justify-evenly'>
                    <div>10.5K Likes</div>
                    <div>10.5K Comments</div>
                    <div>10.5K Shares</div>
                </div>
            </div>
            
        </div>
        <div className='w-[20%] bg-[#F2F5F8]'></div>
    </div>
  )
}

export default Home