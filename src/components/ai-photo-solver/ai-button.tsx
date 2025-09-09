import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIPhotoMenu } from "./ai-photo-menu";

export const AIButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 z-50"
        size="icon"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>

      <AIPhotoMenu 
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
      />
    </>
  );
};