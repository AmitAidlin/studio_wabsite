
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* YouTube Video Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            src="https://www.youtube.com/embed/bW2WQ9TPOcU?autoplay=1&mute=1&controls=0&loop=1&playlist=bW2WQ9TPOcU&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&enablejsapi=1"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute top-1/2 left-1/2 w-screen h-screen min-w-full min-h-full transform -translate-x-1/2 -translate-y-1/2 scale-110"
            style={{
              width: '100vw',
              height: '100vh',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover'
            }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Ceramic 3D Printing"
          ></iframe>
        </div>
        <div className="video-overlay"></div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex items-center justify-center h-full">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-4xl md:text-5xl font-light text-studio-offwhite mb-6 leading-tight tracking-wider animate-fade-in">
            CERAMIC <span className="text-studio-terracotta">3D PRINTING</span> STUDIO
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-12 max-w-xl mx-auto font-light animate-fade-in" style={{ animationDelay: "200ms" }}>
            Where traditional craft meets digital innovation
          </p>
          <Button 
            className="bg-studio-terracotta hover:bg-studio-terracotta/90 text-studio-offwhite py-3 px-8 rounded-sm text-lg font-light animate-fade-in flex items-center gap-2" 
            style={{ animationDelay: "400ms" }}
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get in Touch <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;
