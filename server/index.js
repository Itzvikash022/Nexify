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
        const { username, email, password, occupation, img } = req.body;

        if(!username || !email || !password || !occupation || !img){
            res.status(400).send('empty fields not allowed')
        }
        
        const isExist_e = await Users.findOne({email})
        const isExist_u = await Users.findOne({username})
        if(isExist_e){
            return res.status(400).send('Email already exists');
        } else if(isExist_u){
            return res.status(400).send('Username already exists');
        }else{
            
            const salt = await bcryptjs.genSalt(10); // Generate a salt
            const hashedPassword = await bcryptjs.hash(password, salt);

            const user = new Users({
            username, 
            email,
            password: hashedPassword,
            occupation,
            profileImgUrl : img
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
            res.status(401).send('User or password is invalid')
        } else{
            const validate = await bcryptjs.compare(password, user.password)
            if(!validate){
                res.status(401).send('User or password is invalid')
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


//Logout
app.post('/api/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).send('Authorization header is missing');
        }

        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).send('Invalid Token');
        }

        const verifyToken = jwt.verify(token, 'hehe_a_random_secret_key_lol_so_secure_no_one_can_guess_it');
        const user = await Users.findOne({ _id: verifyToken.id });

        if (!user) {
            return res.status(401).send('User not found');
        }

        // Optionally remove token from the database if necessary
        await Users.updateOne({ _id: user._id }, { $unset: { token: 1 } });

        res.status(200).send('Logout successful');
    } catch (error) {
        console.error('Error during logout:', error.message);
        return res.status(500).send(`Error: ${error.message}`);
    }
});


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
            id: user._id,
            profileImgUrl: user.profileImgUrl,
        };
        res.status(200).json({ posts, userDetails })
                
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Other's Profile Page
app.get('/api/others', auth, async (req, res) => {
    try {
        const { username } = req.query;
        const { user : follower } = req;
        const user = await Users.findOne({ username });
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
            profileImgUrl: user.profileImgUrl,
        };
        res.status(200).json({ posts, userDetails, follower ,isFollowed: !!isFollowed }); //by putting !! -> the variable passes value in boolean[true/false]
                
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Single Posts
app.get('/api/post', async (req, res) => {
    try {
        const { id } = req.query; // Extract id from query parameters
        if (!id) {
            return res.status(400).json({ error: 'Post ID is required' });
        }
        
        const post = await Posts.findOne({ _id: id }).populate('user', '_id username email profileImgUrl');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({ post });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Homepage
app.get('/api/feed', auth, async (req, res) => {
    try {
        const { user } = req;
        const posts = await Posts.find().populate('user','_id username email profileImgUrl').sort({ createdAt : -1 })
        res.status(200).json({ posts, user })
                
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})


//User Data
app.get('/api/user', auth, async (req, res) => {
    try {
        const { user } = req;
        res.status(200).json({ user })
                
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

        // Update follower and following counts
        await Users.findByIdAndUpdate(user._id, { $inc: { following: 1 } });
        await Users.findByIdAndUpdate(id, { $inc: { followers: 1 } });

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

        // Decrement counts
        await Users.findByIdAndUpdate(user._id, { $inc: { following: -1 } });
        await Users.findByIdAndUpdate(id, { $inc: { followers: -1 } });

        res.status(200).json({ isFollowed: false })
        
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})


//Like Post
app.put('/api/like', auth, async (req, res)=>{
    try {
        const { id } = req.body;
        const { user } = req;
        if(!id) return res.status(404).send('id is empty')

        const updatedPost = await Posts.findOneAndUpdate({ _id: id }, {
            $push: { likes: user._id }
        }, {returnDocument : 'after'}).populate('user','_id username email').sort({ createdAt : -1 })
        
        res.status(200).json({ updatedPost })
        
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Unlike Post
app.put('/api/unlike', auth, async (req, res)=>{
    try {
        const { id } = req.body;
        const { user } = req;
        if(!id) return res.status(404).send('id is empty')

        const updatedPost = await Posts.findOneAndUpdate({ _id: id }, {
            $pull: { likes: user._id }
        }, {returnDocument : 'after'}).populate('user','_id username email').sort({ createdAt : -1 })
        
        res.status(200).json({ updatedPost })
        
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
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

//Edit Profile
app.post('/api/edit-profile', auth, async (req, res) =>{
    console.log("Edit Profile called");
    try {
        const { username, email, password, occupation, profileImgUrl } = req.body;
        
        if (!username && !email && !password && !occupation && !profileImgUrl) {
            return res.status(400).send('No fields to update');
        }
        const userId = req.user.id;

        let user = await Users.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (email && email !== user.email) {
            const isExist_e = await Users.findOne({ email });
            if (isExist_e) {
                return res.status(400).send('Email already exists');
            }
            user.email = email;
        }

        if (username && username !== user.username) {
            const isExist_u = await Users.findOne({ username });
            if (isExist_u) {
                return res.status(400).send('Username already exists');
            }
            user.username = username;
        }
            
        if (password) {
            const salt = await bcryptjs.genSalt(10); // Generate a salt
            user.password = await bcryptjs.hash(password, salt); // Hash the new password
        }
        if (occupation) {
            user.occupation = occupation;
        }
        if (profileImgUrl) {
            user.profileImgUrl = profileImgUrl;
        }

        // Save the updated user
        const updatedUser = await user.save();
        console.log(updatedUser, 'updated');

        res.status(200).send('User profile updated successfully');

    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Search User Profile
app.get('/api/search-users', auth, async (req, res) => {
    const { username } = req.query;
    try {
      if (!username) {
        return res.status(400).send('Username query is required');
      }
  
      const users = await Users.find({ 
        username: { $regex: username, $options: 'i' } // Case-insensitive search
      }).select('username _id profileImgUrl');
  
      res.json(users);
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });

  
const PORT = process.env.PORT || 8000;

app.listen(8000, () =>{
    console.log('Server is running on port 8000')
})