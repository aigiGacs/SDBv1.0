import { useState, useEffect } from "react";
import { YearToggle } from "@/components/ui/year-toggle";
import { UserMenu } from "@/components/ui/user-menu";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "../ui/button";

interface HeaderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

export function Header({ currentYear, onYearChange }: HeaderProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-gray-800 flex items-center justify-center text-white text-xs font-bold">
              ED
            </div>
            <h1
              className="text-xl font-medium hidden md:block cursor-pointer"
              onClick={() => setLocation("/dashboard")}
            >
              Engineering Dashboard
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <YearToggle 
                currentYear={currentYear} 
                onChange={onYearChange}
              />
            )}
            
            {user && (
              <div className="flex items-center space-x-3">
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation("/admin")}
                    className="hidden md:flex"
                  >
                    Admin Panel
                  </Button>
                )}
                <UserMenu />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
