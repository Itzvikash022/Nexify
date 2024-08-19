import express from 'express';
import cookieParser from 'cookie-parser';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.get('/', (req, res) =>{
    res.send('Hello World!')
})

//Database connection
import('./database/connect.js')

//import Schema
import Users from './models/user.js'

//Registrations code
app.post('/api/register', async (req, res) =>{
    try {
        const { username, email, password, occupation } = req.body;
        
        const isExist = await Users.findOne({email})
        if(isExist){
            res.status(400).send('User already exists')
        } else{
            const salt = await bcryptjs.genSalt(10); // Generate a salt
            const hashedPassword = await bcryptjs.hash(password, salt);

            const user = new Users({
            username, 
            email,
            password: hashedPassword, 
            occupation})
            
            const userCreated = await user.save()
            console.log(userCreated,'created')
            res.status(201).send('User registered successfully')
        }
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)        
    }
})


app.post('/api/login', async (req, res) => {
    try {
        const {email, password} = req.body

        const user = await Users.findOne({email});
        if(!user) {
            res.status(401).send('User or password invalid')
        } else{
            const validate = await bcryptjs.compare(password, user.password)
            if(!validate){
                res.status(401).send('User or password invalid')
            } else{
                const payload = {
                    id: user._id,
                    username: user.username 
                }
                const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || 'hehe_a_random_secret_key_lol_so_secure_no_one_can_guess_it' 
                jwt.sign(
                    payload,
                    JWT_SECRET_KEY,
                    { expiresIn: 69420},
                    (error, token) => {
                        if(error){
                            res.json({message: error})
                        } else{
                            res.status(201).json({user, token})
                        }
                    }
                )
            }
        }

    } catch (error) {
        res.status(500).send(`error : ${error.message}`)        
    }
})


const PORT = process.env.PORT || 8000;

app.listen(8000, () =>{
    console.log('Server is running on port 8000')
})