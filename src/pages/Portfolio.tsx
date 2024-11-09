import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const Portfolio = () => {
  const portfolioItems = [
    { id: 1, title: "Traditional", description: "Classic tattoo designs", image: "/images/portfolio/boondocks.png" },
    { id: 2, title: "Neo-Traditional", description: "Modern take on classics", image: "/images/portfolio/dragon.png" },
    { id: 3, title: "Blackwork", description: "Bold black designs", image: "/images/portfolio/frsnchise.png" },
    { id: 4, title: "Watercolor", description: "Artistic watercolor style", image: "/images/portfolio/luvers.png" },
    { id: 5, title: "Minimalist", description: "Simple, clean designs", image: "/images/portfolio/naruto.png" },
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
              <div className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
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