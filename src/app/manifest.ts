import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Jeevan Productions",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ec",
    theme_color: "#f4f1ec",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
