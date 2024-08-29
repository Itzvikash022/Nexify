import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/sidebar';
import { links } from '../Home/data';
import { useNavigate } from 'react-router-dom';
import bg_img from "../../assets/create_post_bg.jpg";

const Explore = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length > 0) {
      const delayDebounceFn = setTimeout(() => {
        fetch(`http://localhost:8000/api/search-users?username=${query}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setResults(data))
          .catch((error) => console.error('Error fetching users:', error));
      }, 300); // Debounce delay

      return () => clearTimeout(delayDebounceFn);
    } else {
      setResults([]); // Clear results if the query is empty
    }
  }, [query]);

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

  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

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

      <div className='flex flex-col items-center h-screen ml-[20%] w-[80%] p-4 bg-cover bg-no-repeat bg-center' style={{ 
            backgroundImage: `url(${bg_img})`}}>
        <input
          type="text"
          placeholder="Search by username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-6 w-[600px] h-[50px] text-center rounded-md border-2 border-gray-300 p-3 focus:outline-none focus:border-blue-500"
        />

        <div className={`bg-white rounded-lg w-[600px] border mt-6 scrollbar-hide overflow-y-auto p-4 shadow-lg ${results.length > 0 ? 'h-auto' : 'h-[300px]'}`}>
          {results.length > 0 ? (
            results.map((user) => (
              <div
                key={user._id}
                className="flex items-center p-4 cursor-pointer border-b hover:bg-gray-100 mb-2 rounded-md transition duration-300 ease-in-out"
                onClick={() => handleUserClick(user.username)}
              >
                <img
                  src={user.profileImgUrl || 'default-profile.png'} // Fallback image
                  alt={`${user.username}'s profile`}
                  className="w-14 h-14 rounded-full object-cover mr-4"
                />
                <div className="ml-4">
                  <div className="text-xl font-semibold">@{user.username}</div>
                  <div className="text-md text-gray-600 mt-1">Followers: {user.followers}</div>
                </div>
              </div>
            ))
          ) : (
            query.length > 0 && (
              <div className="flex justify-center mt-6 font-bold text-gray-700">No Users Found</div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
