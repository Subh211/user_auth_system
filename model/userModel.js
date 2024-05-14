import mongoose, {model, Schema } from "mongoose";
import JWT from "jsonwebtoken";
import bcrypt  from 'bcrypt';

const userSchema = new Schema({
    userName:{
        type:String,
        trim:true,
    },
    email:{
        type:String,
        trim:true,
        requied:[true,"Email is a must"]
    },
    password:{
        type:String,
        trim:true,
        select:false,
        requied:[true,"Password is a must"]
    },
    confirmPassword:{
        type:String
    }

});

userSchema.pre('create',async function(next) {
    if (!this.isModified ('password') ) {
        next();
    }

    this.password = await bcrypt.hash(this.password,10);
    return next();
})

userSchema.methods = {
    jwtToken () {
        return JWT.sign (
            {id:this._id,email:this.email},
            process.env.SECRET,
            {expiresIn: '24h'}
        )
    }
}

const User = mongoose.model('User', userSchema)

export default User;