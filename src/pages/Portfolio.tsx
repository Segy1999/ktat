import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSupabase } from '@/hooks/use-supabase';
import { PortfolioItem } from '@/lib/types';

const Portfolio = () => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { getPortfolioItems } = useSupabase();

  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const items = await getPortfolioItems();
        if (items) {
          const nonFeaturedItems = items.filter(item => !item.featured);
          setPortfolioItems(nonFeaturedItems);
        }
      } catch (error) {
        console.error('Error fetching portfolio items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-background flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-t-primary border-r-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          Our Portfolio
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: item.id * 0.1 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 rounded-lg">
                <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/80 text-center">{item.description}</p>
                <ArrowRight className="text-white mt-4" />
              </div>
            </motion.div>
          ))}
        </div>

        <Dialog 
          open={!!selectedItem} 
          onOpenChange={() => setSelectedItem(null)}
        >
          <DialogContent className="max-w-5xl w-full bg-background p-0">
            <AnimatePresence>
              {selectedItem && (
                <div className="relative">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
                  >
                    <X size={24} />
                  </button>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <div className="aspect-square w-full">
                      <img
                        src={selectedItem.image_url}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-6 bg-background">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h2 className="text-2xl font-bold mb-2">
                          {selectedItem.title}
                        </h2>
                        <p className="text-muted-foreground">
                          {selectedItem.description}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Portfolio;