import type { Request, Response } from "express";
import crypto from "crypto";
import { hashPassword } from "../lib/passwordHelper.ts";

import { Team } from "../models/team.ts";
import { User } from "../models/users.ts";
import { TeamInvite } from "../models/teaminvite.ts";
import { TeamMember } from "../models/teammembers.ts";



export const createInvite = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const admin = await User.findById(req.user?._id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const team = await Team.findOne({
            owner_id: admin._id
        });

        if (!team) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        const memberCount = await TeamMember.countDocuments({
            team_id: team._id,
            status: "active"
        });

        const MAX_TEAM_MEMBERS = 50;

        if (memberCount >= MAX_TEAM_MEMBERS) {
            return res.status(400).json({
                message: "Team limit reached (50 members max). Cannot send new invites."
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const existingInvite = await TeamInvite.findOne({
            email,
            status: "pending"
        });

        if (existingInvite) {
            return res.status(400).json({
                message: "Invite already exists"
            });
        }

        const token = crypto
            .randomBytes(32)
            .toString("hex");

        const invite = await TeamInvite.create({
            email,
            team_id: team._id,
            invited_by: admin._id,

            token,

            status: "pending",

            expires_at: new Date(
                Date.now() + 1000 * 60 * 60 * 24
            ) // 24h
        });

        const inviteUrl =
            `http://localhost:5173/team-invite/${token}`;

        return res.status(201).json({
            success: true,
            invite_url: inviteUrl,
            invite
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};



export const validateInvite = async (
    req: Request,
    res: Response
) => {
    try {
        const { token } = req.params;

        const tokenParam = Array.isArray(req.params.token)
            ? req.params.token[0]
            : req.params.token;

        if (!tokenParam) {
            return res.status(400).json({
                message: "Token is required"
            });
        }

        const invite = await TeamInvite.findOne({
            token: tokenParam
        });

        if (!invite) {
            return res.status(404).json({
                message: "Invalid invite"
            });
        }

        if (invite.status === "accepted") {
            return res.status(400).json({
                message: "Invite already used"
            });
        }

        if (invite.expires_at < new Date()) {
            return res.status(400).json({
                message: "Invite expired"
            });
        }

        return res.status(200).json({
            success: true,
            email: invite.email
        });

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};





export const acceptInvite = async (
    req: Request,
    res: Response
) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password required"
            });
        }

        const invite = await TeamInvite.findOne({
            token
        });

        if (!invite) {
            return res.status(404).json({
                message: "Invalid invite"
            });
        }

        if (invite.status === "accepted") {
            return res.status(400).json({
                message: "Invite already used"
            });
        }

        if (invite.expires_at < new Date()) {
            return res.status(400).json({
                message: "Invite expired"
            });
        }

        const existingUser = await User.findOne({
            email: invite.email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword =
            await hashPassword(password);

        // 1. Create user (NO team_id)
        const user = await User.create({
            email: invite.email,
            password: hashedPassword,
            role: "customer"
        });

        // 2. Add to TeamMember collection
        await TeamMember.create({
            team_id: invite.team_id,
            user_id: user._id,
            role: "member",
            status: "active"
        });

        invite.status = "accepted";
        invite.used_at = new Date();

        await invite.save();

        return res.status(201).json({
            success: true,
            message: "Account created successfully"
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};