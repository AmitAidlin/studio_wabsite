
import { useEffect, useRef } from "react";
import { Circle, Box, Layers } from "lucide-react";

const AboutSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section id="about" className="section bg-studio-offwhite" ref={sectionRef}>
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-12 text-center text-studio-dark animate-on-scroll tracking-wider">
            About <span className="text-studio-terracotta">Aidlin Design</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-on-scroll" style={{ transitionDelay: '200ms' }}>
              <div className="aspect-square bg-studio-light rounded-sm overflow-hidden">
                <img 
                  src={`${import.meta.env.BASE_URL}lovable-uploads/fb2fcb67-55e5-4695-b06b-7b0b112b6ec8.png`}
                  alt="Amit Aidlin - Designer" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="flex flex-col justify-center animate-on-scroll" style={{ transitionDelay: '400ms' }}>
              <h3 className="text-2xl font-light mb-4 text-studio-dark tracking-wide">Creative Design Studio</h3>
              <p className="text-studio-gray mb-6 font-light">
                Aidlin Design is a boutique studio specializing in 3D printed ceramics. 
                With a focus on clean aesthetics and innovative techniques, we create functional 
                art that merges traditional craftsmanship with cutting-edge technology.
              </p>
              <p className="text-studio-gray mb-8 font-light">
                Our process allows for precision and creativity in ways traditional 
                pottery cannot achieve, resulting in unique pieces that honor ceramic 
                traditions while embracing modern possibilities.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="ceramic-card flex flex-col items-center text-center">
                  <Circle className="h-6 w-6 mb-3 text-studio-terracotta" />
                  <span className="text-sm font-light text-studio-dark">Custom Designs</span>
                </div>
                <div className="ceramic-card flex flex-col items-center text-center">
                  <Box className="h-6 w-6 mb-3 text-studio-terracotta" />
                  <span className="text-sm font-light text-studio-dark">3D Printing</span>
                </div>
                <div className="ceramic-card flex flex-col items-center text-center">
                  <Layers className="h-6 w-6 mb-3 text-studio-terracotta" />
                  <span className="text-sm font-light text-studio-dark">Fine Ceramics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
