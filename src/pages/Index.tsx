import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Particles } from "@/components/ui/particles";
import Typewriter from "typewriter-effect";

const Index = () => {
  const featuredWorks = [
    { id: 1, image: "/images/home/h1.jpeg", alt: "Featured Tattoo 1" },
    { id: 2, image: "/images/home/h2.jpeg", alt: "Featured Tattoo 2" },
    { id: 3, image: "/images/home/h3.jpeg", alt: "Featured Tattoo 3" },
    { id: 4, image: "/images/home/h4.jpeg", alt: "Featured Tattoo 4" },
    { id: 5, image: "/images/home/h5.jpeg", alt: "Featured Tattoo 5" },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center bg-black text-white overflow-hidden">
        <Particles
          className="absolute inset-0"
          quantity={1000}
          staticity={50}
          ease={50}
          color="#ffffff"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-doto mb-6">
            <Typewriter
              options={{
                strings: ["KowTattys"],
                autoStart: true,
                loop: true,
                cursor: "|",
                delay: 100,
              }}
            />
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Where Art Meets Skin
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-500 rounded-full hover:bg-opacity-90 transition-colors"
          >
            Book Now
            <ArrowRight className="ml-2" size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Featured Work Preview */}
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
                className="relative group overflow-hidden rounded-lg"
              >
                <img 
                  src={work.image} 
                  alt={work.alt} 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-lg font-medium">View Details</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/portfolio"
              className="inline-flex items-center text-lg font-medium text-foreground hover:text-tattoo-purple transition-colors"
            >
              View Full Portfolio
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-accent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Crafting Your Perfect Tattoo
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              With years of experience and a passion for artistic excellence, we bring your ideas to life through stunning, permanent art.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-500 rounded-full hover:bg-opacity-90 transition-colors"
            >
              Get in Touch
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
