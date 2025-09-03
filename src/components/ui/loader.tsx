import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
  return (
    <div className={cn("matrix-loader", className)} />
  );
};