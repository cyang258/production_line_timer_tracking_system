import mongoose from "mongoose"

const loginIdSchema = new mongoose.Schema({
    loginId: { 
        type: String,
        required: true,
        unique: true
    }
});

export default mongoose.model('LoginIds', loginIdSchema);