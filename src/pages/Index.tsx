import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Calendar, BookOpen, Filter } from "lucide-react";
import { HomeworkCard } from "@/components/homework/homework-card";
import { TagsFilter } from "@/components/homework/tags-filter";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  due_date: string;
  tags?: string[];
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // Get all unique tags and subjects from homework
  const allTags = [...new Set(homework.flatMap(hw => hw.tags || []))];
  const allSubjects = [...new Set(homework.map(hw => hw.subject))];

  // Filter and sort homework
  const filteredHomework = homework
    .filter(hw => {
      // Filter by tags
      const matchesTags = selectedTags.length === 0 || hw.tags?.some(tag => selectedTags.includes(tag));
      
      // Filter by subject
      const matchesSubject = selectedSubject === "all" || hw.subject === selectedSubject;
      
      // Filter by status
      const completed = isCompleted(hw.id);
      const matchesStatus = 
        statusFilter === "all" || 
        (statusFilter === "active" && !completed) || 
        (statusFilter === "completed" && completed);
      
      return matchesTags && matchesSubject && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      } else if (sortBy === "subject") {
        return a.subject.localeCompare(b.subject);
      } else if (sortBy === "priority") {
        const aDays = Math.ceil((new Date(a.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil((new Date(b.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return aDays - bDays;
      }
      return 0;
    });

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">StudyVibe</h1>
            <p className="text-text-muted">У вас {homework.filter(hw => !isCompleted(hw.id)).length} активных заданий</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate("/search")}
              className="p-3 rounded-xl bg-surface-elevated text-text-muted hover:text-foreground transition-colors"
            >
              <Search size={20} />
            </button>
            <button 
              onClick={() => setShowNotifications(true)}
              className="p-3 rounded-xl bg-surface-elevated text-text-muted hover:text-foreground transition-colors"
            >
              <Bell size={20} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="homework-card text-center py-3">
            <BookOpen className="mx-auto mb-1 text-primary" size={20} />
            <div className="text-lg font-bold">{homework.length}</div>
            <div className="text-xs text-text-muted">Всего</div>
          </div>
          <div className="homework-card text-center py-3">
            <Calendar className="mx-auto mb-1 text-primary" size={20} />
            <div className="text-lg font-bold">{homework.filter(hw => !isCompleted(hw.id)).length}</div>
            <div className="text-xs text-text-muted">Активных</div>
          </div>
          <div className="homework-card text-center py-3">
            <div className="w-5 h-5 bg-primary rounded-full mx-auto mb-1 flex items-center justify-center">
              <span className="text-xs text-background">✓</span>
            </div>
            <div className="text-lg font-bold">{homework.filter(hw => isCompleted(hw.id)).length}</div>
            <div className="text-xs text-text-muted">Выполнено</div>
          </div>
        </div>
      </div>

      {/* Homework List */}
      <div className="px-4">
        <h2 className="text-lg font-semibold mb-4">Домашние задания</h2>
        
        {/* Filters and Sort */}
        <div className="space-y-3 mb-4">
          {/* Tags Filter */}
          <TagsFilter
            allTags={allTags}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
          
          {/* Subject and Status Filters */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Все предметы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все предметы</SelectItem>
                {allSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Все" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="priority">По приоритету</SelectItem>
              <SelectItem value="subject">По предмету</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Homework Cards */}
        <div className="space-y-4">
          {filteredHomework.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
              <h3 className="text-lg font-semibold text-text-muted mb-2">
                {selectedTags.length > 0 ? "Нет заданий с такими тегами" : "Нет домашних заданий"}
              </h3>
              <p className="text-text-muted">
                {selectedTags.length > 0 ? "Попробуйте изменить фильтр" : "Пока что заданий не добавлено"}
              </p>
            </div>
          ) : (
            filteredHomework.map((hw) => (
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