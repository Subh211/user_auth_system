import User from "../model/userModel.js";

const registration = async (req,res) => {
    try {
        const {userName,password,email} = req.body;

        if (!userName || !password || ! email) {
            return res.status(400).json({
                success:false,
                message:`Every field must required `
            })
        }

        const user = await User.create({
            userName,
            password,
            email 
        })

        return res.status(200).json({
            success:true,
            message:`User created succesfully`,
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`Internal server error ${error.message}`
        })
    }
} 

export {registration};