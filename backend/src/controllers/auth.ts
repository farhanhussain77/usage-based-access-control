import type { Request, Response } from "express";
import { User } from "../models/users.ts";
import { hashPassword, verifyPassword } from "../lib/passwordHelper.ts";
import jwt from 'jsonwebtoken';
import { Subscriptions } from "../models/subscriptions.ts";

const createUser = async (req: Request, res: Response) => {
    console.log("createUser", req.body);
    const body = req.body;

    try{
        const email = body.email;
        const password = body.password;

        if(!email || !password){
            return res.status(400).json({success: false, message: "Invalid request! email and password are required"})
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            email: body.email,
            password: hashedPassword
        });

        await Subscriptions.create({
            user_id: user.id,
            start_date: new Date()
        })

        return res.status(201).json({success: true, message: "User is created successfully!"})
    }catch(err){
        return res.status(500).json({success: false, message: "Internal server error"});
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

        const isValid = await verifyPassword(password, user.password);
        if(!isValid){
            console.log("password did not matched!");
            return res.status(404).json({message: "Invalid email or password"});
        }

        const subscription = await Subscriptions.findOne({user_id: user.id});

        const userPayload = {
            name: user.name, 
            email: user.email,
            subscription: {
                plan: subscription?.plan,
                limit_exceeded: subscription?.current_usage === subscription?.max_usage_limit
            }
        }

        const token = jwt.sign({user: userPayload}, process.env.JWT_SECRET as string, {
            expiresIn: '1d'
        });
    
        return res.status(200).json({
            user: userPayload,
            token,
            message: "success"
        })
    }catch(err){
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getCurrentUser = async (req: Request, res: Response) => {
    const user = await User.findOne({email: req.user.email}).select("-password");
    if(!user){
        return res.status(404).json({message: "User does not exist"})
    }

    const subscription = await Subscriptions.findOne({user_id: user.id});

    const userPayload = {
        name: user.name, 
        email: user.email,
        subscription: {
            plan: subscription?.plan,
            limit_exceeded: subscription?.current_usage === subscription?.max_usage_limit
        }
    }

    return res.status(200).json({user: userPayload, success: true});
}

export {
    createUser,
    login
}