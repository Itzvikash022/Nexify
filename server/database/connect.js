import mongoose from 'mongoose';

const db = `mongodb+srv://vik:vik@cluster0.qg6ry.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(db, {
}).then(()=>{
    console.log('MongoDB connected...');
}).catch(err => console.log(err));