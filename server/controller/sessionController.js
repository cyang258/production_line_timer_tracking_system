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

// check if a user has active session
export const isActiveSessionForUserByLoginId = async (req, res) => {
  try {
    const { loginId } = req.query;
    const session = await Session.findOne({
      loginId,
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

    // Update resumedAt and totalPausedTime automically
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

export const popupInteractionPause = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const response = await createPopupInteractionPause(
      sessionId,
      new Date(),
      new Date()
    );
    if (response.success) {
      return res.status(200).json({ success: true, message: response.message });
    }
    return res.status(400).json({ success: false, message: response.message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resumePopupInteractionAccept = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const response = await respondToPopupInteractionPause(sessionId, "Yes");
    if (response.success) {
      return res.status(200).json({
        success: true,
        message: response.message,
        data: response.data,
      });
    }
    return res
      .status(400)
      .json({ success: false, message: response.message, data: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* If user click No, then that mean they want to pause */
export const resumePopupInteractionReject = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const response = await respondToPopupInteractionPause(sessionId, "No");
    if (!response.success) {
      return res
        .status(200)
        .json({ success: false, message: response.message, data: null });
    }
    // pause the session
    const session = await Session.findOne({
      _id: sessionId,
      sessionStatus: { $nin: ["completed", "auto-submitted"] },
    });

    if (!session) {
      console.log("cannot find session");
      return res.status(404).json({ error: "Session is not available" });
    }
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

    return res.status(200).json({
      success: true,
      message: "rejected response selected",
      data: session,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recoverPopupInteractionSessionFromCountDownSession = async (
  req,
  res
) => {
  // To recover lost session from count down
  //    1. createPopupInteractionPause
  //    2. return updated session
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

    // now we calculate when session should be paused
    // -- if user disconnected during count down period
    // -- the popupShownAt = startTime + totalPausedTime + numberOfParts x timePerPart which is also pausedAt time
    const popupShownAt = new Date(
      new Date(session.startTime).getTime() +
        session.totalPausedTime * 1000 +
        session.numberOfParts * session.timePerPart * 60 * 1000
    );

    const newSession = await createPopupInteractionPause(
      sessionId,
      popupShownAt,
      popupShownAt
    );

    if (newSession.success) {
      return res.status(200).json({
        success: true,
        message: newSession.message,
        data: newSession.data,
      });
    }
    return res
      .status(200)
      .json({ success: false, message: newSession.message, data: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recoverSessionFromAfterInteractWithPopupSession = async (
  req,
  res
) => {
  // To recover lost session from count down
  //    1. createPopupInteractionPause
  //    2. return updated session
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

    // now we calculate when session should be paused
    // -- if user disconnected after interact with popup
    // -- the popupShownAt = last popup interact time + 10 mins
    const latestInteraction = session.popupInteractions.reduce(
      (latest, current) => {
        return new Date(current.popupShownAt) > new Date(latest.popupShownAt)
          ? current
          : latest;
      }
    );

    const popupShownAt = new Date(
      new Date(latestInteraction.respondedAt).getTime() + 10 * 60 * 1000
    );

    const newSession = await createPopupInteractionPause(
      sessionId,
      popupShownAt,
      popupShownAt
    );

    if (newSession.success) {
      return res.status(200).json({
        success: true,
        message: newSession.message,
        data: newSession.data,
      });
    }
    return res
      .status(200)
      .json({ success: false, message: newSession.message, data: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createPopupInteractionPause = async (
  sessionId,
  pausedAt,
  popupShownAt
) => {
  try {
    // Find the session
    const session = await Session.findOne({
      _id: sessionId,
      sessionStatus: { $nin: ["completed", "auto-submitted"] },
    });

    if (!session) {
      console.log("cannot find session");
      return { success: false, message: "cannot found session" };
    }

    // in case of data corruption or unexpected beheavior cuased unresumed pause event
    const activePauseEvent = session.pauseEvents.find(
      (pe) => pe.resumedAt === null
    );

    const activePopupInteraction = session.popupInteractions.find(
      (pi) => pi.respondedAt === null
    );

    if (activePauseEvent || activePopupInteraction) {
      if (activePauseEvent && !activePopupInteraction) {
        // if user pause while during popup interaction
        // we close the pause event
        const resumedAt = new Date();
        activePauseEvent.resumedAt = new Date();
        const pauseDurationSeconds = Math.floor(
          (resumedAt - activePauseEvent.pausedAt) / 1000
        );
        session.totalPausedTime += pauseDurationSeconds;
      } else {
        return {
          success: false,
          message:
            "There is already an active pause event. Please resume it before pausing again.",
        };
      }
    }

    // Add a new pauseEvent
    session.pauseEvents.push({
      pausedAt,
      isPopupInteraction: true,
      resumedAt: null,
    });

    session.popupInteractions.push({
      popupShownAt,
      response: "N/A",
    });

    await session.save();
    return { success: true, message: "successfully created", data: session };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message, data: null };
  }
};

const respondToPopupInteractionPause = async (sessionId, respond) => {
  try {
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
    const activePopupInteractionPauseEvent = session.pauseEvents.find(
      (pe) => pe.resumedAt === null && pe.isPopupInteraction
    );

    const activePopupInteraction = session.popupInteractions.find(
      (pi) => pi.respondedAt === null
    );

    if (!activePopupInteraction || !activePopupInteractionPauseEvent) {
      return {
        success: false,
        message: "Bad Data, missing active pause/popup interaction event",
      };
    }

    const now = new Date();
    activePopupInteractionPauseEvent.resumedAt = now;
    activePopupInteraction.respondedAt = now;
    activePopupInteraction.response = respond;

    await session.save();
    return { success: true, message: "successfully created", data: session };
  } catch (error) {
    console.error(error);
    return { success: false, message: error.message, data: null };
  }
};

/* 
  - Close the popup interaction event
  - Update session status to complete
  - Update defects in input
  - Update isAutoSubmitted to true
  - 
*/
export const autoSubmit = async (req, res) => {
  const { sessionId } = req.body;
  const session = await Session.findOne({
    _id: sessionId,
    sessionStatus: { $nin: ["completed", "auto-submitted"] },
  });
  if (!session) {
    console.log("cannot find session");
    return res.status(404).json({ error: "Session is not available" });
  }

  // find active popup interaction
  const activePopupInteraction = session.popupInteractions.find(
    (pi) => pi.respondedAt === null
  );

  if (!activePopupInteraction) {
    // if it does not have any active popup interaction, then it means it was reconnected from countdown session
    // OR after user click yes then put it away
    // auto close it
    // by maximum, the active time is timePerPart x numberOfParts and inactive time is totalPausedTime
    // first we have to check if it has popup interaction at all
    // -- if not have it, then totalActiveTime = numberOfParts * timePerPart
    // -- if have it, since each popup will reschedule in 10 mins, so each "Yes"/"No" response popup session give user maximum 10 mins
    // -- so totalActiveTime = numberOfParts * timePerPart + popupinteractions.length * 10
    const nonAutoPopupInteractions = session.popupInteractions.filter(() => {
      (pi) => pi.response !== "Auto";
    });
    // Auto means it is auto closed, so there is no active working hours after that
    const totalActiveTime =
      nonAutoPopupInteractions === 0
        ? session.numberOfParts * session.timePerPart * 60
        : (session.numberOfParts * session.timePerPart +
            nonAutoPopupInteractions.length * 10) *
          60;
    const totalInactiveTime = session.totalPausedTime;
    const submitResult = await submitSession({
      sessionId,
      isAutoSubmit: true,
      totalActiveTime,
      totalInactiveTime,
    });
    if (submitResult.success) {
      return res.status(200).json({
        success: true,
        message: "Session auto-submitted successfully.",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: submitResult.message || "Auto-submit failed.",
      });
    }
  }
  // close active popup interacton by update respondedAt
  // but it might be reconnection when popup UI shows and user disconnect with system, so the period might be longer than 10 mins
  // check if now is longer than popupinteraction.popupShownAt + 10 mins
  const respondedAt = new Date();
  const theoryRespondTime =
    new Date(activePopupInteraction.popupShownAt).getTime() + 10 * 60 * 1000;
  const isReconnectAfterPopupShowTimesUp =
    new Date().getTime() >
    new Date(activePopupInteraction.popupShownAt).getTime() + 10 * 60 * 1000;
  // we still update the true time that user update the system, but if isReconnectAfterPopupShowTimesUp, we use different method to calculate active/inactive time
  const updateResult = await Session.updateOne(
    { _id: sessionId },
    {
      $set: {
        "popupInteractions.$[elem].respondedAt": respondedAt,
        "popupInteractions.$[elem].response": "Auto",
      },
    },
    {
      arrayFilters: [{ "elem._id": activePopupInteraction._id }],
    }
  );
  if (updateResult.modifiedCount === 0) {
    return res.status(500).json({ error: "Failed to update pause event." });
  }
  // calculate total active/inactive time
  const updatedSession = await Session.findById(sessionId);

  const updatedPopupInteractions = updatedSession.popupInteractions.filter(
    (i) => i.response !== "Auto"
  );
  const now = isReconnectAfterPopupShowTimesUp
    ? theoryRespondTime
    : respondedAt.getTime();
  const sessionStart = new Date(updatedSession.startTime).getTime();
  const totalSessionDuration = Math.floor((now - sessionStart) / 1000);
  // inactive time = working session + after popup working session - totalPausedTime
  const totalWorkingSession =
    updatedSession.numberOfParts * updatedSession.timePerPart * 60;
  const totalPopupWorkingSession = updatedPopupInteractions.length * 10 * 60;
  const totalActiveTime =
    totalWorkingSession + totalPopupWorkingSession - session.totalPausedTime;
  // inactive time = now -start - totalActiveTime
  const totalInactiveTime = totalSessionDuration - totalActiveTime;
  const submitResult = await submitSession({
    sessionId,
    isAutoSubmit: true,
    totalActiveTime,
    totalInactiveTime,
  });

  if (submitResult.success) {
    return res
      .status(200)
      .json({ success: true, message: "Session auto-submitted successfully." });
  } else {
    return res.status(500).json({
      success: false,
      message: submitResult.message || "Auto-submit failed.",
    });
  }
};

export const manualSubmit = async (req, res) => {
  const { sessionId, defects, totalParts } = req.body;
  const session = await Session.findOne({
    _id: sessionId,
    sessionStatus: { $nin: ["completed", "auto-submitted"] },
  });
  if (!session) {
    console.log("cannot find session");
    return res.status(404).json({ error: "Session is not available" });
  }
  const now = Date.now();
  const start = session.startTime;
  const totalPausedTime = session.totalPausedTime;
  const totalPopupMs = session.popupInteractions.reduce(
    (total, interaction) => {
      const start = new Date(interaction.popupShownAt);
      const end = new Date(interaction.respondedAt);
      return total + (end - start);
    },
    0
  );
  // session duration = now - start
  // pausedTime = normal session paused time + after popup paused time
  // popupTime = accumulate popupinteractions array
  // inActiveTime = pausedTime + popupTime
  // activeTime = session duration - inActiveTime = now - start - pausedTime - popupTime
  // in Logic I have maintianed counting paused time even after popup session, so session.totalPausedTime is the actual total paused time
  const totalActiveTime = (now - start - totalPopupMs) / 1000 - totalPausedTime;
  const totalInactiveTime = totalPopupMs / 1000 + totalPausedTime;
  const submitResult = await submitSession({
    defects,
    totalParts,
    sessionId,
    isManuallySubmitted: true,
    totalActiveTime,
    totalInactiveTime,
  });
  if (submitResult.success) {
    return res.status(200).json({
      success: true,
      message: "Session manual-submitted successfully.",
    });
  } else {
    return res.status(500).json({
      success: false,
      message: submitResult.message || "Manual-submit failed.",
    });
  }
};

/* 
  - Update defects
  - Update totalParts
  - Update isAutoSubmitted/isMannuallySubmited
  - Update totalActiveTime
  - Update totalInactiveTime
  - Update sessionStatus to complete
*/
const submitSession = async ({
  sessionId,
  isAutoSubmit,
  totalActiveTime,
  totalInactiveTime,
  defects = null,
  totalParts = null,
}) => {
  const updateData = {};

  if (defects !== null && defects !== undefined) {
    updateData.defects = defects;
  }

  if (totalParts !== null && totalParts !== undefined) {
    updateData.totalParts = totalParts;
  }

  if (isAutoSubmit) {
    updateData.isAutoSubmitted = true;
  } else {
    updateData.isManuallySubmitted = true;
  }
  updateData.totalActiveTime = totalActiveTime;
  updateData.totalInactiveTime = totalInactiveTime;
  updateData.sessionStatus = "completed";

  try {
    const updateResult = await Session.updateOne(
      { _id: sessionId },
      { $set: updateData }
    );

    if (updateResult.modifiedCount === 0) {
      return { success: false, message: "No session updated" };
    }

    console.log("Session updated successfully.");
    return { success: true };
  } catch (error) {
    console.error("Failed to update session:", error);
    return { success: false, message: error.message };
  }
};
