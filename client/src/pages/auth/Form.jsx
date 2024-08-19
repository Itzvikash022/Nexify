import React from 'react'
import Button from '../../components/button/Button'
import Input from '../../components/input/Input'
import { useNavigate } from 'react-router-dom'
const Form = ({
    // isSignInPage = true
    isSignInPage = window.location.pathname.includes('signin')

}) => {
    // const [isSignInPage, setisSignInPage] = useState(true)
    const navigate = useNavigate()
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