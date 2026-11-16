
import { Button } from "@/components/ui/button";
import { Mail, Phone, Instagram } from "lucide-react";

const ContactSection = () => {
  return (
    <section id="contact" className="section bg-studio-light">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-6 text-studio-dark animate-on-scroll tracking-wider">
            Get in Touch
          </h2>
          <p className="text-studio-gray mb-12 animate-on-scroll font-light" style={{ transitionDelay: '200ms' }}>
            Interested in our design studio or have a project in mind? We'd love to hear from you.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12 animate-on-scroll" style={{ transitionDelay: '300ms' }}>
            <a href="mailto:Aidlin427@gmail.com" className="flex items-center gap-3 text-studio-gray hover:text-studio-terracotta transition-colors">
              <Mail className="h-6 w-6" />
              <span className="font-light">Aidlin427@gmail.com</span>
            </a>
            <a href="tel:+972546554184" className="flex items-center gap-3 text-studio-gray hover:text-studio-terracotta transition-colors">
              <Phone className="h-6 w-6" />
              <span className="font-light">+972 54 655 4184</span>
            </a>
            <a href="https://www.instagram.com/aidlin_design/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-studio-gray hover:text-studio-terracotta transition-colors">
              <Instagram className="h-6 w-6" />
              <span className="font-light">@aidlin_design</span>
            </a>
          </div>
          
          <div className="animate-on-scroll" style={{ transitionDelay: '400ms' }}>
            <Button 
              className="bg-studio-terracotta hover:bg-studio-terracotta/90 text-studio-offwhite font-light text-lg py-6 px-10 rounded-sm tracking-wide"
              onClick={() => {
                // Open CV from Supabase storage in new tab
                window.open('https://zaktjjzkjiptdenrelxh.supabase.co/storage/v1/object/public/cv/Amit_Aidlin_CV25.pdf', '_blank');
              }}
            >
              View My CV
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
