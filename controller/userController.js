import User from "../model/userModel.js";
import emailValidator from "email-validator";
import bcrypt  from 'bcrypt';
import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';
import fs from 'fs/promises';



const registration = async (req, res) => {
    try {
        const { userName, email, password, confirmPassword } = req.body;

        // Validate required fields
        if (!userName || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: `Every field must be required`
            });
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: `Password and confirm password do not match`
            });
        }

        // Validate email format
        const validEmail = emailValidator.validate(email);
        if (!validEmail) {
            return res.status(400).json({
                success: false,
                message: `Please enter a valid email`
            });
        }

        // Check if email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(500).json({
                success: false,
                message: `Email already exists`
            });
        }

        // Check if username already exists
        user = await User.findOne({ userName });
        if (user) {
            return res.status(500).json({
                success: false,
                message: `Username already exists`
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upload avatar to Cloudinary
        let avatar = {};
        if (req.file) {
            const result = await cloudinaryV2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            });

            // Construct avatar object
            avatar = {
                public_id: result.public_id,
                secure_url: result.secure_url
            };

            // Delete uploaded file from local filesystem
            await fs.unlink(req.file.path);
        }

        // Create user with avatar
        user = await User.create({
            userName,
            email,
            password: hashedPassword,
            avatar
        });

        // Generate JWT token
        const token = user.jwtToken();

        // Omit password from response
        user.password = undefined;

        // Set token cookie
        const cookieOptions = {
            maxAge: 24 * 60 * 3600 * 1000,
            httpOnly: true
        };
        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            message: `User created successfully`,
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}`
        });
    }
};




const signIn = async (req,res) => {

    const {email,password} = req.body;

    if (!email || !password) {
        res.status(400).json({
            success:false,
            message:"Every field is required"
        })
    }

    try {
        
    const userPresentOrNot = await User.findOne({
        email
    }).select('+password');

    if (!userPresentOrNot || ! bcrypt.compare(password, userPresentOrNot.password)) {
        res.status(400).json({
            success:false,
            message:"Invalid credentials"
        })
    }

    const token = userPresentOrNot.jwtToken();
    userPresentOrNot.password = undefined;

    const cookieOptions = {
        maxAge:24*60*3600*1000,
        httpOnly:true
    }

    res.cookie("token",token,cookieOptions)

    res.status(200).json ({
        success:true,
        data:userPresentOrNot
    })

    } catch (error) { 
        res.status(400).json({
            success:false,
            message:`Error occured ${error.message}`
        })
    }
}



const userDetails = async (req,res) =>{
    const userId = req.user.id

    try {
        const user = await User.findById(userId)
        return res.status(200).json({
            success:true,
            message:user
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:error.message
        })
    }
}



const logOut = (req,res) => {

    try {
        const cookieOptions = {
            expires:new Date(),
            httpOnly:true
        }

        res.cookie("token",null,cookieOptions)
        res.status(200).json({
            success:true,
            message:"Logged out"
        })

    } catch (error) {
        res.status(400).json({
            success:false,
            message:error.message
        })
    }

}

export {registration,signIn,userDetails,logOut};