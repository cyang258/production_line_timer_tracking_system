import mongoose from "mongoose"

const buildSchema = new mongoose.Schema({
    buildNumber: { 
        type: String,
        required: true,
        unique: true
    },
    numberOfParts: {
        type: Number,
        required: true
    },
    timePerPart: {
        type: Number,
        required: true
    }
});

export default mongoose.model('Builds', buildSchema);