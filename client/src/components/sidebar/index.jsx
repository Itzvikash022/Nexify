import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import defaultImg from '../../assets/default.jpg';

const Sidebar = ({ links, className, btn_class }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        setUser(userData.user || {});
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, []);

  useEffect(() => {
    const getFollowersCount = async () => {
      if (!user._id) return;

      try {
        const response = await fetch("http://localhost:8000/api/followerCount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
          body: JSON.stringify({ userId: user._id }),
        });

        const followerCount = await response.json();
        setFollowerCount(followerCount.followers);
      } catch (error) {
        console.error("Failed to fetch follower count:", error);
      } finally {
        setLoading(false);
      }
    };

    getFollowersCount();
  }, [user._id]);

  useEffect(() => {
    const getFollowingCount = async () => {
      if (!user._id) return;

      try {
        const response = await fetch("http://localhost:8000/api/followingCount", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
          body: JSON.stringify({ userId: user._id }),
        });

        const followingCount = await response.json();
        setFollowingCount(followingCount.following);
      } catch (error) {
        console.error("Failed to fetch follower count:", error);
      } finally {
        setLoading(false);
      }
    };

    getFollowingCount();
  }, [user._id]);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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

  return (
    <div className={`${className} bg-gradient-to-b from-purple-400 to-purple-700 text-white p-6 shadow-lg `}>
      <div className="h-[30%] flex justify-center items-center flex-col border-b border-gray-200 pb-4">
        {loading ? (
          <BarLoader size={10} color="black" />
        ) : (
          <div className="flex flex-col items-center w-full">
            <div
              className="w-[110px] h-[110px] rounded-full border-4 border-white overflow-hidden shadow-lg mb-4 cursor-pointer"
              onClick={handleImageClick}
            >
              <img
                src={user.profileImgUrl || defaultImg}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center font-poppins text-2xl font-bold tracking-wide">@{user.username}</p>
            <p
              className="mt-1 mb-4 text-center text-[15px] font-light hover:underline cursor-pointer text-gray-200"
              onClick={() => navigate('/profile')}
            >
              {user.email}
            </p>
            <div className="flex justify-around w-full px-8">
              <div className="flex flex-col items-center text-center">
                <h4 className="font-bold text-xl">{followerCount}</h4>
                <p className="text-sm text-gray-300">Followers</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <h4 className="font-bold text-xl">{followingCount}</h4>
                <p className="text-sm text-gray-300">Following</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="h-[55%] flex flex-col justify-evenly pl-8 pr-2 border-b border-gray-200">
        {links.map(({ id, name, icon, url }) => (
          <Link
            to={url}
            key={id}
            className="flex items-center p-3 mb-2 cursor-pointer transition-all hover:bg-gray-100 hover:text-purple-700 text-xl rounded-lg"
          >
            <span className="mr-3">{icon}</span>
            <span className="font-semibold">{name}</span>
          </Link>
        ))}
      </div>
      <div className="h-[15%] flex justify-center items-center p-4">
        <button
          className={`${btn_class} w-full py-2 bg-white text-purple-700 font-semibold rounded-lg shadow-md transition-all hover:bg-purple-700 hover:text-white hover:shadow-lg`}
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <img
            src={user.profileImgUrl || defaultImg}
            alt="Full Screen Profile"
            className="max-w-full max-h-full object-cover rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
