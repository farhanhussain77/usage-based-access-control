import type { Request, Response } from "express";
import { User } from "../models/users";
import { hashPassword } from "@/lib/hashPassword";
import jwt from 'jsonwebtoken';

const createUser = async (req: Request, res: Response) => {
    const body = req.body;

    try{
        const email = body.email;
        const password = body.password;

        if(!email || !password){
            return res.status(400).json({message: "Invalid request! email and password are required"})
        }

        const hashedPassword = await hashPassword(password);

        const user = new User({
            email: body.email,
            password: hashedPassword
        });

        return res.status(201).json({message: "User is created successfully!"})
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
};

const login = async (req: Request, res: Response) => {

    const {email, password} = req.body;

    try{
        if(!email || !password){
            return res.status(400).json({message: "Invalid email or password"})
        }

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "Invalid email or password"});
        }

        const hashedPassword = await hashPassword(password);
        if(user.password !== hashedPassword){
            res.status(404).json({message: "Invalid email or password"});
        }

        const token = jwt.sign({name: user.name, email: user.email}, process.env.JWT_SECRET as string, {
            expiresIn: '1d'
        })
    
        return res.status(200).json({
            user: {name: user.name, email: user.email}, 
            token, 
            message: "success"
        })
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}


export {
    createUser,
    login
}