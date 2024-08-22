import React, { useState } from 'react'
import Button from '../../components/button/Button'
import Input from '../../components/input/Input'
import { useNavigate } from 'react-router-dom'
const Form = ({
    // isSignInPage = true
    isSignInPage = window.location.pathname.includes('signin')

}) => {
    // const [isSignInPage, setisSignInPage] = useState(true)
    const navigate = useNavigate()
    const [data, setData] = useState({
        ...(!isSignInPage && { username : ''}),
        email: '',
        password: ''
    })
    console.log(data);
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(JSON.stringify(data));
        
        const res = await fetch(`http://localhost:8000/api/${isSignInPage ? 'login' : 'register'}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...data})
        })

        console.log(res, 'res');
        if(res.status === 201 && isSignInPage) {
            const {token, user} = await res.json();
            console.log(token, user, 'response');
            localStorage.setItem('user:token', token);
            navigate('/');
        }
        
    }
  return (
    <div className='bg-slate-100 h-screen w-full flex justify-center items-center'>
        <div className='h-[710px] w-[1100px] bg-white flex justify-center items-center'>
            <div className={`h-full w-full flex flex-col justify-center items-center  ${!isSignInPage && 'order-2'}`}>
                <div className='text-3xl'>Welcome</div>
                <div>Please {isSignInPage ? 'Login' : 'Sign Up'} to continue</div>
                <form className='w-[350px]' onSubmit={(e) => {
                    e.preventDefault(); 
                    handleSubmit(e);
                    }}>
                    {
                        !isSignInPage &&
                        <Input label='Username' type='text' placeholder='Enter your Username' value={data.username} onChange={(e) => setData({...data, username: e.target.value})}/>
                    }
                    <Input label='Email' type='email' placeholder='Enter your email' value={data.email} onChange={(e) => setData({...data, email: e.target.value})}/>
                    <Input label='Password' type='password' placeholder='Enter your password' value={data.password} onChange={(e) => setData({...data, password: e.target.value})} />
                    <Button label={isSignInPage ? 'Login' : 'SignUp'}/>
                </form>
                <div className='cursor-pointer' onClick={() => navigate(`${isSignInPage ? '/ac/signup' : '/ac/signin'}`)}> 
                    {isSignInPage ? 'Create New Account' : 'Already a existing user? Signin here'}
                </div>
            </div>
            <div className={`bg-gray-200 h-full w-full ${!isSignInPage && 'order-1'}`}>

            </div>
        </div>
    </div>
  )
}

export default Form