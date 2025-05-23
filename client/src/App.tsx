import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import ContentEditor from "@/pages/content-editor";
import Profile from "@/pages/profile";
import { MessageSquare, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Simple custom chatbot component
function ChatbotButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi there! I\'m your engineering assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  // Only show the chatbot when user is logged in
  if (!user) return null;

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    setMessages([...messages, { role: 'user', content: inputValue }]);
    
    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'bot', 
          content: 'Thanks for your message! This is a demo chatbot. In a real implementation, this would connect to an actual backend for responses.' 
        }
      ]);
    }, 1000);
    
    setInputValue('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white flex items-center justify-center shadow-lg z-50 transition-all duration-300 hover:scale-110"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md h-[500px] bg-background dark:bg-card rounded-lg shadow-lg flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Engineering Assistant</h3>
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-white rounded-br-none' 
                        : 'bg-muted rounded-bl-none dark:bg-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/content-editor" component={ContentEditor} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ChatbotButton />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
