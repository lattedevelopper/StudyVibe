import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  due_date: string;
  solution?: string;
  files?: string[];
}
interface HomeworkSubmission {
  id: string;
  is_completed: boolean;
  submitted_at: string | null;
}
export default function HomeworkDetail() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [homework, setHomework] = useState<Homework | null>(null);
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (id) {
      loadHomework();
      loadSubmission();
    }
  }, [id, user, navigate]);
  const loadHomework = async () => {
    const {
      data,
      error
    } = await supabase.from("homework").select("*").eq("id", id).single();
    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить домашнее задание",
        variant: "destructive"
      });
      navigate("/");
    } else {
      setHomework(data);
    }
    setLoading(false);
  };
  const loadSubmission = async () => {
    if (!user) return;
    const {
      data
    } = await supabase.from("homework_submissions").select("*").eq("homework_id", id).eq("user_id", user.id).maybeSingle();
    setSubmission(data);
  };
  const toggleCompletion = async () => {
    if (!user || !homework) return;
    try {
      if (submission) {
        // Update existing submission
        const {
          error
        } = await supabase.from("homework_submissions").update({
          is_completed: !submission.is_completed,
          submitted_at: !submission.is_completed ? new Date().toISOString() : null
        }).eq("id", submission.id);
        if (error) throw error;
      } else {
        // Create new submission
        const {
          error
        } = await supabase.from("homework_submissions").insert({
          homework_id: homework.id,
          user_id: user.id,
          is_completed: true,
          submitted_at: new Date().toISOString()
        });
        if (error) throw error;
      }
      loadSubmission();
      toast({
        title: "Успешно",
        description: submission?.is_completed ? "Задание отмечено как невыполненное" : "Задание выполнено!"
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус задания",
        variant: "destructive"
      });
    }
  };
  const getTimeLeft = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "Просрочено";
    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Завтра";
    return `${diffDays} дней`;
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          
        </div>
      </div>;
  }
  if (!homework) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted">Задание не найдено</p>
          <CustomButton onClick={() => navigate("/")} className="mt-4">
            На главную
          </CustomButton>
        </div>
      </div>;
  }
  const isCompleted = submission?.is_completed || false;
  return <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-text-muted hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={20} />
          Назад к заданиям
        </button>

        <div className="homework-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{homework.subject}</span>
              {isCompleted && <CheckCircle2 size={16} className="text-primary" />}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">{homework.title}</h1>

          <div className="flex items-center gap-6 text-sm text-text-muted mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(homework.due_date).toLocaleDateString('ru-RU')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{getTimeLeft(homework.due_date)}</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Описание задания</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{homework.description}</p>
            </div>
          </div>

          {homework.solution && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Решение</h2>
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap">{homework.solution}</p>
              </div>
            </div>
          )}

          {homework.files && homework.files.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Прикрепленные файлы</h2>
              <div className="space-y-2">
                {homework.files.map((file, index) => (
                  <a
                    key={index}
                    href={`https://vgshpvvlmttytihdgeoi.supabase.co/storage/v1/object/public/homework-files/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-surface-elevated border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <span className="text-sm">{file.split('/').pop()}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <CustomButton onClick={toggleCompletion} className={`${isCompleted ? 'bg-surface-elevated text-foreground border border-border' : ''}`}>
              {isCompleted ? "Отметить как невыполненное" : "Отметить как выполненное"}
            </CustomButton>
          </div>

          {submission?.submitted_at && <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-primary">
                Выполнено: {new Date(submission.submitted_at).toLocaleString('ru-RU')}
              </p>
            </div>}
        </div>
      </div>
    </div>;
}