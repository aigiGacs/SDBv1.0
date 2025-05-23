import { useState, useEffect } from "react";
import { useAuth, RequireAuth } from "@/lib/auth";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  insertQuickAccessCardSchema,
  insertAnnouncementSchema,
  insertResourceSchema,
  type QuickAccessCard,
  type Announcement,
  type Resource,
} from "@shared/schema";
import { PencilIcon, PlusIcon, TrashIcon } from "lucide-react";

export default function ContentEditor() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [currentTab, setCurrentTab] = useState("quick-access");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [isAddAnnouncementDialogOpen, setIsAddAnnouncementDialogOpen] = useState(false);
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);
  
  const [editCardId, setEditCardId] = useState<number | null>(null);
  const [editAnnouncementId, setEditAnnouncementId] = useState<number | null>(null);
  const [editResourceId, setEditResourceId] = useState<number | null>(null);

  useEffect(() => {
    // Initialize with the lowest year the user can edit
    if (user) {
      const editableYears = user.canEditYears as number[];
      if (editableYears.length > 0) {
        setSelectedYear(Math.min(...editableYears));
      } else if (user.role === "admin") {
        setSelectedYear(1); // Admin can edit all years
      }
    }
  }, [user]);

  // Get user's editable years
  const getEditableYears = () => {
    if (!user) return [];
    if (user.role === "admin") return [1, 2, 3];
    return user.canEditYears as number[];
  };

  const editableYears = getEditableYears();

  // Fetch data based on the selected year
  const { data: quickAccessCards, isLoading: isLoadingCards } = useQuery({
    queryKey: [`/api/dashboard/${selectedYear}/quick-access`],
    enabled: !!selectedYear,
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery({
    queryKey: [`/api/dashboard/${selectedYear}/announcements`],
    enabled: !!selectedYear,
  });

  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: [`/api/dashboard/${selectedYear}/resources`],
    enabled: !!selectedYear,
  });

  // Add mutations
  const addQuickAccessMutation = useMutation({
    mutationFn: (card: z.infer<typeof quickAccessCardFormSchema>) =>
      apiRequest("POST", `/api/content/${selectedYear}/quick-access`, card),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/quick-access`] });
      toast({ title: "Success", description: "Quick access card added successfully" });
      setIsAddCardDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addAnnouncementMutation = useMutation({
    mutationFn: (announcement: z.infer<typeof announcementFormSchema>) =>
      apiRequest("POST", `/api/content/${selectedYear}/announcements`, announcement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/announcements`] });
      toast({ title: "Success", description: "Announcement added successfully" });
      setIsAddAnnouncementDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addResourceMutation = useMutation({
    mutationFn: (resource: z.infer<typeof resourceFormSchema>) =>
      apiRequest("POST", `/api/content/${selectedYear}/resources`, resource),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/resources`] });
      toast({ title: "Success", description: "Resource added successfully" });
      setIsAddResourceDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update mutations
  const updateQuickAccessMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<QuickAccessCard> }) =>
      apiRequest("PUT", `/api/content/quick-access/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/quick-access`] });
      toast({ title: "Success", description: "Quick access card updated successfully" });
      setEditCardId(null);
      setIsAddCardDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Announcement> }) =>
      apiRequest("PUT", `/api/content/announcements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/announcements`] });
      toast({ title: "Success", description: "Announcement updated successfully" });
      setEditAnnouncementId(null);
      setIsAddAnnouncementDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Resource> }) =>
      apiRequest("PUT", `/api/content/resources/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/resources`] });
      toast({ title: "Success", description: "Resource updated successfully" });
      setEditResourceId(null);
      setIsAddResourceDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutations
  const deleteQuickAccessMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/content/quick-access/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/quick-access`] });
      toast({ title: "Success", description: "Quick access card deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/content/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/announcements`] });
      toast({ title: "Success", description: "Announcement deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/content/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${selectedYear}/resources`] });
      toast({ title: "Success", description: "Resource deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Form schemas
  const quickAccessCardFormSchema = insertQuickAccessCardSchema.extend({
    icon: z.string().min(1, "Icon is required"),
  });

  const announcementFormSchema = insertAnnouncementSchema.omit({ createdBy: true }).extend({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
  });

  const resourceFormSchema = insertResourceSchema.omit({ createdBy: true }).extend({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
  });

  // Quick Access Card form
  const cardForm = useForm<z.infer<typeof quickAccessCardFormSchema>>({
    resolver: zodResolver(quickAccessCardFormSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
      link: "",
      order: 1,
      year: selectedYear,
    },
  });

  // Announcement form
  const announcementForm = useForm<z.infer<typeof announcementFormSchema>>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "info",
      year: selectedYear,
    },
  });

  // Resource form
  const resourceForm = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "",
      link: "",
      year: selectedYear,
    },
  });

  // Handle edit for Quick Access Card
  const handleEditCard = (card: QuickAccessCard) => {
    setEditCardId(card.id);
    cardForm.reset({
      title: card.title,
      description: card.description,
      icon: card.icon,
      link: card.link,
      order: card.order,
      year: card.year,
    });
    setIsAddCardDialogOpen(true);
  };

  // Handle edit for Announcement
  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditAnnouncementId(announcement.id);
    announcementForm.reset({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      year: announcement.year,
    });
    setIsAddAnnouncementDialogOpen(true);
  };

  // Handle edit for Resource
  const handleEditResource = (resource: Resource) => {
    setEditResourceId(resource.id);
    resourceForm.reset({
      title: resource.title,
      description: resource.description,
      icon: resource.icon,
      link: resource.link,
      year: resource.year,
    });
    setIsAddResourceDialogOpen(true);
  };

  // Submit handlers
  const onCardSubmit = (data: z.infer<typeof quickAccessCardFormSchema>) => {
    if (editCardId) {
      updateQuickAccessMutation.mutate({
        id: editCardId,
        data: { ...data, year: selectedYear },
      });
    } else {
      addQuickAccessMutation.mutate({ ...data, year: selectedYear });
    }
  };

  const onAnnouncementSubmit = (data: z.infer<typeof announcementFormSchema>) => {
    if (editAnnouncementId) {
      updateAnnouncementMutation.mutate({
        id: editAnnouncementId,
        data: { ...data, year: selectedYear },
      });
    } else {
      addAnnouncementMutation.mutate({ ...data, year: selectedYear });
    }
  };

  const onResourceSubmit = (data: z.infer<typeof resourceFormSchema>) => {
    if (editResourceId) {
      updateResourceMutation.mutate({
        id: editResourceId,
        data: { ...data, year: selectedYear },
      });
    } else {
      addResourceMutation.mutate({ ...data, year: selectedYear });
    }
  };

  // Reset forms on dialog close
  const resetCardForm = () => {
    cardForm.reset({
      title: "",
      description: "",
      icon: "",
      link: "",
      order: 1,
      year: selectedYear,
    });
    setEditCardId(null);
    setIsAddCardDialogOpen(false);
  };

  const resetAnnouncementForm = () => {
    announcementForm.reset({
      title: "",
      content: "",
      type: "info",
      year: selectedYear,
    });
    setEditAnnouncementId(null);
    setIsAddAnnouncementDialogOpen(false);
  };

  const resetResourceForm = () => {
    resourceForm.reset({
      title: "",
      description: "",
      icon: "",
      link: "",
      year: selectedYear,
    });
    setEditResourceId(null);
    setIsAddResourceDialogOpen(false);
  };

  // Helper function to get appropriate year class
  const getYearColorClass = (year: number) => {
    switch (year) {
      case 1:
        return "border-first-primary text-first-primary";
      case 2:
        return "border-second-primary text-second-primary";
      case 3:
        return "border-third-primary text-third-primary";
      default:
        return "border-gray-500 text-gray-500";
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-screen flex flex-col">
        <Header currentYear={selectedYear} onYearChange={setSelectedYear} />
        <main className="flex-grow p-6">
          <div className="container mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Content Editor</h1>
              <p className="text-gray-600">
                Edit the content for different year dashboards. You can only edit content for years you have permission to.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {editableYears.map((year) => (
                  <Button
                    key={year}
                    variant={selectedYear === year ? "default" : "outline"}
                    className={selectedYear === year 
                      ? year === 1 
                        ? "bg-first-primary" 
                        : year === 2 
                          ? "bg-second-primary" 
                          : "bg-third-primary" 
                      : getYearColorClass(year)}
                    onClick={() => setSelectedYear(year)}
                  >
                    {year === 1 ? "1st Year" : year === 2 ? "2nd Year" : "3rd Year"}
                  </Button>
                ))}
              </div>
            </div>

            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="quick-access">Quick Access Cards</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              {/* Quick Access Cards Tab */}
              <TabsContent value="quick-access">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Quick Access Cards</CardTitle>
                        <CardDescription>Manage quick access cards for Year {selectedYear}</CardDescription>
                      </div>
                      <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => resetCardForm()}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Card
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>{editCardId ? "Edit Quick Access Card" : "Add New Quick Access Card"}</DialogTitle>
                            <DialogDescription>
                              {editCardId ? "Update the details for this quick access card." : "Create a new quick access card for Year " + selectedYear}
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...cardForm}>
                            <form onSubmit={cardForm.handleSubmit(onCardSubmit)} className="space-y-4">
                              <FormField
                                control={cardForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Card Title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={cardForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Brief description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={cardForm.control}
                                name="icon"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="book-open">Book Open</SelectItem>
                                          <SelectItem value="file-alt">File</SelectItem>
                                          <SelectItem value="user-tie">Teacher</SelectItem>
                                          <SelectItem value="map-marker-alt">Location</SelectItem>
                                          <SelectItem value="laptop-code">Coding</SelectItem>
                                          <SelectItem value="users">Groups</SelectItem>
                                          <SelectItem value="credit-card">Payment</SelectItem>
                                          <SelectItem value="robot">Chatbot</SelectItem>
                                          <SelectItem value="book">Book</SelectItem>
                                          <SelectItem value="chalkboard-teacher">Chalkboard</SelectItem>
                                          <SelectItem value="code-branch">Code Branch</SelectItem>
                                          <SelectItem value="user-graduate">Graduate</SelectItem>
                                          <SelectItem value="route">Route</SelectItem>
                                          <SelectItem value="flask">Research</SelectItem>
                                          <SelectItem value="briefcase">Briefcase</SelectItem>
                                          <SelectItem value="lightbulb">Idea</SelectItem>
                                          <SelectItem value="book-reader">Book Reader</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={cardForm.control}
                                name="link"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <FormControl>
                                      <Input placeholder="/path/to/page" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={cardForm.control}
                                name="order"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Display Order</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} 
                                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                                      />
                                    </FormControl>
                                    <FormDescription>Lower numbers appear first</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={resetCardForm}>
                                  Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCards ? (
                      <div className="text-center py-4">Loading cards...</div>
                    ) : quickAccessCards && quickAccessCards.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Order</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quickAccessCards.map((card: QuickAccessCard) => (
                              <TableRow key={card.id}>
                                <TableCell className="font-medium">{card.title}</TableCell>
                                <TableCell>{card.description}</TableCell>
                                <TableCell>{card.order}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCard(card)}
                                    className="h-8 w-8 p-0 mr-2"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteQuickAccessMutation.mutate(card.id)}
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-md">
                        No quick access cards found for Year {selectedYear}. Add one to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Announcements Tab */}
              <TabsContent value="announcements">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Announcements</CardTitle>
                        <CardDescription>Manage announcements for Year {selectedYear}</CardDescription>
                      </div>
                      <Dialog open={isAddAnnouncementDialogOpen} onOpenChange={setIsAddAnnouncementDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => resetAnnouncementForm()}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Announcement
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>{editAnnouncementId ? "Edit Announcement" : "Add New Announcement"}</DialogTitle>
                            <DialogDescription>
                              {editAnnouncementId ? "Update the details for this announcement." : "Create a new announcement for Year " + selectedYear}
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...announcementForm}>
                            <form onSubmit={announcementForm.handleSubmit(onAnnouncementSubmit)} className="space-y-4">
                              <FormField
                                control={announcementForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Announcement Title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={announcementForm.control}
                                name="content"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Announcement content" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={announcementForm.control}
                                name="type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="info">Information</SelectItem>
                                          <SelectItem value="warning">Warning</SelectItem>
                                          <SelectItem value="error">Important/Urgent</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={resetAnnouncementForm}>
                                  Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnnouncements ? (
                      <div className="text-center py-4">Loading announcements...</div>
                    ) : announcements && announcements.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Content</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {announcements.map((announcement: Announcement) => (
                              <TableRow key={announcement.id}>
                                <TableCell className="font-medium">{announcement.title}</TableCell>
                                <TableCell>
                                  {announcement.content.length > 50
                                    ? `${announcement.content.substring(0, 50)}...`
                                    : announcement.content}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={
                                    announcement.type === "info" ? "border-info text-info" :
                                    announcement.type === "warning" ? "border-warning text-warning" :
                                    "border-error text-error"
                                  }>
                                    {announcement.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditAnnouncement(announcement)}
                                    className="h-8 w-8 p-0 mr-2"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-md">
                        No announcements found for Year {selectedYear}. Add one to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Resources</CardTitle>
                        <CardDescription>Manage resources for Year {selectedYear}</CardDescription>
                      </div>
                      <Dialog open={isAddResourceDialogOpen} onOpenChange={setIsAddResourceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => resetResourceForm()}>
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Resource
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>{editResourceId ? "Edit Resource" : "Add New Resource"}</DialogTitle>
                            <DialogDescription>
                              {editResourceId ? "Update the details for this resource." : "Create a new resource for Year " + selectedYear}
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...resourceForm}>
                            <form onSubmit={resourceForm.handleSubmit(onResourceSubmit)} className="space-y-4">
                              <FormField
                                control={resourceForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Resource Title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={resourceForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea placeholder="Resource description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={resourceForm.control}
                                name="icon"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select an icon" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="youtube">YouTube</SelectItem>
                                          <SelectItem value="project-diagram">Project Diagram</SelectItem>
                                          <SelectItem value="certificate">Certificate</SelectItem>
                                          <SelectItem value="chart-line">Chart Line</SelectItem>
                                          <SelectItem value="tools">Tools</SelectItem>
                                          <SelectItem value="file-alt">File</SelectItem>
                                          <SelectItem value="question-circle">Question Circle</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={resourceForm.control}
                                name="link"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <FormControl>
                                      <Input placeholder="/resources/something" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={resetResourceForm}>
                                  Cancel
                                </Button>
                                <Button type="submit">Save</Button>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingResources ? (
                      <div className="text-center py-4">Loading resources...</div>
                    ) : resources && resources.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Icon</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {resources.map((resource: Resource) => (
                              <TableRow key={resource.id}>
                                <TableCell className="font-medium">{resource.title}</TableCell>
                                <TableCell>
                                  {resource.description.length > 50
                                    ? `${resource.description.substring(0, 50)}...`
                                    : resource.description}
                                </TableCell>
                                <TableCell>{resource.icon}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditResource(resource)}
                                    className="h-8 w-8 p-0 mr-2"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteResourceMutation.mutate(resource.id)}
                                    className="h-8 w-8 p-0 text-red-500"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-md">
                        No resources found for Year {selectedYear}. Add one to get started.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </RequireAuth>
  );
}
