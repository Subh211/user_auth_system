import { Router } from "express";
import { registration } from "../controller/userController.js";

const router = Router();

router.get("/",((req,res)=> {
    try {
        res.status(200).json({
            success:true,
            message:"Welcome to user management system"
        })
    } catch (error) {
        return res.status(404).json({
            success:false,
            message:`Internal server error ${error.message}`
        })
    }
}))

router.post('/',registration)

export default router;