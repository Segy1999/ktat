import { motion } from "framer-motion";
import { useState, useCallback, lazy, Suspense } from "react";
import { ToastGrid } from "@/components/ui/toast-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useSupabase } from "@/hooks/use-supabase";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Error code types for better type safety
type ErrorCode = 
  | "INVALID_EMAIL_FORMAT"
  | "EMAIL_ALREADY_BOOKED"
  | "DATE_ALREADY_BOOKED"
  | "DATE_IN_PAST"
  | "UPLOAD_SIZE_EXCEEDED"
  | "INVALID_FILE_TYPE"
  | "BOOKING_LIMIT_EXCEEDED"
  | "DATABASE_ERROR"
  | "UPLOAD_ERROR"
  | "SERVER_ERROR"
  | "FORM_VALIDATION_ERROR";

// Error messages mapping
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_EMAIL_FORMAT: "The email address format is invalid. Please check and try again.",
  EMAIL_ALREADY_BOOKED: "This email address already has a pending booking. Please use a different email or check your existing booking.",
  DATE_ALREADY_BOOKED: "This date is no longer available. Please select another date from the calendar.",
  DATE_IN_PAST: "The selected date is in the past. Please choose a future date from the calendar.",
  UPLOAD_SIZE_EXCEEDED: "The uploaded photos exceed 10MB. Please reduce their size and try again.",
  INVALID_FILE_TYPE: "Only JPG, PNG, and GIF images are allowed. Please select valid image files.",
  BOOKING_LIMIT_EXCEEDED: "You've reached the maximum number of booking requests. Please wait for your current requests to be processed.",
  DATABASE_ERROR: "Sorry, we couldn't save your booking. Please try again later.",
  UPLOAD_ERROR: "Failed to upload your reference photos. Please try again or use smaller images.",
  SERVER_ERROR: "Sorry, something went wrong. Please try again later.",
  FORM_VALIDATION_ERROR: "Please check the highlighted fields and try again."
};

// Form validation schema
const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  instagram: z.string().optional(),
  date: z.date({
    required_error: "Please select a date",
    invalid_type_error: "That's not a valid date",
  }),
  specialRequests: z.string().optional(),
  photos: z.instanceof(FileList).optional(),
  referralSource: z.string().min(1, "Please select how you heard about us"),
  otherReferralExplanation: z.string().optional()
});

type FormData = z.infer<typeof bookingSchema>;

// Form field names for error context
const FORM_FIELDS = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone Number",
  date: "Booking Date",
  photos: "Reference Photos",
  referralSource: "Referral Source"
} as const;

// Lazy load the Calendar component with proper type checking
const Calendar = lazy(() => 
  Promise.resolve({ default: CalendarComponent })
);

const Booking = () => {
  const { createBooking, uploadImage } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      instagram: "",
      specialRequests: "",
      photos: undefined,
      referralSource: "",
      otherReferralExplanation: "",
      date: undefined,
    },
  });

  const showError = useCallback((code: ErrorCode, context?: { field?: keyof typeof FORM_FIELDS; details?: string }) => {
    let errorMessage = ERROR_MESSAGES[code];
    
    if (context?.field) {
      errorMessage = `${FORM_FIELDS[context.field]}: ${errorMessage}`;
    }
    if (context?.details) {
      errorMessage += ` (${context.details})`;
    }

    toast.error(errorMessage, {
      duration: 7000, // Increased duration for longer messages
      icon: <AlertCircle className="h-5 w-5" />,
    });
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message, {
      duration: 5000,
      icon: <CheckCircle2 className="h-5 w-5" />,
    });
  }, []);

  const validateFiles = useCallback((files: FileList): { isValid: boolean; error?: ErrorCode } => {
    const totalSize = Array.from(files).reduce((acc, file) => acc + file.size, 0);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (totalSize > maxSize) {
      return { isValid: false, error: "UPLOAD_SIZE_EXCEEDED" };
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const hasInvalidType = Array.from(files).some(file => !validTypes.includes(file.type));
    
    if (hasInvalidType) {
      return { isValid: false, error: "INVALID_FILE_TYPE" };
    }

    return { isValid: true };
  }, []);

  const onSubmit = useCallback(async (data: FormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Validate date
      if (data.date && data.date < new Date()) {
        showError("DATE_IN_PAST", { field: "date" });
        return;
      }

      // Validate photos
      let referencePhotos: string[] = [];
      if (data.photos && data.photos.length > 0) {
        const validation = validateFiles(data.photos);
        if (!validation.isValid && validation.error) {
          showError(validation.error, { field: "photos" });
          return;
        }

        try {
          const files = Array.from(data.photos);
          const chunkSize = 2;
          const chunks = Array(Math.ceil(files.length / chunkSize))
            .fill(null)
            .map((_, i) => files.slice(i * chunkSize, (i + 1) * chunkSize));

          for (const chunk of chunks) {
            const uploadPromises = chunk.map(file => uploadImage(file, 'reference-photos'));
            const urls = await Promise.all(uploadPromises);
            referencePhotos.push(...urls.filter((url): url is string => url !== null));
          }
        } catch (error) {
          showError("UPLOAD_ERROR", { field: "photos", details: "Failed to upload one or more photos" });
          return;
        }
      }

      try {
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

        showSuccess("Booking request submitted successfully! We'll contact you shortly to confirm your appointment.");
        form.reset();
      } catch (error: any) {
        console.error('Booking error:', error);
        
        // Handle specific database errors
        if (error?.message?.includes("duplicate key")) {
          if (error.message.includes("email")) {
            showError("EMAIL_ALREADY_BOOKED", { field: "email" });
          } else if (error.message.includes("date")) {
            showError("DATE_ALREADY_BOOKED", { field: "date" });
          }
        } else if (error?.message?.includes("violates check constraint")) {
          showError("BOOKING_LIMIT_EXCEEDED", {
            details: "You can only have one pending booking at a time"
          });
        } else {
          showError("DATABASE_ERROR", {
            details: "Please try again later or contact us directly if the problem persists"
          });
        }
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      showError("SERVER_ERROR", {
        details: "An unexpected error occurred. Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, showError, validateFiles, createBooking, uploadImage, form, showSuccess]);

  const disabledDates = useCallback((date: Date) => {
    return date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0));
  }, []);

  return (
    <>
      <ToastGrid />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="booking-form-container max-w-2xl mx-auto">
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
                            <Input placeholder="Enter your first name" {...field} />
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
                            <Input placeholder="Enter your last name" {...field} />
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
                            placeholder="your.email@example.com" 
                            {...field} 
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
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your phone number" 
                            type="tel"
                            {...field} 
                          />
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
                          <Input 
                            placeholder="@yourusername" 
                            {...field} 
                          />
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date</FormLabel>
                        <FormControl>
                          <Suspense fallback={
                            <div className="h-[300px] flex items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          }>
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={disabledDates}
                              className="rounded-md border"
                            />
                          </Suspense>
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
                          <Textarea 
                            placeholder="Any special requests or notes for your session..."
                            {...field} 
                          />
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
                        <FormDescription>
                          Upload up to 5 reference photos (10MB max total)
                        </FormDescription>
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
                            <Input 
                              placeholder="Tell us how you found us"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Booking Request'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
};

export default Booking;