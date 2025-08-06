import mongoose from "mongoose";

const pauseEventSchema = new mongoose.Schema({
    isPopupInteraction: {
        type: Boolean,
        default: false,
        required: true
    },
    pausedAt: {
        type: Date,
        required: true
    },
    resumedAt: {
        type: Date,
        default: null  // Optional, will be set on resume
    }
}, { _id: false });

const popupInteractionSchema = new mongoose.Schema({
    popupShownAt: {
        type: Date,
        required: true
    },
    response: {
        type: String,
        enum: ['Yes', 'No', 'Auto'],
        required: true
    },
    respondedAt: {
        type: Date,
        default: null  // Optional, will be set when respond (either auto or manually)
    }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
    loginId: {
        type: String,
        required: true
    }, // User input ID
    buildNumber: {
        type: String,
        required: true
    }, // References Build.buildNumber
    numberOfParts: {
        type: Number,
        required: true
    }, // Copied from Build at session start
    timePerPart: {
        type: Number,
        required: true
    }, // Copied from Build at session start (in minutes)
    startTime: {
        type: Date,
        default: Date.now,  // No default until explicitly set
        immutable: true
    }, // Session start timestamp
    totalPausedTime: {
        type: Number,
        default: 0
    }, // Accumulated paused time (in seconds)
    defects: {
        type: Number,
        default: 0
    }, // Defects encountered (user input)
    totalParts: {
        type: Number,
        default: 0
    }, // Entered on Final Submission
    pauseEvents: {
        type: [pauseEventSchema],
        default: []
    }, // History of pause/resume timestamps
    popupInteractions: {
        type: [popupInteractionSchema],
        default: []
    }, // Popup actions history
    isAutoSubmitted: {
        type: Boolean,
        default: false
    }, // Auto-submission flag
    isManuallySubmitted: {
        type: Boolean,
        default: false
    }, // Manual submission flag
    totalActiveTime: {
        type: Number,
        default: 0
    }, // Active work time
    totalInactiveTime: {
        type: Number,
        default: 0
    }, // Total paused/inactive time
    sessionStatus: {
        type: String,
        enum: ['active', 'paused', 'completed', 'auto-submitted'],
        default: 'active'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    } // For session recovery/persistence
});

export default mongoose.model('Sessions', sessionSchema);
