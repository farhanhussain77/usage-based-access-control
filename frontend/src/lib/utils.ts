import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const readTokenFromCookie = () => {
  const token = cookies.get("token");
  if(!token) {
      return null;
  }

  const decodedToken = jwtDecode(token);
  if(!decodedToken?.exp || (new Date(decodedToken.exp * 1000) < new Date())){
    return null;
  }

  return (decodedToken as any).user
}