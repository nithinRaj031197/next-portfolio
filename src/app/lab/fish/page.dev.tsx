import { notFound } from "next/navigation";
import { FishLab } from "@/components/three/FishLab";

export const metadata = { title: "Fish lab", robots: { index: false, follow: false } };

/** Development-only: close-up views of the procedural fish for silhouette and swim checks. 404 in production. */
export default function FishLabPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <FishLab />;
}
