import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CustomButton } from "@/components/ui/custom-button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-background" />
          </div>
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-text-muted mt-2">Страница не найдена</p>
        </div>

          <CustomButton 
            type="submit" 
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="scale-50" /> : "Домой"}
          </CustomButton>
        </form>
    </div>
  );
  
export default NotFound;
