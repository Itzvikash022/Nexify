import React, { useState, useEffect } from 'react';
import Input from '../../components/input/Input';
import Button from '../../components/button/Button';
import { useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";
import { links } from '../Home/data';
import Sidebar from '../../components/sidebar';
import bg_img from "../../assets/login_background.jpg";

const CreatePost = () => {
    const [data, setData] = useState({
        caption: '',
        desc: '',
        img: null,
    });

    const [url, setUrl] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState({});
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
    
        if (file && !file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }
    
        setData({ ...data, img: file });
        setPreviewUrl(URL.createObjectURL(file)); // Set preview URL
    };

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

    
    const uploadImage = async() => {
        const formData = new FormData();
        formData.append('file', data.img);
        formData.append('upload_preset', 'nexify');
        formData.append('cloud_name', 'dlam9v1ev'); 

        const res = await fetch('https://api.cloudinary.com/v1_1/dlam9v1ev/upload', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            console.log('Upload successful');
            const responseJson = await res.json();
            return responseJson.secure_url;
        } else {
            console.error('Failed to upload image');
            return 'error';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const secure_url = await uploadImage();
        
        if (secure_url === 'error' || !secure_url) {
            console.error('Failed to retrieve secure URL');
            setLoading(false);
            alert('Failed to create Post: Image not found');
            return;
        }

        if (secure_url) {
            setUrl(secure_url);
        } else {
            console.error('Failed to retrieve secure URL');
        }

        const response = await fetch('http://localhost:8000/api/new-post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('user:token')}`
            },
            body: JSON.stringify({
                caption: data.caption,
                desc: data.desc,
                url: secure_url,
            })
        });
        
        if (response.ok) {
            navigate('/');
        } else {
            setLoading(false);
            alert('Failed to create post');
            console.log("error");
        }
    };

    useEffect(() => {
        if (url) {
            console.log('Updated URL:', url);
        }
    }, [url]);

    return (
        <div className='flex bg-cover bg-no-repeat bg-center' style={{ 
            backgroundImage: `url(${bg_img})`}}>
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
        <div className="flex ml-[20%] w-full justify-center items-center h-screen">
            <div className="w-[800px] h-[600px] bg-white rounded-lg shadow-lg p-8">
                {
                    loading ? 
                    <div className="flex items-center justify-center h-full">
                        <ClipLoader size={90} />
                    </div> :
                    <>
                        <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
                            <Input 
                                placeholder="Caption..." 
                                name="title" 
                                className="py-4 w-full" 
                                value={data.caption} 
                                onChange={(e) => setData({ ...data, caption: e.target.value })}
                                required={true} 
                            />
                            <textarea 
                                rows={7} 
                                className="w-full border shadow p-4 resize-none rounded-md" 
                                placeholder="Description" 
                                name="Description" 
                                value={data.desc} 
                                onChange={(e) => setData({ ...data, desc: e.target.value })}
                                required={true}
                            />
                            <div className="mb-4">
                                <Input 
                                    type="file" 
                                    id="image" 
                                    name="PostImage" 
                                    className="hidden" 
                                    onChange={handleImageChange} 
                                    required={false} 
                                />
                                <label 
                                    htmlFor="image" 
                                    className="cursor-pointer p-4 border shadow-lg rounded-md bg-gray-200 hover:bg-gray-300 text-center block"
                                >
                                    {data?.img?.name || 'Upload Post'}
                                </label>
                            </div>
                            <Button 
                                type="submit" 
                                label="Create Post" 
                                className="w-full bg-red-500 hover:bg-red-300 mt-4 py-2 rounded-md text-white" 
                                />
                        </form>
                        <Button label="Cancel" className='mt-[80px] w-[120px]' onClick={() => navigate('/')}/>
                    </>
            }
            </div>
            {
                loading ? 
                <div className="flex items-center justify-center h-full ml-[150px]">
                <ClipLoader size={50} />
            </div> :
            <div className='h-[600px] w-[400px] flex flex-col items-center justify-center ml-[10px]'>
                
                <p className='font-bold'>Post Preview</p>
                {previewUrl && <img src={previewUrl} alt="Preview" className='p-2 border mt-4 max-h-[600px] max-w-[400px] object-cover bg-white rounded-md' /> || 'No Post Available'}
            </div>
            }
        </div>
        </div>
    );
};

export default CreatePost;
