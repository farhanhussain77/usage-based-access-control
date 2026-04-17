import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { User } from "lucide-react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import { use } from "react";
import { AuthContext } from "@/contexts/Auth";

export function ProfilePopover() {
    const { getUser } = use(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        Cookies.remove("token");
        navigate("/auth");
    }

    const user = getUser();
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="w-5 h-5 p-5 rounded-full bg-white" variant="outline">
                    <User width={20} height={20} />    
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <div>
                    <p className="font-semibold">{user?.name || "User"}</p>
                    <hr className="my-4" />
                    <div 
                        onClick={onLogout} 
                        className="cursor-pointer p-3 hover:bg-gray-100" 
                        role="button"
                    >
                        Logout
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
