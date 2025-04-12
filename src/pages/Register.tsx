
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, School, Calendar, Phone, MapPin, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define form validation schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  fname: z.string().min(1, { message: "First name is required" }),
  lname: z.string().min(1, { message: "Last name is required" }),
  idname: z.string().optional(),
  idnum: z.string().optional(),
  instidnum: z.string().min(1, { message: "Institute ID is required" }),
  dob: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { signup, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fname: '',
      lname: '',
      idname: '',
      idnum: '',
      instidnum: '',
      dob: '',
      gender: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await signup(values.email, values.password, {
        full_name: `${values.fname} ${values.lname}`,
        phone: values.phone
      });
      
      // User will be automatically redirected after successful signup + login
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Card className="glass-card p-8 border shadow-lg transition-all duration-300">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-full bg-voting-blue/20 dark:bg-voting-blue/20 light:bg-voting-blue/10 mr-3">
              <UserPlus className="h-6 w-6 text-voting-blue dark:text-voting-blue-light light:text-voting-blue-dark" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Voter Registration</h2>
          </div>
          
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your first name" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your last name" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="Enter your email" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your phone number" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Create a password" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
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
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Confirm your password" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="idname"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Verification Method</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300">
                            <SelectValue placeholder="Select verification type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="rollno">College Roll Number</SelectItem>
                          <SelectItem value="email">College Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="idnum"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Verification Number/Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter roll number or college email" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="instidnum"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <School className="h-4 w-4" /> Institute ID Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your institute ID" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Date of Birth
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter your address" 
                          className="bg-white/10 dark:bg-black/30 light:bg-white/70 border dark:border-white/10 light:border-gray-300"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-blockchain hover:bg-voting-blue-dark hover-glow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
              
              <div className="text-center text-sm">
                <p className="dark:text-gray-400 light:text-gray-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-voting-blue-light dark:text-voting-blue-light light:text-voting-blue-dark hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
