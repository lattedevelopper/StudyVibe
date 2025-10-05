import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Calendar, BookOpen } from "lucide-react";
import { HomeworkCard } from "@/components/homework/homework-card";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  due_date: string;
}

interface HomeworkSubmission {
  homework_id: string;
  is_completed: boolean;
}

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadHomework();
    loadSubmissions();
  }, [user, navigate]);

  const loadHomework = async () => {
    const { data } = await supabase
      .from("homework")
      .select("*")
      .order("due_date", { ascending: true });
    
    setHomework(data || []);
  };

  const loadSubmissions = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("homework_submissions")
      .select("homework_id, is_completed")
      .eq("user_id", user.id);
    
    setSubmissions(data || []);
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

  const isCompleted = (homeworkId: string) => {
    return submissions.find(s => s.homework_id === homeworkId)?.is_completed || false;
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      {/* Header */}
      <div className="px-4 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              StudyVibe
            </h1>
            <p className="text-text-muted mt-1">
              {homework.filter(hw => !isCompleted(hw.id)).length} активных заданий
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/search")}
              className="p-3 rounded-2xl bg-surface-elevated border border-border shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Search size={22} className="text-foreground" />
            </button>
            <button 
              onClick={() => setShowNotifications(true)}
              className="p-3 rounded-2xl bg-surface-elevated border border-border shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Bell size={22} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="homework-card text-center py-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <BookOpen className="text-primary" size={20} />
            </div>
            <div className="text-2xl font-bold">{homework.length}</div>
            <div className="text-xs text-text-muted mt-1">Всего</div>
          </div>
          <div className="homework-card text-center py-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Calendar className="text-primary" size={20} />
            </div>
            <div className="text-2xl font-bold">{homework.filter(hw => !isCompleted(hw.id)).length}</div>
            <div className="text-xs text-text-muted mt-1">Активных</div>
          </div>
          <div className="homework-card text-center py-4">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-bold">✓</span>
              </div>
            </div>
            <div className="text-2xl font-bold">{homework.filter(hw => isCompleted(hw.id)).length}</div>
            <div className="text-xs text-text-muted mt-1">Выполнено</div>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="px-4">
        <h2 className="text-xl font-bold mb-4">Домашние задания</h2>
        
        {/* Homework Cards */}
        <div className="space-y-3">
          {homework.length === 0 ? (
            <div className="homework-card text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Нет домашних заданий</h3>
              <p className="text-text-muted text-sm">Пока что заданий не добавлено</p>
            </div>
          ) : (
            homework.map((hw) => (
              <HomeworkCard
                key={hw.id}
                title={hw.title}
                subject={hw.subject}
                dueDate={new Date(hw.due_date).toLocaleDateString('ru-RU')}
                timeLeft={getTimeLeft(hw.due_date)}
                description={hw.description}
                isCompleted={isCompleted(hw.id)}
                onDetailsClick={() => navigate(`/homework/${hw.id}`)}
                onExecuteClick={() => navigate(`/homework/${hw.id}`)}
                homeworkId={hw.id}
              />
            ))
          )}
        </div>
      </div>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
}