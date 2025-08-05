import Session from "../model/sessionModel.js";
import Build from "../model/buildModel.js";

export const create = async(req, res) => {
    try {
        const { loginId, buildNumber } = req.body;
        /*
            edge case consideration:
            1. if user clear the cache on browser and go to login page again to re-entry, we still want to fetch the stored session data
        */
        const sessionExist = await Session.findOne({
            loginId,
            buildNumber,
            sessionStatus: { $nin: ['completed', 'auto-submitted'] }
        }).sort({ lastUpdated: -1 });
        if (sessionExist) {
            // since session is already exist, we return existing session
            return res.status(200).json(sessionExist)
        }
        const buildData = await Build.findOne({
            buildNumber
        })
        if (!buildData) {
            return res.status(404).json({ error: "Build is not available" })
        }
        const { numberOfParts, timePerPart } = buildData;
        const newSession = new Session({
            ...req.body,
            numberOfParts,
            timePerPart
        });
        const savedSession = await newSession.save();
        return res.status(200).json(savedSession);

    } catch (error) {
        return res.status(500).json({ errorMessage: error.message })
    }
}

// when we retrieve the session info, we use session id
export const getSessionForUserById = async (req, res) => {
    try {
        const { _id } = req.query;
        const session = await Session.findOne({
            _id,
            sessionStatus: { $nin: ['completed', 'auto-submitted'] }
        });
        if (!session) {
            return res.status(404).json({ error: "Session is not available" })
        }
        return res.status(200).json(session);
    } catch (error) {
        return res.status(500).json({errorMessage: error.message})
    }
}

// TODO Update actions
const pauseSession = () => {}

const resumeSession = () => {}

const updateDefects = () => {}

const finalSubmission = () => {}

