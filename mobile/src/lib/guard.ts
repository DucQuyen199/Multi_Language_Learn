import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "./auth";

/**
 * Guard a screen group by role. Redirects to login when unauthenticated,
 * or to the correct workspace when the role does not match.
 */
export function useRequireRole(role: "student" | "instructor" | "admin") {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (!user) return;
    if (role === "student") return; // every role can view the learner workspace
    if (user.role === "admin") return; // admin can access instructor console too
    if (user.role !== role) {
      router.replace("/(student)/dashboard");
    }
  }, [status, user, role]);

  return { status, user };
}
