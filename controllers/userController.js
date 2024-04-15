const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const config = require('../config');
const ObjectId = require('mongodb').ObjectId;

const signup = async (req, res) => {
    const existingUser = await User.findOne({email: req.body.email});
    if(existingUser) {
        return res.status(200).json({
            message: "User Already Registered",
            success: "warning"
        })
    }
    const avt = req.body.displayName[0].toUpperCase()
    const hashedPassword = await bcrypt.hashSync(req.body.password, 8);
    const user = new User({
        displayName: req.body.displayName,
        password: hashedPassword,
        email: req.body.email,
        googleId: '',
        avatar: {
            data: avt,
            imgType: 'text'
        }
    });
    await user.save();
    return res.status(200).json({
        message: "Registered Successfully",
        success: true
    })
}

const login = async(req, res) => {
    const existingUser = await User.findOne({email: req.body.email});
    if(existingUser) {
        const comparePassword = await bcrypt.compareSync(req.body.password, existingUser.password);
        if(comparePassword) {
            const user_token = jwt.sign({id: existingUser._id}, config.secrets.jwt_key, {expiresIn: 84600});
            return res.status(200).json({
                message: "Logged in successfully",
                token: user_token,
                success: true
            })
        } else {
            return res.status(403).json({
                message: "Password is incorrect. Try again",
                success: false
            })
        }
    } else {
        return res.status(403).json({
            message: "User does not exist. Create your account",
            success: false
        })
    }
}

const userInfo = async (req, res) => {
    const token = req.headers['x-access-token'];
    if(!token) {
        return res.status(403).json({
            message: "Invalid user credential",
            auth: false
        })
    }
    jwt.verify(token, config.secrets.jwt_key, (err, result) => {
        if(err) { 
            return res.status(403).json({
                message: "Invalid user credential",
                auth: false
            })
        }
        User.findOne({_id: new ObjectId(result.id)})
            .then(result => {
                res.status(200).json({result})
            })  
    })
}

module.exports = {
    signup: signup,
    login: login,
    userInfo: userInfo,
}