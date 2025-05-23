import { 
  users, type User, type InsertUser,
  quickAccessCards, type QuickAccessCard, type InsertQuickAccessCard,
  announcements, type Announcement, type InsertAnnouncement,
  resources, type Resource, type InsertResource
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Quick Access Cards operations
  getQuickAccessCardsByYear(year: number): Promise<QuickAccessCard[]>;
  createQuickAccessCard(card: InsertQuickAccessCard): Promise<QuickAccessCard>;
  updateQuickAccessCard(id: number, card: Partial<QuickAccessCard>): Promise<QuickAccessCard | undefined>;
  deleteQuickAccessCard(id: number): Promise<boolean>;
  
  // Announcements operations
  getAnnouncementsByYear(year: number): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: number, announcement: Partial<Announcement>): Promise<Announcement | undefined>;
  deleteAnnouncement(id: number): Promise<boolean>;
  
  // Resources operations
  getResourcesByYear(year: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quickAccessCards: Map<number, QuickAccessCard>;
  private announcements: Map<number, Announcement>;
  private resources: Map<number, Resource>;
  
  private currentUserId: number;
  private currentCardId: number;
  private currentAnnouncementId: number;
  private currentResourceId: number;

  constructor() {
    this.users = new Map();
    this.quickAccessCards = new Map();
    this.announcements = new Map();
    this.resources = new Map();
    
    this.currentUserId = 1;
    this.currentCardId = 1;
    this.currentAnnouncementId = 1;
    this.currentResourceId = 1;
    
    // Seed with initial admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      email: "admin@college.edu",
      role: "admin",
      year: 0,
      canAccessYears: [1, 2, 3],
      canEditYears: [1, 2, 3]
    });
    
    // Seed with first year student
    this.createUser({
      username: "year1",
      password: "password",
      firstName: "Arjun",
      lastName: "Singh",
      email: "year1@college.edu",
      role: "student",
      year: 1,
      canAccessYears: [1],
      canEditYears: []
    });
    
    // Seed with second year student
    this.createUser({
      username: "year2",
      password: "password",
      firstName: "Priya",
      lastName: "Kumar",
      email: "year2@college.edu",
      role: "student",
      year: 2,
      canAccessYears: [2],
      canEditYears: [1]
    });
    
    // Seed with third year student
    this.createUser({
      username: "year3",
      password: "password",
      firstName: "Vikram",
      lastName: "Patel",
      email: "year3@college.edu",
      role: "student",
      year: 3,
      canAccessYears: [3],
      canEditYears: [2]
    });
    
    // Seed with fourth year student (can edit third year)
    this.createUser({
      username: "year4",
      password: "password",
      firstName: "Ananya",
      lastName: "Sharma",
      email: "year4@college.edu",
      role: "student",
      year: 4,
      canAccessYears: [],
      canEditYears: [3]
    });
    
    // Seed first year quick access cards
    const firstYearCards: InsertQuickAccessCard[] = [
      { title: "Choose Electives & Subject Feedback", description: "Select your electives and view subject details", icon: "book-open", link: "/electives", year: 1, order: 1 },
      { title: "Subject Materials", description: "Access notes, presentations, and reference books", icon: "file-alt", link: "/materials", year: 1, order: 2 },
      { title: "Teacher Feedback", description: "View teacher profiles and provide feedback", icon: "user-tie", link: "/teachers", year: 1, order: 3 },
      { title: "Classroom Locator", description: "Find your way around campus", icon: "map-marker-alt", link: "/locations", year: 1, order: 4 },
      { title: "Skill Building", description: "Resources to develop technical skills", icon: "laptop-code", link: "/skills", year: 1, order: 5 },
      { title: "Clubs & Community", description: "Join student groups and activities", icon: "users", link: "/clubs", year: 1, order: 6 },
      { title: "Fee Payment Help", description: "View fee details and payment options", icon: "credit-card", link: "/fees", year: 1, order: 7 },
      { title: "Ask the Chatbot", description: "Get quick answers to common questions", icon: "robot", link: "/chatbot", year: 1, order: 8 }
    ];
    
    firstYearCards.forEach(card => this.createQuickAccessCard(card));
    
    // Seed second year quick access cards
    const secondYearCards: InsertQuickAccessCard[] = [
      { title: "Subject Guidance", description: "Advanced subject materials and guides", icon: "book", link: "/subjects", year: 2, order: 1 },
      { title: "Clubs & Community", description: "Take leadership roles in clubs", icon: "users", link: "/clubs", year: 2, order: 2 },
      { title: "Fee Payment Help", description: "View fee details and payment options", icon: "credit-card", link: "/fees", year: 2, order: 3 },
      { title: "Teacher Selection Help", description: "Choose the right teachers for your courses", icon: "chalkboard-teacher", link: "/teachers", year: 2, order: 4 },
      { title: "Domain Learning Paths", description: "Specialized learning tracks by domain", icon: "code-branch", link: "/domains", year: 2, order: 5 },
      { title: "Seniors' Feedback", description: "Learn from experiences of senior students", icon: "user-graduate", link: "/feedback", year: 2, order: 6 },
      { title: "Ask the Chatbot", description: "Get quick answers to common questions", icon: "robot", link: "/chatbot", year: 2, order: 7 }
    ];
    
    secondYearCards.forEach(card => this.createQuickAccessCard(card));
    
    // Seed third year quick access cards
    const thirdYearCards: InsertQuickAccessCard[] = [
      { title: "Advanced Subject Guide", description: "Specialized resources for advanced topics", icon: "book-reader", link: "/advanced", year: 3, order: 1 },
      { title: "Project Ideas", description: "Industry-relevant project suggestions", icon: "lightbulb", link: "/projects", year: 3, order: 2 },
      { title: "Internship Resources", description: "Find internships and prepare for interviews", icon: "briefcase", link: "/internships", year: 3, order: 3 },
      { title: "Research Zone", description: "Research opportunities and paper guidelines", icon: "flask", link: "/research", year: 3, order: 4 },
      { title: "Seniors' Roadmap", description: "Career paths taken by successful alumni", icon: "route", link: "/roadmap", year: 3, order: 5 },
      { title: "Ask the Chatbot", description: "Get quick answers to common questions", icon: "robot", link: "/chatbot", year: 3, order: 6 }
    ];
    
    thirdYearCards.forEach(card => this.createQuickAccessCard(card));
    
    // Seed first year announcements
    const firstYearAnnouncements: InsertAnnouncement[] = [
      { title: "Orientation Schedule", content: "Department orientation will be held on Sept 5th in the Main Auditorium at 10 AM.", type: "info", year: 1, createdBy: 1 },
      { title: "Timetable Updates", content: "Updated class timetable for Sem 1 is now available. Check for changes in timing.", type: "warning", year: 1, createdBy: 1 },
      { title: "Exam Dates", content: "Mid-semester examination dates have been announced. Check your exam schedule.", type: "error", year: 1, createdBy: 1 }
    ];
    
    firstYearAnnouncements.forEach(announcement => this.createAnnouncement(announcement));
    
    // Seed second year announcements
    const secondYearAnnouncements: InsertAnnouncement[] = [
      { title: "Elective Deadlines", content: "Last date for switching electives is Sept 15th. Submit your changes before the deadline.", type: "info", year: 2, createdBy: 1 },
      { title: "Workshops", content: "Upcoming workshop on \"Advanced Programming Techniques\" on Saturday.", type: "warning", year: 2, createdBy: 1 },
      { title: "Placement Prep Events", content: "Attend the placement preparation session with alumni this Friday.", type: "error", year: 2, createdBy: 1 }
    ];
    
    secondYearAnnouncements.forEach(announcement => this.createAnnouncement(announcement));
    
    // Seed third year announcements
    const thirdYearAnnouncements: InsertAnnouncement[] = [
      { title: "Placement Drive Dates", content: "The campus placement drive will begin on Oct 15th. Register before Oct 10th.", type: "info", year: 3, createdBy: 1 },
      { title: "Project Expos", content: "Final year project exhibition scheduled for Nov 20th. Submit your abstracts.", type: "warning", year: 3, createdBy: 1 },
      { title: "Paper Submission Deadlines", content: "Research paper submission deadline for the national conference is Sept 30th.", type: "error", year: 3, createdBy: 1 }
    ];
    
    thirdYearAnnouncements.forEach(announcement => this.createAnnouncement(announcement));
    
    // Seed first year resources
    const firstYearResources: InsertResource[] = [
      { title: "Most Recommended YouTube Playlist by Seniors", description: "Curated video tutorials for first-year subjects.", icon: "youtube", link: "/resources/youtube-playlist", year: 1, createdBy: 1 },
      { title: "Beginner Projects You Can Try", description: "Simple projects to apply what you're learning in classes.", icon: "project-diagram", link: "/resources/beginner-projects", year: 1, createdBy: 1 }
    ];
    
    firstYearResources.forEach(resource => this.createResource(resource));
    
    // Seed second year resources
    const secondYearResources: InsertResource[] = [
      { title: "Top Certifications for 2nd Year Students", description: "Industry-recognized certifications to boost your resume.", icon: "certificate", link: "/resources/certifications", year: 2, createdBy: 1 },
      { title: "Best Domain to Explore Now", description: "Trending technologies and domains based on industry demand.", icon: "chart-line", link: "/resources/domains", year: 2, createdBy: 1 },
      { title: "Recommended Tools", description: "Essential development tools like Git, VS Code, and more.", icon: "tools", link: "/resources/tools", year: 2, createdBy: 1 }
    ];
    
    secondYearResources.forEach(resource => this.createResource(resource));
    
    // Seed third year resources
    const thirdYearResources: InsertResource[] = [
      { title: "Top Projects for 3rd Year Students", description: "Showcase-worthy projects that impress recruiters.", icon: "project-diagram", link: "/resources/projects", year: 3, createdBy: 1 },
      { title: "How to Build a Strong Resume", description: "Resume templates and tips from successful graduates.", icon: "file-alt", link: "/resources/resume", year: 3, createdBy: 1 },
      { title: "Most Common Placement Questions", description: "Practice with frequently asked technical and HR questions.", icon: "question-circle", link: "/resources/placement-questions", year: 3, createdBy: 1 }
    ];
    
    thirdYearResources.forEach(resource => this.createResource(resource));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const currentUser = this.users.get(id);
    if (!currentUser) return undefined;
    
    const updatedUser = { ...currentUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Quick Access Cards methods
  async getQuickAccessCardsByYear(year: number): Promise<QuickAccessCard[]> {
    return Array.from(this.quickAccessCards.values())
      .filter((card) => card.year === year)
      .sort((a, b) => a.order - b.order);
  }
  
  async createQuickAccessCard(card: InsertQuickAccessCard): Promise<QuickAccessCard> {
    const id = this.currentCardId++;
    const newCard: QuickAccessCard = { ...card, id };
    this.quickAccessCards.set(id, newCard);
    return newCard;
  }
  
  async updateQuickAccessCard(id: number, cardData: Partial<QuickAccessCard>): Promise<QuickAccessCard | undefined> {
    const currentCard = this.quickAccessCards.get(id);
    if (!currentCard) return undefined;
    
    const updatedCard = { ...currentCard, ...cardData };
    this.quickAccessCards.set(id, updatedCard);
    return updatedCard;
  }
  
  async deleteQuickAccessCard(id: number): Promise<boolean> {
    return this.quickAccessCards.delete(id);
  }
  
  // Announcements methods
  async getAnnouncementsByYear(year: number): Promise<Announcement[]> {
    return Array.from(this.announcements.values())
      .filter((announcement) => announcement.year === year)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const createdAt = new Date();
    
    const newAnnouncement: Announcement = { 
      ...announcement, 
      id, 
      createdAt
    };
    
    this.announcements.set(id, newAnnouncement);
    return newAnnouncement;
  }
  
  async updateAnnouncement(id: number, announcementData: Partial<Announcement>): Promise<Announcement | undefined> {
    const currentAnnouncement = this.announcements.get(id);
    if (!currentAnnouncement) return undefined;
    
    const updatedAnnouncement = { ...currentAnnouncement, ...announcementData };
    this.announcements.set(id, updatedAnnouncement);
    return updatedAnnouncement;
  }
  
  async deleteAnnouncement(id: number): Promise<boolean> {
    return this.announcements.delete(id);
  }
  
  // Resources methods
  async getResourcesByYear(year: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter((resource) => resource.year === year)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const createdAt = new Date();
    
    const newResource: Resource = { 
      ...resource, 
      id, 
      createdAt
    };
    
    this.resources.set(id, newResource);
    return newResource;
  }
  
  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource | undefined> {
    const currentResource = this.resources.get(id);
    if (!currentResource) return undefined;
    
    const updatedResource = { ...currentResource, ...resourceData };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
}

export const storage = new MemStorage();
