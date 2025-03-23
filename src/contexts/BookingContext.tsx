import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { BookingPopup } from "@/components/booking/BookingPopup";
import { CustomTattooForm, CustomTattooFormData } from "@/components/booking/CustomTattooForm";
import { toast } from "sonner";

type BookingOption = "custom" | "flash" | null;
type BookingStep = "initial" | "custom-form" | "flash-gallery" | null;

interface BookingContextType {
  openBookingFlow: () => void;
  closeBookingFlow: () => void;
  currentStep: BookingStep;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<BookingStep>(null);
  const [formData, setFormData] = useState<CustomTattooFormData | null>(null);
  
  // Add debugging logs
  useEffect(() => {
    console.log("Booking state changed:", { isOpen, currentStep });
  }, [isOpen, currentStep]);

  const openBookingFlow = () => {
    console.log("Opening booking flow");
    setIsOpen(true);
    setCurrentStep("initial");
  };

  const closeBookingFlow = () => {
    console.log("Closing booking flow");
    setIsOpen(false);
    setCurrentStep(null);
  };

  const handleOptionSelect = (option: BookingOption) => {
    console.log("Option selected:", option);
    if (option === "custom") {
      setCurrentStep("custom-form");
    } else if (option === "flash") {
      setCurrentStep("flash-gallery");
      // We'll implement the flash gallery later
      toast.info("Flash gallery coming soon! This feature is under development.");
    }
  };

  const handleCustomFormSubmit = (data: CustomTattooFormData) => {
    console.log("Form submitted:", data);
    setFormData(data);
    
    toast.success("Your custom tattoo request has been submitted! We'll contact you soon to discuss details.", {
      duration: 5000,
    });
    
    closeBookingFlow();
  };

  const handleBackToOptions = () => {
    console.log("Going back to options");
    setCurrentStep("initial");
  };

  return (
    <BookingContext.Provider
      value={{
        openBookingFlow,
        closeBookingFlow,
        currentStep,
      }}
    >
      {children}
      <BookingPopup 
        isOpen={isOpen && currentStep === "initial"} 
        onClose={closeBookingFlow}
        onOptionSelect={handleOptionSelect}
      />
      <CustomTattooForm
        isOpen={isOpen && currentStep === "custom-form"}
        onClose={closeBookingFlow}
        onSubmit={handleCustomFormSubmit}
        onBack={handleBackToOptions}
      />
      {/* We'll add the flash gallery component here later */}
    </BookingContext.Provider>
  );
}; 