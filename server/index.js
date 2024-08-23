import express from 'express';
import cookieParser from 'cookie-parser';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors({
    // origin: 'http://localhost:5173',
    // credentials: true,
}))
app.get('/', (req, res) =>{
    res.send('Hello World!')
})

//Database connection
import('./database/connect.js')

//import Schema
import Users from './models/user.js'
import Posts from './models/post.js'
import Follow from './models/follow.js'

//import Middleware
import auth from './middleware/auth.js';

//Registrations code
app.post('/api/register', async (req, res) =>{
    console.log("Register called");
    try {
        const { username, email, password, occupation } = req.body;

        if(!username || !email || !password){
            res.status(400).send('empty fields not allowed')
        }
        
        const isExist = await Users.findOne({email})
        if(isExist){
            return res.status(400).send('User already exists');
        } else{
            
            const salt = await bcryptjs.genSalt(10); // Generate a salt
            const hashedPassword = await bcryptjs.hash(password, salt);

            const user = new Users({
            username, 
            email,
            password: hashedPassword,
            occupation
            })
            
            const userCreated = await user.save()
            console.log(userCreated,'created')

            res.status(201).send('User registered successfully')
        }
    } catch (error) {
        console.log('catch me error', error);
        
        res.status(500).send(`error : ${error.message}`)        
    }
})

//Login Code
app.post('/api/login', async (req, res) => {
    console.log("Login called");
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
                    async (error, token) => {
                        if(error){
                            res.json({message: error})
                        } else{
                            await Users.updateOne({ _id: user._id},{
                                $set: {token}
                            })
                            user.save()
                            console.log('update ho gya token');
                            
                            res.status(201).json({user, token})
                        }
                    }
                )
            }
        }

    } catch (error) {
        res.status(500).send(`erroriadad : ${error.message}`)
    }
})


//Create Post
app.post('/api/new-post', auth, async (req, res) =>{
    try {
        const {caption, desc, url} = req.body
        const { user } = req
        if(!caption || !desc || !url){
            res.status(400).send('empty fields not allowed')
        }

        const newPost = new Posts({
            caption,
            description : desc,
            imageUrl: url,
            user : user,
        })
        const postCreated = await newPost.save();
        console.log(postCreated, 'post created');
        res.status(201).send('Post Created successfully')

    
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Profile Page
app.get('/api/profile', auth, async (req, res) => {
    try {
        const { user } = req;
        const posts = await Posts.find({ user : user._id}).sort({ createdAt : -1 })
        const userDetails = {
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
        };
        res.status(200).json({ posts, userDetails })
                
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Other's Profile Page
app.get('/api/others', auth, async (req, res) => {
    try {
        const { email } = req.query;
        const { user : follower } = req;
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const posts = await Posts.find({ user: user._id }).sort({ createdAt : -1 }) 
        const [isFollowed] = await Follow.find({follower: follower._id, followed: user.id})
        console.log(isFollowed, 'followed')
        const userDetails = {
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            id: user._id,
        };
        res.status(200).json({ posts, userDetails, isFollowed: !!isFollowed}); //by putting !! -> the variable passes value in boolean[true/false]
                
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Homepage
app.get('/api/feed', auth, async (req, res) => {
    try {
        const { user } = req;
        const posts = await Posts.find().populate('user','_id username email').sort({ createdAt : -1 })
        res.status(200).json({ posts, user })
                
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Follow User
app.post('/api/follow', auth, async (req, res)=>{
    try {
        const { id } = req.body;
        const { user } = req;
        if(!id) return res.status(404).send('id is empty')
        
        const [FollowedUser] = await Users.find({ _id: id})
        const FollowUser = new Follow({
            follower: user,
            followed: FollowedUser
        })

        await FollowUser.save()
        res.status(200).json({ isFollowed: true })
        
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Unfollow User
app.delete('/api/unfollow', auth, async (req, res)=>{
    try {
        const { id } = req.body;
        const { user } = req;
        if(!id) return res.status(404).send('id is empty')
        
        await Follow.deleteOne({ follower: user._id, followed: id})

        res.status(200).json({ isFollowed: false })
        
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})


const PORT = process.env.PORT || 8000;

app.listen(8000, () =>{
    console.log('Server is running on port 8000')
})