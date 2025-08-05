import Build from "../model/buildModel.js";

export const getBuildByBuildNumber = async (req, res) => {
    try {
        const { buildNumber } = req.query;
        console.log('here', buildNumber)
        const build = await Build.findOne({ buildNumber });
        if (!build) {
            return res.status(404).json({ error: "Build is not available" })
        }
        return res.status(200).json(build);
    } catch (error) {
        return res.status(500).json({errorMessage: error.message})
    }
}

