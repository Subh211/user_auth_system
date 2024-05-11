import {model, Schema } from "mongoose";

const userSchema = new Schema({
    userName:{
        type:String,
        trim:true,
    },
    password:{
        type:String,
        trim:true,
        requied:[true,"Password is a must"]
    },
    email:{
        type:String,
        trim:true,
        requied:[true,"Email is a must"]
    }

})

const User = model('User', userSchema)

export default User;