import { Link } from "wouter";
import { 
  FaBookOpen, FaFileAlt, FaUserTie, FaMapMarkerAlt, FaLaptopCode,
  FaUsers, FaCreditCard, FaRobot, FaBook, FaChalkboardTeacher,
  FaCodeBranch, FaUserGraduate, FaRoute, FaFlask, FaBriefcase,
  FaLightbulb, FaBookReader
} from "react-icons/fa";

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  color: "first" | "second" | "third";
}

export function QuickAccessCard({ title, description, icon, link, color }: QuickAccessCardProps) {
  const bgColorClass = 
    color === "first" ? "bg-first-light" : 
    color === "second" ? "bg-second-light" : 
    "bg-third-light";
  
  const textColorClass = 
    color === "first" ? "text-first-primary" : 
    color === "second" ? "text-second-primary" : 
    "text-third-primary";
  
  const getIcon = () => {
    switch (icon) {
      case "book-open": return <FaBookOpen className="h-5 w-5" />;
      case "file-alt": return <FaFileAlt className="h-5 w-5" />;
      case "user-tie": return <FaUserTie className="h-5 w-5" />;
      case "map-marker-alt": return <FaMapMarkerAlt className="h-5 w-5" />;
      case "laptop-code": return <FaLaptopCode className="h-5 w-5" />;
      case "users": return <FaUsers className="h-5 w-5" />;
      case "credit-card": return <FaCreditCard className="h-5 w-5" />;
      case "robot": return <FaRobot className="h-5 w-5" />;
      case "book": return <FaBook className="h-5 w-5" />;
      case "chalkboard-teacher": return <FaChalkboardTeacher className="h-5 w-5" />;
      case "code-branch": return <FaCodeBranch className="h-5 w-5" />;
      case "user-graduate": return <FaUserGraduate className="h-5 w-5" />;
      case "route": return <FaRoute className="h-5 w-5" />;
      case "flask": return <FaFlask className="h-5 w-5" />;
      case "briefcase": return <FaBriefcase className="h-5 w-5" />;
      case "lightbulb": return <FaLightbulb className="h-5 w-5" />;
      case "book-reader": return <FaBookReader className="h-5 w-5" />;
      default: return <FaBookOpen className="h-5 w-5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-card rounded-lg shadow-sm overflow-hidden card-hover border border-gray-100 dark:border-gray-800 cursor-pointer" 
         onClick={() => window.location.href = link}>
      <div className="p-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${bgColorClass} ${textColorClass} mb-3`}>
          {getIcon()}
        </div>
        <h4 className="font-medium text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}
