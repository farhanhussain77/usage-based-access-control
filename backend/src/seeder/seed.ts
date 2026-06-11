import connectToDB from "../db/connection.ts";
import { hashPassword } from "../lib/passwordHelper.ts";
import { User } from "../models/users.ts";

const seedSuperAdmin = async () => {
    try{
        await connectToDB();
        const superAdmin = await User.findOne({role: 'superadmin'});
        if(superAdmin){
            console.log("Super admin already exists!")
            return;
        }

        const hashedPassword = await hashPassword("password_123");
        
        console.log("Creating super admin record in Users collection...")
        await User.create({
            name: "Super Admin",
            email: "superadmin@gmail.com",
            password: hashedPassword,
            role: 'superadmin'
        });
        console.log("Super admin created...")
    }catch(err){
        console.log("Error while seeding super admin", err);
    }finally{
        console.log("exiting...")
        process.exit(0)
    }
}


seedSuperAdmin();
