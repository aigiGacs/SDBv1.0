import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Create a more specific schema for student sign-up
const signupSchema = insertUserSchema.pick({
  username: true,
  password: true,
  firstName: true, 
  lastName: true,
  email: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  profileImage: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const { isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      profileImage: "",
    },
  });
  
  // Initialize camera
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: 300, height: 300 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Take picture
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Draw video frame to canvas
        context.drawImage(
          videoRef.current, 
          0, 0, 
          canvasRef.current.width, 
          canvasRef.current.height
        );
        
        // Get image data as base64
        const imageData = canvasRef.current.toDataURL('image/png');
        setProfileImage(imageData);
        form.setValue("profileImage", imageData);
        
        // Stop the camera after taking a picture
        stopCamera();
      }
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      
      // Remove confirmPassword as it's not part of the API schema
      const { confirmPassword, ...signupData } = data;
      
      // Make sure we have all required fields before submitting
      if (!profileImage) {
        toast({
          title: "Profile Picture Required",
          description: "Please take a profile picture using the camera button",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Store the profile image in localStorage (in a real app, we would upload this to a server)
      localStorage.setItem('userProfileImage', profileImage);
      
      // Call the register API
      const response = await apiRequest("POST", "/api/auth/register", signupData);
      
      if (response.ok) {
        toast({
          title: "Account created successfully",
          description: "Redirecting to dashboard...",
        });
        
        // Automatically redirects to dashboard since the API logs the user in
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.json();
        toast({
          title: "Registration failed",
          description: errorData.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-card dark:border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Student Account
          </CardTitle>
          <CardDescription className="text-center">
            Register as a first-year engineering student
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="john.doe@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="******"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="******"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Profile Picture Section */}
              <div className="mb-6 flex flex-col items-center">
                <div className="mb-2 text-center">
                  <FormLabel>Profile Picture</FormLabel>
                </div>
                
                {profileImage ? (
                  <div className="relative mb-4 w-32 h-32 rounded-full overflow-hidden border-2 border-primary">
                    <img 
                      src={profileImage} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                    <button 
                      type="button"
                      onClick={() => setProfileImage(null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    {cameraActive ? (
                      <div className="relative mb-4">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-64 h-64 rounded-lg border-2 border-primary"
                        />
                        <div className="flex justify-center mt-2 space-x-2">
                          <Button 
                            type="button" 
                            onClick={takePicture}
                            variant="default"
                          >
                            Take Photo
                          </Button>
                          <Button 
                            type="button" 
                            onClick={stopCamera}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={startCamera}
                        className="gap-2 mb-4"
                        variant="outline"
                      >
                        <Camera size={18} />
                        Activate Camera
                      </Button>
                    )}
                  </>
                )}
                <canvas ref={canvasRef} className="hidden" width="300" height="300" />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || isSubmitting || !profileImage}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            onClick={() => window.location.href = "/login"}
          >
            Already have an account? Log in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}