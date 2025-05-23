import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
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

const formSchema = loginSchema.extend({});

export default function Login() {
  const { login, isLoading, error } = useAuth();
  const [showCredentials, setShowCredentials] = useState(false);
  const [, navigate] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await login(data.username, data.password);
  };

  const showDemoCredentials = () => {
    setShowCredentials(!showCredentials);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md dark:bg-card dark:border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Engineering Dashboard
          </CardTitle>
          <CardDescription className="text-center">
            Login to access your year-specific dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
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
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm font-medium text-destructive">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="flex justify-between w-full mb-4">
            <Button variant="link" onClick={showDemoCredentials}>
              {showCredentials ? "Hide Demo Credentials" : "Show Demo Credentials"}
            </Button>
            <Button variant="link" onClick={() => navigate("/signup")}>
              New Student? Sign Up
            </Button>
          </div>
          {showCredentials && (
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p><strong>Admin:</strong> username: admin, password: admin123</p>
              <p><strong>1st Year:</strong> username: year1, password: password</p>
              <p><strong>2nd Year:</strong> username: year2, password: password</p>
              <p><strong>3rd Year:</strong> username: year3, password: password</p>
              <p><strong>4th Year:</strong> username: year4, password: password</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
