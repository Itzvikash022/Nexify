import React, { useEffect, useState } from "react";
import Input from "../../components/input/Input";
import Button from "../../components/button/Button";
import { useNavigate } from "react-router-dom";
import { BarLoader, ClipLoader } from "react-spinners";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [user, setUser] = useState({});
  const [url, setUrl] = useState(null);

  console.log(user);

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

    // Validate file type
    if (file && !file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    setData({ ...data, img: file });
};

  const uploadImage = async () => {
    setLoading(true);
    if (!data.img) return user.profileImgUrl; // If no new image is selected, use the existing URL

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
      console.log("Upload successful");
      const responseJson = await res.json();
      return responseJson.secure_url;
    } else {
      setLoading(false)
      console.error("Failed to upload image");
      return user.profileImgUrl; // Fallback to the existing image URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit");

    setLoading(true);

    const secure_url = await uploadImage();
    setUrl(secure_url);

    // Create the payload for fields that are updated
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

    console.log(res, "res");

    // Edit profile handling
    if (res.status === 200) { // 200 OK for update
      setLoading(false);
      console.log('updated profile');
      
      navigate("/profile");
    } else if (res.status === 400) {
      setLoading(false);
      const errorText = await res.text();
      alert(errorText || "User already exists");
    } else {
      setLoading(false);
      alert("Update failed. Please try again later");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-[85px]">
      <div className="flex bg-gray-200 h-[750px] border w-[1500px]">
        <div className="w-[30%] bg-blue-300 flex flex-col items-center ">
          {
            loading ? 
            <div className="mt-[180px]">
              <BarLoader/> 
            </div> :
            <><div className='flex justify-center flex-col items-center w-[100px] h-[100px] rounded-full border-2 border-gray-200 overflow-hidden mt-[70px]'>
                <img src={user.profileImgUrl} alt="Failed to load image" className='w-full h-full object-cover' />
              </div><p>{user.username}</p><p>{user.email}</p></>
          }
        </div>

        <div className="w-[80%] bg-red-50 flex items-center justify-center">
            {
              loading ? 
                <ClipLoader size={75}/> :
          <><form onSubmit={handleSubmit}>
                {/* File input for selecting a new profile image */}
               <div>
                    <Input type='file' id='image' name='profileImg' className='py-4 hidden' onChange={handleImageChange} required={false}/>
                    <label htmlFor="image" className='cursor-pointer p-4 border shadow w-full'>{data?.img?.name || 'Upload Post'}</label>
                </div> 
                
                {/* Text inputs for username, occupation, email, and password */}

                <Input
                  label="Username"
                  type="text"
                  name="username"
                  placeholder="Enter your Username"
                  value={data.username || user.username || ""}
                  onChange={(e) => setData({ ...data, username: e.target.value })}
                  required={false} />
                <Input
                  label="Occupation"
                  type="text"
                  name="occupation"
                  placeholder="Enter your Occupation"
                  value={data.occupation || user.occupation || ""}
                  onChange={(e) => setData({ ...data, occupation: e.target.value })}
                  required={false} />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={data.email || user.email || ""}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  required={false} />
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Enter your password (optional)"
                  value={data.password || ""}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                  required={false} />
                {/* Submit button for the form */}
                <Button label="Edit Profile" />
              </form><Button label="Cancel" onClick={() => navigate('/profile')} /></>
            }
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
