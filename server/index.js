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
        const { username, email, password, name, img } = req.body;

        if(!username || !email || !password){
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
            name,
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


// Change Password
app.post('/api/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validate that passwords are provided
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).send('All fields are required');
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).send('New passwords do not match');
        }

        // Find the user by ID
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Verify current password
        const isMatch = await bcryptjs.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).send('Current password is incorrect');
        }

        // Hash the new password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);

        // Update password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: `Error: ${error.message}` });
    }
});


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

        const savedPosts = await Posts.find({ _id: { $in: user.saves } });
        
        const userDetails = {
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            id: user._id,
            profileImgUrl: user.profileImgUrl,
            name: user.name,
            occupation: user.occupation,
            bio : user.bio,
        };
        res.status(200).json({ posts,savedPosts, userDetails })
                
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
            bio : user.bio,
            name : user.name,
            occupation : user.occupation,
            isPrivate : user.isPrivate,
        };
        res.status(200).json({ posts, userDetails, follower ,isFollowed: !!isFollowed }); //by putting !! -> the variable passes value in boolean[true/false]
                
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all followers of the logged-in user (by user ID)
app.get('/api/user/followers', auth, async (req, res) => {
    try {
      const { user } = req;  // The logged-in user's ID is in req.user
  
      const followers = await Follow.find({ followed: user._id })
        .populate('follower', 'username email bio name occupation profileImgUrl')
        .exec();
  
      const followerDetails = followers.map(f => f.follower);
  
      res.status(200).json({ followers: followerDetails });
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });
  
  // Get all users the logged-in user is following (by user ID)
  app.get('/api/user/following', auth, async (req, res) => {
    try {
      const { user } = req;
  
      const following = await Follow.find({ follower: user._id })
        .populate('followed', 'username email bio name occupation profileImgUrl')
        .exec();
  
      const followingDetails = following.map(f => f.followed);
  
      res.status(200).json({ following: followingDetails });
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
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


// Get all followers of a user by username from the URL
app.get('/api/user/:username/followers', async (req, res) => {
    try {
      const { username } = req.params;
  
      const user = await Users.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const followers = await Follow.find({ followed: user._id })
        .populate('follower', 'username name profileImgUrl')
        .exec();
  
      const followerDetails = followers.map(f => f.follower);
  
      res.status(200).json({ followers: followerDetails });
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
    }
  });
  
  // Get all users the specified user is following by username from the URL
  app.get('/api/user/:username/following', async (req, res) => {
    try {
      const { username } = req.params;
  
      const user = await Users.findOne({ username });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const following = await Follow.find({ follower: user._id })
        .populate('followed', 'username name profileImgUrl')
        .exec();
  
      const followingDetails = following.map(f => f.followed);
  
      res.status(200).json({ following: followingDetails });
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`);
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


// Trending posts
app.get('/api/trending-post', auth, async (req, res) => {
    try {
      const { user } = req;
  
      // Fetch posts with user details and likes array
      const posts = await Posts.find()
        .populate('user', '_id username email profileImgUrl commentCount')
        .exec();
  
      // Calculate likes count and sort posts by likes count
      const sortedPosts = posts
        .map(post => ({
          ...post.toObject(),
          likesCount: post.likes.length
        }))
        .sort((a, b) => b.likesCount - a.likesCount) // Sort by likes count in descending order
        .slice(0, 21); // Limit to 21 posts
  
      res.status(200).json({ posts: sortedPosts, user });
  
    } catch (error) {
      res.status(500).send(`error : ${error.message}`);
    }
  });
  




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


//Suggestions
app.get('/api/suggestions', auth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    let suggestions = new Set(); // Using a Set to avoid duplicates

    // Scenario 1: Find users who follow the logged-in user ("vikash") but "vikash" doesn't follow them back
    const followers = await Follow.find({ followed: loggedInUserId })
      .populate('follower')
      .exec();
    
    const loggedInUserFollowings = await Follow.find({ follower: loggedInUserId })
      .populate('followed')
      .exec();

    // Create a set of user IDs that "vikash" is following
    const loggedInUserFollowingIds = new Set(loggedInUserFollowings.map(following => following.followed._id.toString()));

    // Add followers that "vikash" does not follow back to suggestions
    followers.forEach(followerEntry => {
      const follower = followerEntry.follower;
      if (!loggedInUserFollowingIds.has(follower._id.toString())) {
        console.log(`Direct follower ${follower.username} added to suggestions`);
        suggestions.add(follower);
      }
    });

    // Scenario 2: Find users that the users "vikash" follows are following
    for (const followingEntry of loggedInUserFollowings) {
      const followedUser = followingEntry.followed;

      // Find who the followed users are following
      const followingsOfFollowedUser = await Follow.find({ follower: followedUser._id })
        .populate('followed')
        .exec();
      
      followingsOfFollowedUser.forEach(followingEntry => {
        const followedUserOfFollowedUser = followingEntry.followed;

        // Suggest users followed by "vik's" followers if "vikash" doesn't already follow them
        if (
          followedUserOfFollowedUser._id.toString() !== loggedInUserId.toString() && 
          !loggedInUserFollowingIds.has(followedUserOfFollowedUser._id.toString())
        ) {
          console.log(`Indirect suggestion ${followedUserOfFollowedUser.username} added to suggestions`);
          suggestions.add(followedUserOfFollowedUser);
        }
      });
    }
    console.log(suggestions,'set');
    
    // Convert the set to an array
    let suggestionsArray = Array.from(suggestions);
    console.log(suggestions,'array');

    // Shuffle and return the top 7 suggestions
    suggestionsArray = shuffleArray(suggestionsArray).slice(0, 7);

    // Send the suggestions back to the frontend
    res.json(suggestionsArray);
  } catch (error) {
    console.error("Error fetching suggestions: ", error);
    res.status(500).send('Server error');
  }
});

// Utility function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

  
  

//Trending users
app.get('/trending-users', async (req, res) => {
    try {
        
      // Step 1: Fetch all users
      const users = await Users.find({}, '_id username name profileImgUrl').exec();
  
      // Step 2: Fetch all follow relationships and count followers for each user
      const followCounts = await Follow.aggregate([
        { $group: { _id: '$followed', count: { $sum: 1 } } },
      ]).exec();
  
      // Create a map to store follower counts by user ID
      const followerCountMap = followCounts.reduce((map, { _id, count }) => {
        map[_id.toString()] = count;
        return map;
      }, {});
  
      // Add follower counts to user objects
      const usersWithFollowerCount = users.map(user => ({
        ...user.toObject(),
        followerCount: followerCountMap[user._id.toString()] || 0,
      }));
  
      // Step 3: Sort users by follower count in descending order
      usersWithFollowerCount.sort((a, b) => b.followerCount - a.followerCount);

       // Step 4: Limit to top 5 users
    const top5Users = usersWithFollowerCount.slice(0, 5);
  
      res.json(top5Users);
    } catch (error) {
      console.error('Error finding trending users:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  
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


//Save Post
app.put('/api/save', auth, async (req, res)=>{
    try {
        const { id } = req.body;
        const { user } = req;
        if(!id) return res.status(404).send('id is empty')

        const savePost = await Users.findOneAndUpdate({ _id: user.id }, {
            $push: { saves: id }
        }, {new : true })
        
        res.status(200).json({ savePost })
        
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Unsave Post
app.put('/api/unsave', auth, async (req, res)=>{
    try {
        const { id } = req.body;
        const { user } = req;
        if(!id) return res.status(404).send('id is empty')

        const unsavePost = await Users.findOneAndUpdate({ _id: user.id }, {
            $pull: { saves: id }
        }, {new : true } );
        
        res.status(200).json({ unsavePost })
        
    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

//Create Post
app.post('/api/new-post', auth, async (req, res) =>{
    try {
        const {caption, desc, url, location} = req.body
        const { user } = req
        if(!caption || !desc || !url || !location){
            res.status(400).send('empty fields not allowed')
        }

        const newPost = new Posts({
            caption,
            description : desc,
            imageUrl: url,
            user : user,
            location : location
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
        const { username, email, password, occupation, profileImgUrl, bio, name } = req.body;
        
        if (!username && !email && !password && !occupation && !profileImgUrl && !bio && !name) {
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
        if (bio) {
            user.bio = bio;
        }
        if (name) {
            user.name = name;
        }

        // Save the updated user
        const updatedUser = await user.save();
        console.log(updatedUser, 'updated');

        res.status(200).send('User profile updated successfully');

    } catch (error) {
        res.status(500).send(`error : ${error.message}`)
    }
})

// Fetch current privacy setting
app.get('/api/get-privacy', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await Users.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Return the current privacy setting
        res.status(200).json({ isPrivate: user.isPrivate });
    } catch (error) {
        console.error('Error fetching privacy setting:', error);
        res.status(500).send('Error fetching privacy setting');
    }
});


// Edit Privacy (Boolean isPrivate)
app.post('/api/set-privacy', auth, async (req, res) => {
    console.log("Edit Profile called");
    try {
        const { isPrivate } = req.body;

        // Validate isPrivate input
        if (typeof isPrivate !== 'boolean') {
            return res.status(400).send('Invalid input for privacy setting');
        }

        const userId = req.user.id;

        let user = await Users.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update the isPrivate field
        user.isPrivate = isPrivate;

        // Save the updated user
        await user.save();
        console.log(user, 'updated');

        // Return updated privacy setting
        res.status(200).send({ message: 'Privacy setting updated', isPrivate: user.isPrivate });

    } catch (error) {
        console.error('Error updating privacy:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
});



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
            .populate('user', 'username profileImgUrl').sort({ createdAt : -1 });
        res.status(200).json({ success: true, comments });
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
});


// Delete Account
app.delete('/api/delete-account', auth, async (req, res) => {
    try {
        const userId = req.user._id; // Extract the user ID from the authenticated user
        const { password } = req.body;

        // Find the user by ID
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify the password
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Proceed with account deletion logic (as in your original code)

        // Delete posts, comments, likes, follows, and user account
        const userPosts = await Posts.find({ user: userId });
        const postIds = userPosts.map(post => post._id);

        await Comments.deleteMany({ post: { $in: postIds } });
        await Posts.deleteMany({ user: userId });
        await Posts.updateMany({ likes: userId }, { $pull: { likes: userId } });
        await Comments.deleteMany({ user: userId });
        await Follow.deleteMany({ followed: userId });
        await Follow.deleteMany({ follower: userId });

        // Delete the user account
        await Users.findByIdAndDelete(userId);

        res.status(200).json({ message: 'Account, posts, comments, and follow relationships deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


const PORT = process.env.PORT || 8000;

app.listen(8000, () =>{
    console.log('Server is running on port 8000')
})