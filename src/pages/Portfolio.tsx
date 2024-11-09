import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Portfolio = () => {
  const portfolioItems = [
    { id: 1, title: "Traditional", description: "Classic tattoo designs" },
    { id: 2, title: "Neo-Traditional", description: "Modern take on classics" },
    { id: 3, title: "Blackwork", description: "Bold black designs" },
    { id: 4, title: "Watercolor", description: "Artistic watercolor style" },
    { id: 5, title: "Minimalist", description: "Simple, clean designs" },
    { id: 6, title: "Japanese", description: "Traditional Japanese style" },
  ];

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
        
        <div className="portfolio-grid">
          {portfolioItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: item.id * 0.1 }}
              className="group relative"
            >
              <div className="aspect-square bg-accent rounded-lg overflow-hidden">
                <div className="w-full h-full bg-accent/20" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 rounded-lg">
                <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/80">{item.description}</p>
                <ArrowRight className="text-white mt-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;