import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

interface HomeworkCardProps {
  title: string;
  subject: string;
  dueDate: string;
  timeLeft: string;
  isCompleted?: boolean;
  description: string;
  onDetailsClick?: () => void;
  onExecuteClick?: () => void;
  homeworkId?: string;
}

export const HomeworkCard = ({
  title,
  subject,
  dueDate,
  timeLeft,
  isCompleted = false,
  description,
  onDetailsClick,
  onExecuteClick,
}: HomeworkCardProps) => {
  return (
    <div className="homework-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-primary">{subject}</span>
            {isCompleted && <CheckCircle2 size={16} className="text-primary" />}
          </div>
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
        </div>
      </div>
      
      <p className="text-text-muted text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{dueDate}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{timeLeft}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <CustomButton 
          onClick={isCompleted ? onDetailsClick : onExecuteClick}
          className="text-sm py-2 px-4"
        >
          {isCompleted ? "Просмотреть" : "Выполнить"}
        </CustomButton>
        {!isCompleted && (
          <button 
            onClick={onDetailsClick}
            className="text-sm text-text-muted hover:text-foreground transition-colors"
          >
            Подробнее
          </button>
        )}
      </div>
    </div>
  );
};