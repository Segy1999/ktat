import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const Booking = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleBooking = () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    toast.success("Booking request sent! We'll contact you soon.");
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
                Choose your preferred date and we'll get back to you with available time slots
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto"
              />
              <Button 
                onClick={handleBooking}
                className="w-full"
              >
                Request Booking
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;