"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getSession } from '@/lib/session';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  memberType: z.enum(["STUDENT", "YOUTH", "ADULT"], {
    required_error: "Please select a member type",
  }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Please select a gender",
  }),
  phoneNumber: z.string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  address: z.string().min(1, "Address is required"),
  class: z.string().optional(),
  division: z.string().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface MemberFormProps {
  memberId?: string;
}

export default function MemberForm({ memberId }: MemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSchool, setIsSchool] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      memberType: undefined,
      gender: undefined,
      phoneNumber: "",
      address: "",
      class: "",
      division: "",
    },
  });

  useEffect(() => {
    try {
      const session = getSession();
      setIsSchool(session?.entity_type === 'school');
    } catch (error) {
      console.error('Error getting session:', error);
    }
  }, []);

  useEffect(() => {
    async function fetchMember() {
      if (!memberId) return;
      
      try {
        const response = await fetch(`/api/members/${memberId}`);
        if (!response.ok) throw new Error('Failed to fetch member');
        
        const member = await response.json();
        form.reset(member);
      } catch (error) {
        console.error('Error fetching member:', error);
        toast({
          title: 'Error',
          description: 'Failed to load member details',
          variant: 'destructive',
        });
      }
    }

    fetchMember();
  }, [memberId, form, toast]);

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    
    try {
      const url = memberId ? `/api/members/${memberId}` : '/api/members';
      const method = memberId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${memberId ? 'update' : 'create'} member`);
      }
      
      toast({
        title: "Success!",
        description: `Member ${memberId ? 'updated' : 'added'} successfully`,
      });
      
      form.reset();
      router.push('/dashboard/members');
      router.refresh();
    } catch (error) {
      console.error(`Error ${memberId ? 'updating' : 'adding'} member:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${memberId ? 'update' : 'add'} member`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{memberId ? 'Edit Member' : 'Add New Member'}</CardTitle>
        <CardDescription>
          {memberId ? 'Update the member details below' : 'Enter the details of the new member below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memberType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="YOUTH">Youth</SelectItem>
                        <SelectItem value="ADULT">Adult</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="10-digit phone number" 
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value.slice(0, 10));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a 10-digit phone number without spaces or special characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter complete address" 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isSchool && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Nursery">Nursery</SelectItem>
                          <SelectItem value="LKG">LKG</SelectItem>
                          <SelectItem value="UKG">UKG</SelectItem>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i+1} value={(i+1).toString()}>
                              Class {i+1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Division</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter division" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard/members')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (memberId ? "Updating..." : "Saving...") : (memberId ? "Update Member" : "Save Member")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}