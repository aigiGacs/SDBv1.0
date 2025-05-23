interface AnnouncementCardProps {
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

export function AnnouncementCard({ title, content, type, createdAt }: AnnouncementCardProps) {
  const borderColorClass = 
    type === "info" ? "border-info" : 
    type === "warning" ? "border-warning" : 
    "border-error";
  
  // Format date from ISO string to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Posted today";
    } else if (diffInDays === 1) {
      return "Posted yesterday";
    } else {
      return `Posted ${diffInDays} days ago`;
    }
  };

  return (
    <div className={`border-l-4 ${borderColorClass} pl-4 py-1`}>
      <h4 className="font-medium text-gray-800 dark:text-gray-200">{title}</h4>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{content}</p>
      <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{formatDate(createdAt)}</p>
    </div>
  );
}
