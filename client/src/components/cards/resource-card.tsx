import { 
  FaYoutube, FaProjectDiagram, FaCertificate, FaChartLine,
  FaTools, FaFileAlt, FaQuestionCircle
} from "react-icons/fa";

interface ResourceCardProps {
  title: string;
  description: string;
  link: string;
  icon: string;
  color: "first" | "second" | "third";
}

export function ResourceCard({ title, description, link, icon, color }: ResourceCardProps) {
  const bgColorClass = 
    color === "first" ? "bg-first-light" : 
    color === "second" ? "bg-second-light" : 
    "bg-third-light";
  
  const textColorClass = 
    color === "first" ? "text-first-primary" : 
    color === "second" ? "text-second-primary" : 
    "text-third-primary";
  
  const linkColorClass = 
    color === "first" ? "text-first-primary" : 
    color === "second" ? "text-second-primary" : 
    "text-third-primary";
  
  const getIcon = () => {
    switch (icon) {
      case "youtube": return <FaYoutube className="text-xl" />;
      case "project-diagram": return <FaProjectDiagram className="text-xl" />;
      case "certificate": return <FaCertificate className="text-xl" />;
      case "chart-line": return <FaChartLine className="text-xl" />;
      case "tools": return <FaTools className="text-xl" />;
      case "file-alt": return <FaFileAlt className="text-xl" />;
      case "question-circle": return <FaQuestionCircle className="text-xl" />;
      default: return <FaProjectDiagram className="text-xl" />;
    }
  };

  return (
    <div className="flex items-start space-x-3">
      <div className={`flex-shrink-0 ${bgColorClass} ${textColorClass} p-2 rounded`}>
        {getIcon()}
      </div>
      <div>
        <h4 className="font-medium text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
        <a href={link} className={`${linkColorClass} text-sm font-medium mt-1 inline-block`}>
          {link.includes("playlist") ? "View Playlist" : 
           link.includes("project") ? "Explore Projects" :
           link.includes("certification") ? "View Certifications" :
           link.includes("domain") ? "Explore Domains" :
           link.includes("tool") ? "View Tools" :
           link.includes("resume") ? "View Guide" :
           link.includes("question") ? "Start Practicing" :
           "Learn More"}
        </a>
      </div>
    </div>
  );
}
