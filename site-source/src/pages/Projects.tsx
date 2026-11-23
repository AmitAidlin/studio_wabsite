import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import { ProjectItem, projectImageUrl, projectItems } from "@/data/projects";

// newest first, by the first 4-digit year found in the date text
const year = (p: ProjectItem) => Number(p.date.match(/\d{4}/)?.[0] ?? 0);
const newestFirst = (a: ProjectItem, b: ProjectItem) => year(b) - year(a);

const sections: { type: ProjectItem["type"]; title: string }[] = [
  { type: "Exhibition", title: "EXHIBITIONS" },
  { type: "Project", title: "PROJECTS" },
  { type: "Award", title: "AWARDS" },
];

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
          <p className="text-lg text-gray-600 mb-12">Selected projects, exhibitions and awards</p>

          <Separator className="mb-12" />

          {projectItems.length === 0 && (
            <p className="text-gray-500 py-10">Coming soon.</p>
          )}

          {sections.map(({ type, title }) => {
            const items = projectItems.filter((p) => p.type === type).sort(newestFirst);
            if (items.length === 0) return null;
            return (
              <section key={type} className="mb-16">
                <h2 className="text-2xl font-light mb-6 tracking-wider">{title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((item) => (
                    <Card key={item.id} className="border-none shadow-sm overflow-hidden flex flex-col">
                      {item.image && (
                        <img
                          src={projectImageUrl(item.image)}
                          alt={item.title}
                          className="w-full aspect-video object-cover bg-gray-100"
                        />
                      )}
                      <CardContent className="pt-5 flex-1 flex flex-col">
                        {item.date && <p className="text-sm text-studio-terracotta mb-1">{item.date}</p>}
                        <h3 className="text-xl font-light mb-1">{item.title}</h3>
                        {item.location && <p className="text-sm text-gray-500 mb-3">{item.location}</p>}
                        {item.description && <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-4 text-sm text-studio-terracotta hover:underline"
                          >
                            Read more <ExternalLink size={14} />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Projects;
