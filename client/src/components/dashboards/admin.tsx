import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, PlusIcon, TrashIcon, UsersIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("students");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => {
      // For demo purposes, we'll return mock data
      // In a real app, this would fetch from the API
      return [
        { id: 1, username: "admin", firstName: "Admin", lastName: "User", email: "admin@college.edu", role: "admin", year: 0 },
        { id: 2, username: "year1", firstName: "Arjun", lastName: "Singh", email: "year1@college.edu", role: "student", year: 1 },
        { id: 3, username: "year2", firstName: "Priya", lastName: "Kumar", email: "year2@college.edu", role: "student", year: 2 },
        { id: 4, username: "year3", firstName: "Vikram", lastName: "Patel", email: "year3@college.edu", role: "student", year: 3 },
        { id: 5, username: "year4", firstName: "Ananya", lastName: "Sharma", email: "year4@college.edu", role: "student", year: 4 }
      ];
    }
  });

  const { data: quickAccessData, isLoading: isLoadingQuickAccess } = useQuery({
    queryKey: ["/api/admin/quick-access"],
    queryFn: async () => {
      // In a real app, this would fetch all quick access cards
      // For demo, we'll combine the queries for each year
      const year1 = await fetch("/api/dashboard/1/quick-access").then(res => res.json());
      const year2 = await fetch("/api/dashboard/2/quick-access").then(res => res.json());
      const year3 = await fetch("/api/dashboard/3/quick-access").then(res => res.json());
      return [...year1, ...year2, ...year3];
    }
  });

  const { data: announcementsData, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: ["/api/admin/announcements"],
    queryFn: async () => {
      // In a real app, this would fetch all announcements
      // For demo, we'll combine the queries for each year
      const year1 = await fetch("/api/dashboard/1/announcements").then(res => res.json());
      const year2 = await fetch("/api/dashboard/2/announcements").then(res => res.json());
      const year3 = await fetch("/api/dashboard/3/announcements").then(res => res.json());
      return [...year1, ...year2, ...year3];
    }
  });

  const { data: resourcesData, isLoading: isLoadingResources } = useQuery({
    queryKey: ["/api/admin/resources"],
    queryFn: async () => {
      // In a real app, this would fetch all resources
      // For demo, we'll combine the queries for each year
      const year1 = await fetch("/api/dashboard/1/resources").then(res => res.json());
      const year2 = await fetch("/api/dashboard/2/resources").then(res => res.json());
      const year3 = await fetch("/api/dashboard/3/resources").then(res => res.json());
      return [...year1, ...year2, ...year3];
    }
  });

  const goToContentEditor = () => {
    setLocation("/content-editor");
  };

  const promoteMutation = useMutation({
    mutationFn: async (userId: number) => {
      // In a real app, this would call an API endpoint
      // For demo, we'll simulate a successful promotion
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "Student promoted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to promote student",
        variant: "destructive",
      });
    }
  });

  const handlePromoteStudent = (userId: number) => {
    promoteMutation.mutate(userId);
  };

  const renderYearBadge = (year: number) => {
    switch (year) {
      case 1:
        return <Badge className="bg-first-primary">1st Year</Badge>;
      case 2:
        return <Badge className="bg-second-primary">2nd Year</Badge>;
      case 3:
        return <Badge className="bg-third-primary">3rd Year</Badge>;
      case 4:
        return <Badge className="bg-gray-500">4th Year</Badge>;
      default:
        return <Badge className="bg-gray-700">Admin</Badge>;
    }
  };

  const isLoading = isLoadingUsers || isLoadingQuickAccess || isLoadingAnnouncements || isLoadingResources;

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <Button onClick={goToContentEditor}>
          <PencilIcon className="mr-2 h-4 w-4" />
          Content Editor
        </Button>
      </div>

      <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="quick-access">Quick Access</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UsersIcon className="mr-2 h-5 w-5" />
                Student Management
              </CardTitle>
              <CardDescription>
                Manage student accounts and year promotions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.filter(user => user.role === "student").map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{`${user.firstName} ${user.lastName}`}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{renderYearBadge(user.year)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="mr-2"
                            onClick={() => handlePromoteStudent(user.id)}
                            disabled={user.year >= 4}
                          >
                            Promote
                          </Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Access Cards</CardTitle>
              <CardDescription>
                Manage the quick access cards that appear on student dashboards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between">
                <div className="space-x-2">
                  <Button variant="outline" size="sm" className="border-first-primary text-first-primary">1st Year</Button>
                  <Button variant="outline" size="sm" className="border-second-primary text-second-primary">2nd Year</Button>
                  <Button variant="outline" size="sm" className="border-third-primary text-third-primary">3rd Year</Button>
                </div>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Card
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quickAccessData?.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium">{card.title}</TableCell>
                        <TableCell>{card.description}</TableCell>
                        <TableCell>{renderYearBadge(card.year)}</TableCell>
                        <TableCell>{card.order}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 mr-2">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>
                Manage the announcements that appear on student dashboards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between">
                <div className="space-x-2">
                  <Button variant="outline" size="sm" className="border-first-primary text-first-primary">1st Year</Button>
                  <Button variant="outline" size="sm" className="border-second-primary text-second-primary">2nd Year</Button>
                  <Button variant="outline" size="sm" className="border-third-primary text-third-primary">3rd Year</Button>
                </div>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Announcement
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcementsData?.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium">{announcement.title}</TableCell>
                        <TableCell>{announcement.content.length > 30 ? `${announcement.content.substring(0, 30)}...` : announcement.content}</TableCell>
                        <TableCell>
                          <Badge className={
                            announcement.type === "info" ? "bg-blue-500" :
                            announcement.type === "warning" ? "bg-yellow-500" :
                            "bg-red-500"
                          }>
                            {announcement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderYearBadge(announcement.year)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 mr-2">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Manage the resources that appear on student dashboards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between">
                <div className="space-x-2">
                  <Button variant="outline" size="sm" className="border-first-primary text-first-primary">1st Year</Button>
                  <Button variant="outline" size="sm" className="border-second-primary text-second-primary">2nd Year</Button>
                  <Button variant="outline" size="sm" className="border-third-primary text-third-primary">3rd Year</Button>
                </div>
                <Button size="sm">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resourcesData?.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell>{resource.description.length > 40 ? `${resource.description.substring(0, 40)}...` : resource.description}</TableCell>
                        <TableCell>{renderYearBadge(resource.year)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 mr-2">
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500">
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full md:w-[600px]" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
