import { useUser } from "@clerk/clerk-react";
import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return null;


  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
}
