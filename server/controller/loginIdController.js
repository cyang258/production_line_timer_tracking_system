import LoginId from "../model/loginIdModel.js";

export const validateLoginId = async (req, res) => {
    try {
        console.log('try to get id')
        const { loginId } = req.body;

        const id = await LoginId.findOne({ loginId });

        if (!id) {
            return res.status(200).json({ valid: false, message: "Login ID not found." });
        }

        return res.status(200).json({ valid: true, message: "Login ID is valid." });
    } catch (error) {
        return res.status(500).json({ valid: false, errorMessage: error.message });
    }
}

