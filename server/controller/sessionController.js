import Session from "../model/sessionModel.js";
import Build from "../model/buildModel.js";
import mongoose from "mongoose";

export const create = async (req, res) => {
  try {
    const { loginId, buildNumber } = req.body;
    /*
            edge case consideration:
            1. if user clear the cache on browser and go to login page again to re-entry, we still want to fetch the stored session data
        */
    const sessionExist = await Session.findOne({
      loginId,
      buildNumber,
      sessionStatus: { $nin: ["completed", "auto-submitted"] },
    }).sort({ lastUpdated: -1 });
    if (sessionExist) {
      // since session is already exist, we return existing session
      return res.status(200).json(sessionExist);
    }
    const buildData = await Build.findOne({
      buildNumber,
    });
    if (!buildData) {
      return res.status(404).json({ error: "Build is not available" });
    }
    const { numberOfParts, timePerPart } = buildData;
    const newSession = new Session({
      ...req.body,
      numberOfParts,
      timePerPart,
    });
    const savedSession = await newSession.save();
    return res.status(200).json(savedSession);
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// when we retrieve the session info, we use session id
export const getSessionForUserById = async (req, res) => {
  try {
    const { _id } = req.query;
    const session = await Session.findOne({
      _id,
      sessionStatus: { $nin: ["completed", "auto-submitted"] },
    });
    if (!session) {
      return res.status(404).json({ error: "Session is not available" });
    }
    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// when we retrieve the session info, we use session id
export const isActiveSessionForUserByLoginIdAndBuildNumber = async (
  req,
  res
) => {
  try {
    const { loginId, buildNumber } = req.query;
    const session = await Session.findOne({
      loginId,
      buildNumber,
      sessionStatus: { $nin: ["completed", "auto-submitted"] },
    }).sort({ lastUpdated: -1 });
    if (!session) {
      return res.status(200).json({ active: false });
    }

    return res.status(200).json({ active: true, id: session._id });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// when we check if there is active seesion for user
export const isActiveSessionById = async (req, res) => {
  try {
    const { _id } = req.query;
    const session = await Session.findOne({
      _id,
      sessionStatus: { $nin: ["completed", "auto-submitted"] },
    });

    if (!session) {
      return res.status(404).json({ active: false });
    }

    return res.status(200).json({ active: true });
  } catch (error) {
    return res.status(500).json({ errorMessage: error.message });
  }
};

// TODO Update actions
export const pauseSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Find the session
    const session = await Session.findOne({
      _id: sessionId,
      sessionStatus: { $nin: ["completed", "auto-submitted"] },
    });

    if (!session) {
      console.log("cannot find session");
      return res.status(404).json({ error: "Session is not available" });
    }

    // in case of data corruption or unexpected beheavior cuased unresumed pause event
    const activePauseEvent = session.pauseEvents.find(
      (pe) => pe.resumedAt === null
    );

    if (activePauseEvent) {
      console.log("already active event");
      return res.status(400).json({
        error:
          "There is already an active pause event. Please resume it before pausing again.",
      });
    }

    // Add a new pauseEvent
    session.pauseEvents.push({
      pausedAt: new Date(),
      resumedAt: null,
    });

    await session.save();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: error.message });
  }
};

export const resumeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    // Find the latest unresumed pauseEvent using aggregation
    const result = await Session.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(sessionId),
          sessionStatus: { $nin: ["completed", "auto-submitted"] },
        },
      },
      { $unwind: "$pauseEvents" },
      { $match: { "pauseEvents.resumedAt": null } },
      { $sort: { "pauseEvents.pausedAt": -1 } },
      { $limit: 1 },
      { $project: { pauseEvent: "$pauseEvents", totalPausedTime: 1 } },
    ]);

    if (result.length === 0) {
      return res
        .status(400)
        .json({ error: "No active pause event to resume." });
    }

    // Get pasued duration in seconds and save it in totalPausedTime
    const sessionData = result[0];
    const pauseEvent = sessionData.pauseEvent;

    const resumedAt = new Date();
    const pausedDurationSeconds = Math.floor(
      (resumedAt - pauseEvent.pausedAt) / 1000
    );

    // Update resumedAt and totalPausedTime atomically
    const updateResult = await Session.updateOne(
      { _id: sessionId },
      {
        $set: { "pauseEvents.$[elem].resumedAt": resumedAt },
        $inc: { totalPausedTime: pausedDurationSeconds },
      },
      {
        arrayFilters: [{ "elem._id": pauseEvent._id }],
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(500).json({ error: "Failed to update pause event." });
    }
    const updatedSession = await Session.findById(sessionId);
    return res.status(200).json(updatedSession);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errorMessage: error.message });
  }
};

const updateDefects = () => {};

const finalSubmission = () => {};
