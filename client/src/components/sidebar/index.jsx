import React from 'react';
import { Link } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import defaultImg from '../../assets/default.jpg';

const Sidebar = ({ loading, username, email, followers, following, links, handleLogout, className, btn_class, profileImgUrl }) => {
  const navigate = useNavigate();

  return (
    <div className={className}>
      <div className='h-[30%] flex justify-center items-center border-b'>
        {loading ? 
          <BarLoader size={10} color="#000000" /> : 
          <div className='flex flex-col items-center'>
            <div className='flex justify-center flex-col items-center w-[100px] h-[100px] rounded-full border-2 border-gray-200 overflow-hidden'>
              <img src={profileImgUrl || defaultImg} alt="Failed to load image" className='w-full h-full object-cover' />
            </div>
            <p className='mt-4 text-center font-poppins text-xl'>@{username}</p>
            <p className='mb-4 text-center text-[18px] hover:underline cursor-pointer'onClick={() => navigate('/profile')}>{email}</p>
            <div className='h-[50px] flex justify-around w-[300px] text-center'>
              <div className='flex flex-col justify-around items-center'>
                <h4 className='font-bold'>{followers}</h4>
                <p className='font-semibold'>Followers</p>
              </div> 
              <div className='flex flex-col justify-around items-center'>
                <h4 className='font-bold'>{following}</h4>
                <p className='font-semibold'>Following</p>
              </div> 
            </div>
          </div>
        }
      </div>
      <div className='h-[55%] flex flex-col justify-evenly pl-12 border-b'>
        {links.map(({id, name, icon, url}) => (
          <Link to={url} key={id} className='flex items-center space-x-2 cursor-pointer hover:bg-gray-300 rounded-xl border-b p-3'>
            <span className='font-bold text-xl'>{icon}</span>{name}
          </Link>
        ))}
      </div>
      <div className='h-[15%] p-12'>
        <button className={btn_class} onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
