import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Featured Artworks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredWorks.map((work) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: work.id * 0.2 }}
              onClick={() => setSelectedWork(work)}
              className="relative group overflow-hidden rounded-lg cursor-pointer"
            >
              <div className="aspect-square w-full">
                <img 
                  src={work.image} 
                  alt={work.alt} 
                  className="w-full h-full object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white text-lg font-medium">View Details</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/portfolio"
            className="inline-flex items-center text-lg font-medium text-foreground hover:text-tattoo-blue transition-colors"
          >
            View Full Portfolio
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </div>

        <Dialog 
          open={!!selectedWork} 
          onOpenChange={() => setSelectedWork(null)}
        >
          <DialogContent className="max-w-5xl w-full bg-background p-0">
            <div className="relative">
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
              >
                <X size={24} />
              </button>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {selectedWork && (
                  <>
                    <div className="aspect-square w-full">
                      <img
                        src={selectedWork.image}
                        alt={selectedWork.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 bg-background">
                      <h3 className="text-lg font-semibold">
                        {selectedWork.alt}
                      </h3>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default FeaturedWorkSection;