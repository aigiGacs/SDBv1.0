import { useQuery } from "@tanstack/react-query";
import { QuickAccessCard } from "@/components/cards/quick-access-card";
import { AnnouncementCard } from "@/components/cards/announcement-card";
import { ResourceCard } from "@/components/cards/resource-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { type QuickAccessCard as QuickAccessCardType } from "@shared/schema";
import { type Announcement as AnnouncementType } from "@shared/schema";
import { type Resource as ResourceType } from "@shared/schema";

export function ThirdYearDashboard() {
  const { user } = useAuth();
  const year = 3;

  const { data: quickAccessItems, isLoading: isLoadingQuickAccess } = useQuery({
    queryKey: [`/api/dashboard/${year}/quick-access`],
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: [`/api/dashboard/${year}/announcements`],
  });

  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: [`/api/dashboard/${year}/resources`],
  });

  if (isLoadingQuickAccess || isLoadingAnnouncements || isLoadingResources) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Welcome Banner */}
      <div className="bg-third-light rounded-lg shadow-sm p-6 mb-6 border-l-4 border-third-primary">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium text-gray-800">Hi, {user?.firstName}!</h2>
            <p className="text-gray-600 mt-1">Let's get serious! Internships, projects, and placements ahead.</p>
          </div>
          <div className="hidden md:block">
            <svg className="h-16 w-auto" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="80" rx="4" fill="#fbe9e7" />
              <path d="M20 50L35 35L50 50L65 35L80 50" stroke="#e64a19" strokeWidth="2" />
              <circle cx="50" cy="20" r="10" fill="#e64a19" />
              <path d="M35 60H65V65C65 67.7614 62.7614 70 60 70H40C37.2386 70 35 67.7614 35 65V60Z" fill="#e64a19" />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickAccessItems && quickAccessItems.map((item: QuickAccessCardType) => (
            <QuickAccessCard
              key={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              link={item.link}
              color="third"
            />
          ))}
        </div>
      </div>

      {/* Two Column Layout for Announcements and Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Announcements</h3>
            <Button variant="link" className="text-third-primary hover:text-third-secondary text-sm font-medium p-0">View All</Button>
          </div>
          
          <div className="space-y-4">
            {announcements && announcements.map((announcement: AnnouncementType) => (
              <AnnouncementCard
                key={announcement.id}
                title={announcement.title}
                content={announcement.content}
                type={announcement.type}
                createdAt={announcement.createdAt}
              />
            ))}
          </div>
        </div>
        
        {/* Featured Resources Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">Featured Resources</h3>
            <Button variant="link" className="text-third-primary hover:text-third-secondary text-sm font-medium p-0">View All</Button>
          </div>
          
          <div className="space-y-5">
            {resources && resources.map((resource: ResourceType) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                description={resource.description}
                link={resource.link}
                icon={resource.icon}
                color="third"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Welcome Banner Skeleton */}
      <div className="bg-third-light rounded-lg shadow-sm p-6 mb-6 border-l-4 border-third-primary">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="hidden md:block">
            <Skeleton className="h-16 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* Quick Access Cards Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <Skeleton className="h-10 w-10 rounded-full mb-3" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Announcements Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-4 border-gray-300 pl-4 py-1">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Featured Resources Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
