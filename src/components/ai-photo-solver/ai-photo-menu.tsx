import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIPhotoMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SolutionResponse {
  solution: string;
  confidence?: number;
}

export const AIPhotoMenu = ({ open, onOpenChange }: AIPhotoMenuProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [solution, setSolution] = useState<SolutionResponse | null>(null);
  const [processingType, setProcessingType] = useState<'short' | 'detailed' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить доступ к камере",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (type: 'short' | 'detailed') => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setProcessingType(type);
    setSolution(null);

    try {
      const prompt = type === 'short' 
        ? "Решите эту задачу кратко, дайте только ответ с основными шагами решения"
        : "Решите эту задачу подробно, объясните каждый шаг решения, покажите все вычисления и дайте детальное объяснение";

      const { data, error } = await supabase.functions.invoke('ai-photo-solver', {
        body: {
          image: capturedImage,
          prompt: prompt
        }
      });

      if (error) throw error;

      setSolution({
        solution: data.solution,
        confidence: data.confidence
      });

      toast({
        title: "Готово!",
        description: "Задача решена успешно",
      });

    } catch (error) {
      console.error('Ошибка обработки изображения:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обработать изображение. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  const resetMenu = () => {
    setCapturedImage(null);
    setSolution(null);
    stopCamera();
    setIsProcessing(false);
    setProcessingType(null);
  };

  const handleClose = () => {
    resetMenu();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Решатель задач
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!capturedImage && !solution && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Сфотографируйте или загрузите изображение с задачей
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={startCamera}
                  className="flex flex-col items-center gap-2 h-20"
                  variant="outline"
                >
                  <Camera className="h-6 w-6" />
                  Камера
                </Button>
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 h-20"
                  variant="outline"
                >
                  <Upload className="h-6 w-6" />
                  Загрузить
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {streamRef.current && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <Button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2"
                    size="lg"
                  >
            </div>
          )}

          {capturedImage && !solution && (
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full rounded-lg"
                />
                <Button
                  onClick={resetMenu}
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Выберите тип решения:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => processImage('short')}
                    disabled={isProcessing}
                    className="flex flex-col items-center gap-2 h-20"
                    variant="outline"
                  >
                    {isProcessing && processingType === 'short' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                    Кратко
                  </Button>
                  
                  <Button 
                    onClick={() => processImage('detailed')}
                    disabled={isProcessing}
                    className="flex flex-col items-center gap-2 h-20"
                    variant="outline"
                  >
                    {isProcessing && processingType === 'detailed' ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                    Подробно
                  </Button>
                </div>
              </div>
            </div>
          )}

          {solution && (
            <div className="space-y-4">
              {capturedImage && (
                <img 
                  src={capturedImage} 
                  alt="Решенная задача" 
                  className="w-full rounded-lg max-h-40 object-cover"
                />
              )}
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-primary">Решение:</h4>
                <div className="text-sm whitespace-pre-wrap">
                  {solution.solution}
                </div>
                {solution.confidence && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Уверенность: {Math.round(solution.confidence * 100)}%
                  </div>
                )}
              </div>

              <Button 
                onClick={resetMenu}
                className="w-full"
              >
                Решить новую задачу
              </Button>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
