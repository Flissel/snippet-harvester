
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center space-y-4 px-4">
        <h1 className="text-3xl sm:text-4xl font-bold">404</h1>
        <p className="text-lg sm:text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-block text-primary hover:text-primary/80 underline underline-offset-4">
          Return to Home
        </a>
      </div>
    </div>
  );
}
