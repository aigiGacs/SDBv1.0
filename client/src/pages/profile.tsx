import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Camera, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Load profile image from localStorage on initial render
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('userProfileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  // Initialize camera
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
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
        localStorage.setItem('userProfileImage', imageData);
        
        // Stop the camera after taking a picture
        stopCamera();
        
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully.",
        });
      }
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {/* Profile Picture Display */}
            <div className="relative">
              {profileImage ? (
                <div className="relative">
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setProfileImage(null);
                      localStorage.removeItem('userProfileImage');
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200 text-4xl">
                  {user?.firstName?.[0] || ""}
                  {user?.lastName?.[0] || ""}
                </div>
              )}
            </div>
            
            {/* Camera UI */}
            {cameraActive ? (
              <div className="w-full space-y-4">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full rounded-lg border-2 border-primary"
                />
                <div className="flex justify-center gap-4">
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
                className="gap-2"
                variant="outline"
              >
                <Camera size={18} />
                {profileImage ? "Change Profile Picture" : "Add Profile Picture"}
              </Button>
            )}
            <canvas ref={canvasRef} className="hidden" width="300" height="300" />
            
            {/* User Information */}
            <div className="w-full space-y-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Username:</span>
                <span>{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span className="capitalize">{user.role}</span>
              </div>
              {user.year && (
                <div className="flex justify-between">
                  <span className="font-medium">Year:</span>
                  <span>{user.year}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}