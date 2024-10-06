// userSchema.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    uname: { type: String, required: true },
    pwd: { type: String, required: true }
});

export default mongoose.model('User', userSchema);
