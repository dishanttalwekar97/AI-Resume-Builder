import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";

const generateToken = (userId) =>{
    const token = jwt.sign(
        { id: userId },   
        process.env.JWT_SECRET,  
        { expiresIn: '7d' }    
    );
    return token;
};


// controllers for user registration
//post: /api/users/register


export const registerUser = async (req, res) =>{
    try{
        const {name, email, password} = req.body;

        //check if required fields are present
        if(!name || !email || !password){
            return res.status(400).json({message: "Missing required fields"});
        } 

        //check if user already exists
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        //create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        //return success message
         await newUser.save();
        const token = generateToken(newUser._id);
        return res.status(201).json({message: "User registered successfully", token , user: newUser });
    }catch(error){
        return res.status(400).json({message: error.message});


    }
}

// controllers for user login
//post: /api/users/login


export const loginUser = async (req, res) =>{
    try{
        const {email, password} = req.body;


        //check if user already exists
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }

        //check if passward is correct
        if(!user.comparePassword(password)){
            return res.status(400).json({message: "Invalid email or password"});
        }

        //return success message
        const token = generateToken(user._id);
        user.password = undefined;

        return res.status(200).json({message: "User created successfully", token , user });


      

    }catch(error){
        return res.status(400).json({message: error.message});


    }
}


//controller for getting user by id
//get: /api/users/:id

export const getUserById = async (req,res) =>{
    try{
        const userId = req.userId;

        //ches is user exists
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({message: "User not found" ,token,user} );

        }
       //retrun user
       user.password = undefined;
       return res.status(200).json({user});

    }catch(error){
        return res.status(400).json({message: error.message});

    }
}


//controller fpr getting user resume
//GEt: /api/users/resumes

export const getUserResmumes = async (req,res) =>{
    try {
        const userId = req.userId;

        //return resumes
        const resumes = await Resume.find({userId})
        return res.status(200).json({resumes});
    } catch (error) {
        return res.status(400).json({message: error.message});
    }
}
