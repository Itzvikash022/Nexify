import React, { useState, useEffect } from 'react'
import Input from '../../components/input/Input'
import Button from '../../components/button/Button'
import {useNavigate} from 'react-router-dom'

const CreatePost = () => {
    const [data, setData] = useState({
        caption: '',
        desc: '',
        img: null,
    })

    const [url, setUrl] = useState('')
    const navigate = useNavigate()

    const uploadImage = async() => {
        const formData = new FormData();
        formData.append('file', data.img);
        formData.append('upload_preset', 'nexify')
        formData.append('cloud_name', 'dlam9v1ev') 

        const res = await fetch('https://api.cloudinary.com/v1_1/dlam9v1ev/upload', {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            console.log('Upload successful');
            const responseJson = await res.json();
            return responseJson.secure_url;
        } else {
            console.error('Failed to upload image');
            return 'error';
        }
        
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        const secure_url = await uploadImage()
        
        if(secure_url){
            setUrl(secure_url);
            // console.log('URL after setUrl:', secure_url);
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
                url : secure_url,
            })
        });

        if(response.ok){
            navigate('/')
        } else {
            console.log("error");
        }
        
    }

    useEffect(() => {
        if (url) {
            console.log('Updated URL:', url);
        }
    }, [url]);

  return (
    <div className='flex justify-center items-center h-screen'>
        <div className=' w-[800px] h-[600px] py-6 p-2'>
            <form onSubmit={(e) => handleSubmit(e)}>
                <Input placeholder='Caption...' name='title' className='py-4' value={data.caption} onChange={(e) => setData({
                    ...data, caption: e.target.value 
                })} required={true}/>
                <textarea rows={7} className='w-full border shadow p-4 resize-none' placeholder='Description' name='Description' value={data.desc} onChange={(e) => setData({
                    ...data, desc: e.target.value 
                })} required={true}></textarea>
                <div>
                    <Input type='file' id='image' name='PostImage' className='py-4 hidden' onChange={(e) => setData({
                        ...data, img: e.target.files[0]
                    })} required={false}/>
                    <label htmlFor="image" className='cursor-pointer p-4 border shadow w-full'>{data?.img?.name || 'Upload Post'}</label>
                </div>
                <Button type='submit' label='Create Post' className='bg-red-600 hover:bg-red-500 mt-4'/>
            </form>
        </div>
    </div>
  )
}

export default CreatePost