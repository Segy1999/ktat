import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

type FeaturedWork = {
  id: number;
  image: string;
  alt: string;
};

const FeaturedWorkSection = () => {
  const [selectedWork, setSelectedWork] = useState<FeaturedWork | null>(null);

  const featuredWorks = [
    { id: 1, image: "/images/home/h1.jpeg", alt: "Featured Tattoo 1" },
    { id: 2, image: "/images/home/h2.jpeg", alt: "Featured Tattoo 2" },
    { id: 3, image: "/images/home/h3.jpeg", alt: "Featured Tattoo 3" },
    { id: 4, image: "/images/home/h4.jpeg", alt: "Featured Tattoo 4" },
    { id: 5, image: "/images/home/h5.jpeg", alt: "Featured Tattoo 5" },
    { id: 6, image: "/images/home/h6.jpeg", alt: "Featured Tattoo 6" },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
          Featured Artworks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {featuredWorks.map((work) => (
            <div
              key={work.id}
              className="group relative aspect-[3/4] rounded-xl border border-black/[0.1] bg-[#FFF0F5] dark:bg-background dark:border-white/[0.2] hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-black dark:text-foreground mb-4 relative z-10">
                  {work.alt}
                </h3>
                
                <div className="relative flex-grow w-full h-full">
                  <div className="absolute inset-0">
                    <img 
                      src={work.image} 
                      alt={work.alt}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" 
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between relative z-10">
                  <span className="text-sm text-black/70 dark:text-muted-foreground">
                    Click to view details
                  </span>
                  <span className="text-sm font-medium text-black dark:text-foreground">
                    →
                  </span>
                </div>
              </div>
              
              {/* Clickable overlay */}
              <button
                onClick={() => setSelectedWork(work)}
                className="absolute inset-0 w-full h-full cursor-pointer z-20"
                aria-label={`View ${work.alt}`}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12 relative z-30">
          <Link
            to="/portfolio"
            className="inline-flex items-center text-base sm:text-lg font-medium text-black hover:text-tattoo-blue dark:text-foreground dark:hover:text-tattoo-blue transition-colors"
          >
            View Full Portfolio
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>

        <Dialog 
          open={!!selectedWork} 
          onOpenChange={() => setSelectedWork(null)}
        >
          <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] w-auto h-auto bg-[#FFF0F5] p-0 rounded-lg overflow-hidden">
            <div className="relative flex items-center justify-center min-h-[50vh] sm:min-h-[80vh]">
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/80 text-white hover:bg-black/70 transition-colors z-10"
              >
                <X size={24} />
              </button>
              {selectedWork && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={selectedWork.image}
                    alt={selectedWork.alt}
                    className="max-w-full max-h-[80vh] object-contain"
                    style={{ margin: 'auto' }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      {selectedWork.alt}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default FeaturedWorkSection;