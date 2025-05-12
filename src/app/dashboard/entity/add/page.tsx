"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building2, Phone, MapPin, User, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  entityName: z.string().min(2, "Entity name must be at least 2 characters"),
  entityAddress: z.string().min(5, "Address must be at least 5 characters"),
  entityType: z.enum(["school", "community", "mobile_library", "others"]),
  headPersonName: z.string().min(2, "Head person name must be at least 2 characters"),
  headPersonPhone: z.string().optional(),
  headPersonAddress: z.string().optional(),
  isSameAsHead: z.boolean().default(false),
  contactPersonName: z.string().min(2, "Contact person name must be at least 2 characters"),
  contactPersonPhone: z.string().min(10, "Contact person phone must be at least 10 characters"),
  contactPersonAddress: z.string().min(5, "Contact person address must be at least 5 characters"),
});

export default function AddEntity() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      entityName: "",
      entityAddress: "",
      entityType: "school",
      headPersonName: "",
      headPersonPhone: "",
      headPersonAddress: "",
      isSameAsHead: false,
      contactPersonName: "",
      contactPersonPhone: "",
      contactPersonAddress: "",
    },
  });

  const { watch, setValue, formState, trigger } = form;
  const isSameAsHead = watch("isSameAsHead");
  const headPersonName = watch("headPersonName");
  const headPersonPhone = watch("headPersonPhone");
  const headPersonAddress = watch("headPersonAddress");

  useEffect(() => {
    if (isSameAsHead) {
      setValue("contactPersonName", headPersonName);
      setValue("contactPersonPhone", headPersonPhone || "");
      setValue("contactPersonAddress", headPersonAddress || "");
      
      // The key fix: Trigger validation after setting values
      setTimeout(() => {
        trigger(["contactPersonName", "contactPersonPhone", "contactPersonAddress"]);
      }, 0);
    }
  }, [isSameAsHead, headPersonName, headPersonPhone, headPersonAddress, setValue, trigger]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create entity");
      }

      toast.success("Entity created successfully!");
      form.reset();
    } catch (error) {
      console.error("Error creating entity:", error);
      toast.error("Failed to create entity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Add New Entity
          </CardTitle>
          <CardDescription>
            Create a new entity by filling out the form below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="entityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-9" placeholder="Enter entity name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="mobile_library">Mobile Library</SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entityAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Entity Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-9" placeholder="Enter entity address" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Head Person Details
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="headPersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Head Person Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-9" placeholder="Enter head person name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headPersonPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Head Person Phone (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-9" placeholder="Enter head person phone" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headPersonAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Head Person Address (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input className="pl-9" placeholder="Enter head person address" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="isSameAsHead"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                setValue("contactPersonName", headPersonName);
                                setValue("contactPersonPhone", headPersonPhone || "");
                                setValue("contactPersonAddress", headPersonAddress || "");
                                // Trigger validation right after updating values
                                setTimeout(() => {
                                  trigger(["contactPersonName", "contactPersonPhone", "contactPersonAddress"]);
                                }, 0);
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Contact person is same as head person</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Person Details
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="contactPersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            className="pl-9"
                            placeholder="Enter contact person name"
                            disabled={isSameAsHead}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPersonPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Phone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            className="pl-9"
                            placeholder="Enter contact person phone"
                            disabled={isSameAsHead}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPersonAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Contact Person Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            className="pl-9"
                            placeholder="Enter contact person address"
                            disabled={isSameAsHead}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!formState.isValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Entity...
                  </>
                ) : (
                  "Create Entity"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}