import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace-shell";

export const metadata: Metadata = { title: "Instructor Studio · LinguaAtlas" };

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell area="instructor">{children}</WorkspaceShell>;
}
