
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const Projects = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20 px-6 md:px-12 lg:px-24 bg-studio-offwhite">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-studio-dark mb-2 tracking-wider">
            PROJECTS & <span className="text-studio-terracotta">EXHIBITIONS</span>
          </h1>
          <p className="text-lg text-gray-600 mb-12">Explore our latest ceramic 3D printing projects and exhibitions</p>
          
          <Separator className="mb-12" />
          
          {/* Featured Project */}
          <div className="mb-16">
            <h2 className="text-2xl font-light mb-6 tracking-wider">FEATURED PROJECT</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-video bg-gray-200 rounded-sm overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1565373676943-67d8bd3e5e58?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Ceramic Vessels Exhibition" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-3xl font-light mb-4 text-studio-terracotta">Ceramic Vessels Exhibition</h3>
                <p className="text-gray-600 mb-4">
                  Our latest exhibition showcases a collection of algorithmically designed ceramic vessels that explore 
                  the intersection of traditional pottery techniques and computational design. Each piece is 3D printed 
                  using our custom clay formulation and finished with handcrafted glazes.
                </p>
                <p className="text-gray-600">
                  <strong>Location:</strong> Design Museum, London<br />
                  <strong>Date:</strong> June 15 - August 30, 2025
                </p>
              </div>
            </div>
          </div>
          
          {/* Past Projects */}
          <h2 className="text-2xl font-light mb-6 tracking-wider">PAST PROJECTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pastProjects.map((project, index) => (
              <Card key={index} className="border-none shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="text-xl font-light mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{project.date}</p>
                  <p className="text-gray-600">{project.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Sample data for past projects
const pastProjects = [
  {
    title: "Algorithmic Textures",
    date: "March 2025",
    description: "A study of algorithmically generated surface textures applied to ceramic forms through 3D printing.",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Architectural Ceramics",
    date: "November 2024",
    description: "A collection of architectural elements designed for acoustic performance and produced with our large-format ceramic printer.",
    image: "https://images.unsplash.com/photo-1567016520496-0cb37d8467a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Digital Heritage",
    date: "September 2024",
    description: "Recreations of historical ceramic artifacts using 3D scanning and digital fabrication techniques.",
    image: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
];

export default Projects;
