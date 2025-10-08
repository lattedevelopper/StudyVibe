import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, DoorOpen, Clock } from "lucide-react";

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lesson: {
    subject: string;
    teacher_name: string;
    room_number: string;
    start_time: string;
  } | null;
}

export function LessonDialog({ open, onOpenChange, lesson }: LessonDialogProps) {
  if (!lesson) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lesson.subject}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-surface-elevated rounded-lg">
            <Clock className="text-primary" size={24} />
            <div>
              <p className="text-sm text-muted-foreground">Время начала</p>
              <p className="font-semibold">{lesson.start_time.slice(0, 5)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-surface-elevated rounded-lg">
            <User className="text-primary" size={24} />
            <div>
              <p className="text-sm text-muted-foreground">Преподаватель</p>
              <p className="font-semibold">{lesson.teacher_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-surface-elevated rounded-lg">
            <DoorOpen className="text-primary" size={24} />
            <div>
              <p className="text-sm text-muted-foreground">Кабинет</p>
              <p className="font-semibold">{lesson.room_number}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}