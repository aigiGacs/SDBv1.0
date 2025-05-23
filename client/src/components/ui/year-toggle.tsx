import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

interface YearToggleProps {
  currentYear: number;
  onChange: (year: number) => void;
  className?: string;
}

export function YearToggle({ currentYear, onChange, className = "" }: YearToggleProps) {
  const { user } = useAuth();
  const [accessibleYears, setAccessibleYears] = useState<number[]>([]);

  useEffect(() => {
    if (user) {
      const years = user.canAccessYears as number[];
      if (user.role === "admin") {
        setAccessibleYears([1, 2, 3]);
      } else {
        setAccessibleYears(years);
      }
    }
  }, [user]);

  // Only render if there's more than one accessible year
  if (accessibleYears.length <= 1) {
    return null;
  }

  const getYearButtonClass = (year: number) => {
    const baseClasses = "px-4 py-1 rounded-full";
    
    if (year === currentYear) {
      switch (year) {
        case 1:
          return `${baseClasses} bg-first-primary text-white`;
        case 2:
          return `${baseClasses} bg-second-primary text-white`;
        case 3:
          return `${baseClasses} bg-third-primary text-white`;
        default:
          return `${baseClasses} bg-primary text-white`;
      }
    }
    
    return `${baseClasses} text-gray-700 hover:bg-gray-200 transition-colors`;
  };

  return (
    <div className={`bg-gray-100 rounded-full p-1 flex items-center ${className}`}>
      {accessibleYears.includes(1) && (
        <button
          onClick={() => onChange(1)}
          className={getYearButtonClass(1)}
        >
          1st Year
        </button>
      )}
      
      {accessibleYears.includes(2) && (
        <button
          onClick={() => onChange(2)}
          className={getYearButtonClass(2)}
        >
          2nd Year
        </button>
      )}
      
      {accessibleYears.includes(3) && (
        <button
          onClick={() => onChange(3)}
          className={getYearButtonClass(3)}
        >
          3rd Year
        </button>
      )}
    </div>
  );
}
