import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import defaultImg from "../../assets/default.jpg";
import {
  IconSettings,
  IconBrandInstagram,
  IconCompass,
  IconUser,
  IconLogout,
  IconLayoutGrid,
} from "@tabler/icons-react";
import ClipLoader from "react-spinners/ClipLoader";

const Sidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        const response = await fetch(
          "http://localhost:8000/api/followerCount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
            body: JSON.stringify({ userId: user._id }),
          }
        );

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
        const response = await fetch(
          "http://localhost:8000/api/followingCount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("user:token")}`,
            },
            body: JSON.stringify({ userId: user._id }),
          }
        );

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
        navigate("/account");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 flex-col border-r bg-background shadow-lg sm:flex">
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link
          href="#"
          className="flex items-center gap-2 font-bold"
          prefetch={false}
        >
          <IconBrandInstagram className="h-6 w-6" />
          <span className="text-lg">Nexify</span>
        </Link>
        <div className="relative inline-block text-left">
          {/* Settings button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleMenu}
          >
            <IconSettings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div
                className="py-1"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="options-menu"
              >
                <a
                  href="/new-post"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Create New Post
                </a>
                <a
                  href="/edit-profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Edit Profile
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Settings
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col items-center gap-4 pb-4 border-b">
          {loading ? (
            <div className="mt-9">
              <ClipLoader />
            </div>
          ) : (
            <Avatar className="h-20 w-20 border">
              <img
                src={user.profileImgUrl || defaultImg}
                alt="User"
                className="w-full h-full object-cover object-top cursor-pointer"
                onClick={handleImageClick}
              />
            </Avatar>
          )}
          <div className="text-center">
            <div className="text-lg font-semibold">{user.name}</div>
            <div className="text-sm text-muted-foreground">
              @{user.username}
            </div>
          </div>
          <div className="flex w-full justify-around text-sm font-medium">
            <div className="flex flex-col items-center">
              <div>{followerCount}</div>
              <div className="text-muted-foreground">Followers</div>
            </div>
            <div className="flex flex-col items-center">
              <div>{followingCount}</div>
              <div className="text-muted-foreground">Following</div>
            </div>
          </div>
        </div>
        <nav className="mt-8 grid gap-[20px]">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            prefetch={false}
          >
            <IconLayoutGrid className="h-5 w-5" />
            Home
          </Link>
          <Link
            to="/explore"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            prefetch={false}
          >
            <IconCompass className="h-5 w-5" />
            Explore
          </Link>
          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            prefetch={false}
          >
            <IconUser className="h-5 w-5" />
            MyProfile
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            onClick={handleLogout}
          >
            <IconLogout className="h-5 w-5" />
            Logout
          </Button>
        </nav>
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
    </aside>
  );
};

export default Sidebar;
