// Generated from "Projects & Exhibitions/projects.xlsx" by `npm run update-shop`.
// Only rows approved by the owner are included. Don't edit projects.json by hand.
import projectsData from "./projects.json";

export type ProjectItem = {
  id: string;
  type: "Exhibition" | "Project" | "Award";
  title: string;
  date: string;
  location: string;
  description: string;
  link: string;
  image: string; // file name inside public/projects, empty if none
};

export const projectItems: ProjectItem[] = projectsData as ProjectItem[];

export const projectImageUrl = (image: string) => `${import.meta.env.BASE_URL}projects/${image}`;
