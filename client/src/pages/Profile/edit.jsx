import React, { useEffect, useState } from "react";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";
import { BarLoader, ClipLoader } from "react-spinners";
import bg_img from "../../assets/login_background.jpg";
import defaultImg from '../../assets/default.jpg'

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [user, setUser] = useState({});
  const [url, setUrl] = useState(null);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && !file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    setData({ ...data, img: file });
  };

  const uploadImage = async () => {
    setLoading(true);
    if (!data.img) return user.profileImgUrl;

    const formData = new FormData();
    formData.append("file", data.img);
    formData.append("upload_preset", "nexify");
    formData.append("cloud_name", "dlam9v1ev");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlam9v1ev/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (res.ok) {
      const responseJson = await res.json();
      return responseJson.secure_url;
    } else {
      setLoading(false);
      return user.profileImgUrl;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const secure_url = await uploadImage();
    setUrl(secure_url);

    const updatedData = {
      ...(data.username && { username: data.username }),
      ...(data.email && { email: data.email }),
      ...(data.password && { password: data.password }),
      ...(data.occupation && { occupation: data.occupation }),
      profileImgUrl: secure_url,
    };

    const res = await fetch(
      `http://localhost:8000/api/edit-profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify(updatedData),
      }
    );

    setLoading(false);

    if (res.status === 200) {
      navigate("/profile");
    } else {
      const errorText = await res.text();
      alert(errorText || "Update failed. Please try again later");
    }
  };

  return (
    <div 
      className="flex flex-col justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      <div className="flex bg-gray-100 w-[1100px] rounded-lg shadow-lg">
        {/* Sidebar with Profile Image and Details */}
        <div className="w-[28%] bg-blue-100 flex flex-col items-center rounded-l-lg p-6 border-r">
          {loading ? (
            <div className="mt-32">
              <BarLoader />
            </div>
          ) : (
            <>
              <div className='w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden mb-4'>
                <img src={user.profileImgUrl || defaultImg} alt="Profile" className='w-full h-full object-cover' />
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-2">{user.username}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </>
          )}
        </div>

        {/* Form for Editing Profile */}
        <div className="w-2/3 p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <ClipLoader size={75} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File input for selecting a new profile image */}
              <div>
                <input type="file" id="image" name="profileImg" className="hidden" onChange={handleImageChange} />
                <label htmlFor="image" className="block cursor-pointer py-3 px-4 border rounded-lg shadow-sm text-center bg-gray-100 hover:bg-gray-200">
                  {data?.img?.name || 'Upload Profile Image'}
                </label>
              </div>

              {/* Text inputs for username, occupation, email, and password */}
              <Input
                label="Username"
                type="text"
                name="username"
                placeholder="Enter your Username"
                value={data.username || user.username || ""}
                onChange={(e) => setData({ ...data, username: e.target.value })}
                required={false}
                className="p-2 border rounded-md w-full"
              />
              <Input
                label="Occupation"
                type="text"
                name="occupation"
                placeholder="Enter your Occupation"
                value={data.occupation || user.occupation || ""}
                onChange={(e) => setData({ ...data, occupation: e.target.value })}
                required={false}
                className="p-2 border rounded-md w-full"
              />
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={data.email || user.email || ""}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                required={false}
                className="p-2 border rounded-md w-full"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Enter your password (optional)"
                value={data.password || ""}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                required={false}
                className="p-2 border rounded-md w-full"
              />

              {/* Submit and Cancel buttons */}
              <div className="flex space-x-4 mt-4">
                <Button label="Save Changes" className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600" />
                <Button label="Cancel" onClick={() => navigate('/profile')} className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400" />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
