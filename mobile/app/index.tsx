import { Redirect } from "expo-router";
import { useAuth } from "@/lib/auth";

export default function Index() {
  const { status, user } = useAuth();

  if (status === "loading") return null;
  if (status === "unauthenticated") return <Redirect href="/login" />;

  if (user?.role === "admin") return <Redirect href="/(admin)" />;
  if (user?.role === "instructor") return <Redirect href="/(instructor)" />;
  return <Redirect href="/(student)/dashboard" />;
}
