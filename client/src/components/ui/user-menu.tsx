import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Settings, User, Edit } from "lucide-react";
import { useLocation } from "wouter";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Load profile image from localStorage on initial render
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('userProfileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const goToProfile = () => {
    setLocation("/profile");
  };

  const goToAdminDashboard = () => {
    setLocation("/admin");
  };

  const goToContentEditor = () => {
    setLocation("/content-editor");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center space-x-3 cursor-pointer outline-none">
        <span className="hidden md:block text-gray-700 dark:text-gray-200">{`${user.firstName} ${user.lastName}`}</span>
        {profileImage ? (
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-700">
            <img 
              src={profileImage} 
              alt={`${user.firstName} ${user.lastName}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
        )}
        <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={goToProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        {user.role === "admin" && (
          <DropdownMenuItem onClick={goToAdminDashboard} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </DropdownMenuItem>
        )}
        
        {(user.role === "admin" || (user.canEditYears && user.canEditYears.length > 0)) && (
          <DropdownMenuItem onClick={goToContentEditor} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            <span>Content Editor</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
