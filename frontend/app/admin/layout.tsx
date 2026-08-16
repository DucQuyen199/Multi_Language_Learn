import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace-shell";

export const metadata: Metadata = { title: "Admin Console · LinguaAtlas" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell area="admin">{children}</WorkspaceShell>;
}
