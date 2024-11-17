import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useSupabase } from "@/hooks/use-supabase";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  instagram: string;
  date: Date | undefined;
  specialRequests: string;
  photos: FileList | null;
  referralSource: string;
  otherReferralExplanation: string;
}

const Booking = () => {
  const { createBooking, uploadImage } = useSupabase();
  const form = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      instagram: "",
      date: undefined,
      specialRequests: "",
      photos: null,
      referralSource: "",
      otherReferralExplanation: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Upload reference photos if provided
      let referencePhotos: string[] = [];
      if (data.photos) {
        const files = Array.from(data.photos);
        const uploadPromises = files.map(file => 
          uploadImage(file, 'reference-photos')
        );
        const urls = await Promise.all(uploadPromises);
        referencePhotos = urls.filter((url): url is string => url !== null);
      }

      // Create booking
      await createBooking({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        instagram: data.instagram || null,
        preferred_date: data.date?.toISOString() || null,
        special_requests: data.specialRequests || null,
        reference_photos: referencePhotos.length > 0 ? referencePhotos : null,
        referral_source: data.referralSource || null,
        other_referral: data.otherReferralExplanation || null,
        status: 'pending'
      });

      // Reset form on success
      form.reset();
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Book Your Session</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you with available time slots
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram Handle (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="@yourusername" {...field} />
                        </FormControl>
                        <FormDescription>
                          Share your Instagram handle to show us your style
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date</FormLabel>
                        <FormControl>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            className="rounded-md border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photos"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Reference Photos</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referralSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="social" id="social" />
                              <Label htmlFor="social">Social Media</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="friend" id="friend" />
                              <Label htmlFor="friend">Friend</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="search" id="search" />
                              <Label htmlFor="search">Search Engine</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other">Other</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("referralSource") === "other" && (
                    <FormField
                      control={form.control}
                      name="otherReferralExplanation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" className="w-full">
                    Request Booking
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;