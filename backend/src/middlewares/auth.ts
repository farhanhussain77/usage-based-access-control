import { User } from "../models/users.ts";
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers['authorization'];

    if(!authorization){
        console.log("authorization header is not found!");
        return res.status(401).json({success: false, message: "Unauthorized"})
    }

    const authorizationParts = authorization.split(" ");
    const isBreaer = authorizationParts?.[0]?.trim()?.toLowerCase() === "bearer";

    if(!isBreaer){
        console.log("token is not bearer!");
        return res.status(401).json({success: false, message: "Token must be Bearer!"})
    }

    const token = authorizationParts?.[1];
    if(!token){
        console.log("token is not found!");
        return res.status(401).json({success: false, message: "Unauthorized"})
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    if(typeof payload === "string"){
        console.log("token is not valid!");
        return res.status(401).json({success: false, message: "Unauthorized"})
    }

    const email = payload?.user?.email;
    const user = await User.findOne({email}).select("-password");

    if(!user){
        console.log(`user ${email} does not exist in database!`);
        return res.status(401).json({success: false, message: "Unauthorized"})
    }else{
        req.user = user;
        console.log("[AUTH MIDDLEWARE] User is authenticated: ", payload?.user?.email);
    }

    next();
}