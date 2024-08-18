import React from 'react'
import Button from '../../components/button/Button'
import Input from '../../components/input/Input'
import { useState } from 'react'

const Form = ({
    // isSignInPage = false,
}) => {
    const [isSignInPage, setisSignInPage] = useState(true)
  return (
    <div className='bg-slate-100 h-screen w-full flex justify-center items-center'>
        <div className='h-[710px] w-[1100px] bg-white flex justify-center items-center'>
            <div className={`h-full w-full flex flex-col justify-center items-center  ${!isSignInPage && 'order-2'}`}>
                <div className='text-3xl'>Welcome</div>
                <div>Please {isSignInPage ? 'Login' : 'Sign Up'} to continue</div>
                <form>
                    {
                        !isSignInPage &&
                        <Input label='Username' type='text' placeholder='Enter your Username'/>
                    }
                    <Input label='Email' type='text' placeholder='Enter your email'/>
                    <Input label='Password' type='password' placeholder='Enter your password'/>
                    <Button label='Log In'/>
                </form>
                <div className='cursor-pointer' onClick={() => setisSignInPage(!isSignInPage)}> 

                    {isSignInPage ? 'Create New Account' : 'Already existing user? Signin here'}
                </div>
            </div>
            <div className={`bg-gray-200 h-full w-full ${!isSignInPage && 'order-1'}`}>

            </div>
        </div>
    </div>
  )
}

export default Form