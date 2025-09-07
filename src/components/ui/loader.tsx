import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  variant?: "default" | "white";
}

export const Loader = ({ className, variant = "default" }: LoaderProps) => {
  return (
    <div className={cn(
      variant === "white" ? "matrix-loader-white" : "matrix-loader", 
      className
    )} />
  );
};