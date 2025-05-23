import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { FirstYearDashboard } from "@/components/dashboards/first-year";
import { SecondYearDashboard } from "@/components/dashboards/second-year";
import { ThirdYearDashboard } from "@/components/dashboards/third-year";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { RequireAuth } from "@/lib/auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [currentYear, setCurrentYear] = useState<number>(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (user && user.canAccessYears.length > 0) {
      // Set current year to the highest year the user can access
      const highestYear = Math.max(...(user.canAccessYears as number[]));
      setCurrentYear(highestYear);
    }
  }, [user]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
  };

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Header currentYear={currentYear} onYearChange={handleYearChange} />
        
        {/* Mobile Year Selector */}
        {isMobile && (
          <div className="bg-white border-b shadow-sm md:hidden">
            <div className="container mx-auto px-4">
              <div className="flex overflow-x-auto py-2 space-x-4">
                {user && user.canAccessYears.includes(1) && (
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      currentYear === 1
                        ? "text-white bg-first-primary"
                        : "text-gray-700 bg-gray-100"
                    } rounded-md`}
                    onClick={() => handleYearChange(1)}
                  >
                    1st Year
                  </button>
                )}
                {user && user.canAccessYears.includes(2) && (
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      currentYear === 2
                        ? "text-white bg-second-primary"
                        : "text-gray-700 bg-gray-100"
                    } rounded-md`}
                    onClick={() => handleYearChange(2)}
                  >
                    2nd Year
                  </button>
                )}
                {user && user.canAccessYears.includes(3) && (
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      currentYear === 3
                        ? "text-white bg-third-primary"
                        : "text-gray-700 bg-gray-100"
                    } rounded-md`}
                    onClick={() => handleYearChange(3)}
                  >
                    3rd Year
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="flex-grow">
          {currentYear === 1 && <FirstYearDashboard />}
          {currentYear === 2 && <SecondYearDashboard />}
          {currentYear === 3 && <ThirdYearDashboard />}
        </main>

        <Footer />
      </div>
    </RequireAuth>
  );
}
