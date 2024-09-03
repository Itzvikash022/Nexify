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
import Comments from './models/comment.js';

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


//Followers Count
app.post('/api/followerCount', auth, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        const followers = await Follow.find({ followed: userId });

        if (followers.length === 0) {
            res.status(200).json({ followers: 0 });
        } else {
            res.status(200).json({ followers: followers.length });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Following Count
app.post('/api/followingCount', auth, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const following = await Follow.find({ follower: userId });

        if (following.length === 0) {
            res.status(200).json({ following: 0 });
        } else {
            res.status(200).json({ following: following.length });
        }
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

// Delete Post
app.delete('/api/delete-post', async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: 'Post ID is required' });
        }
        
        // Find and delete the post by ID
        const post = await Posts.findOneAndDelete({ _id: id });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Delete all comments associated with this post
        const deletedComments = await Comments.deleteMany({ post: id });

        // Respond with success and include the number of deleted comments
        res.status(200).json({ 
            message: 'Post and associated comments deleted successfully', 
            deletedCommentsCount: deletedComments.deletedCount 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



//Homepage
app.get('/api/feed', auth, async (req, res) => {
    try {
        const { user } = req;
        const posts = await Posts.find().populate('user','_id username email profileImgUrl commentCount').sort({ createdAt : -1 })
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
      }).select('username _id profileImgUrl followers');
  
      res.json(users);
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });

// Add Comments
app.post('/api/comment', async (req, res) => {
    const { postId, userId, commentText } = req.body;
    console.log('Received data:', { postId, userId, commentText });

    try {
        // Create a new comment
        const newComment = new Comments({
            post: postId,
            user: userId,
            comment: commentText
        });

        // Save the new comment
        await newComment.save();

        // Update the comments count in the corresponding post
        const updatedPost = await Posts.findByIdAndUpdate(
            postId,
            { $inc: { commentCount: 1 } }, // Increment the comments count by 1
            { new: true } // Return the updated document
        );

        // Return success response
        res.status(200).json({ success: true, comment: newComment, post: updatedPost });
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});


// Display Comments
app.get('/api/comments/:postId', async (req, res) => {
    console.log('Fetching comments for postId:', req.params.postId);
    try {
        const comments = await Comments.find({ post: req.params.postId })
            .populate('user', 'username profileImgUrl');
        res.status(200).json({ success: true, comments });
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
});

app.delete('/api/delete-account', auth, async (req, res) => {
    try {
        const userId = req.user._id; // Extract the user ID from the authenticated user
    
        // Find all posts by the user
        const userPosts = await Posts.find({ user: userId });
    
        // Collect all post IDs for later use
        const postIds = userPosts.map(post => post._id);
    
        // Find all comments associated with these posts
        const commentsToDelete = await Comments.find({ post: { $in: postIds } });
    
        // Delete all comments associated with the user's posts
        await Promise.all(commentsToDelete.map(comment =>
            Comments.findByIdAndDelete(comment._id)
        ));
    
        // Delete all posts by the user
        await Promise.all(userPosts.map(post =>
            Posts.findByIdAndDelete(post._id)
        ));
    
        // Find all posts liked by the user
        const postsWithLikes = await Posts.find({ likes: userId });
    
        // Update each post to remove the user's ID from the likes array
        await Promise.all(postsWithLikes.map(post =>
            Posts.updateOne(
                { _id: post._id },
                { $pull: { likes: userId } }
            )
        ));
    
        // Find all comments left by the user
        const userComments = await Comments.find({ user: userId });
    
        // Delete all comments left by the user
        await Promise.all(userComments.map(comment =>
            Comments.findByIdAndDelete(comment._id)
        ));
    
        // Decrement comment count in each post where the user has left a comment
        await Promise.all(userComments.map(async (comment) => {
            await Posts.findByIdAndUpdate(
                comment.post, // Reference to the post where the comment was left
                { $inc: { commentCount: -1 } }
            );
        }));
    
        // Step 1: Remove the user from other users' followers
        await Follow.deleteMany({ followed: userId });

        // Step 2: Remove other users from the user's following list
        await Follow.deleteMany({ follower: userId });

        // Delete the user account
        await Users.findByIdAndDelete(userId);
    
        res.status(200).json({ message: 'Account, posts, comments, and follow relationships deleted successfully' });
    } catch (error) {
        console.error('Error deleting account, posts, comments, and follow relationships:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
    
});

const PORT = process.env.PORT || 8000;

app.listen(8000, () =>{
    console.log('Server is running on port 8000')
})