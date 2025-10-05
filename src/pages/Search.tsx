import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { HomeworkCard } from "@/components/homework/homework-card";
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

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSubject, setFilterSubject] = useState("");
  const [filterCompleted, setFilterCompleted] = useState<"all" | "completed" | "pending">("all");

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
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

  const isCompleted = (homeworkId: string) => {
    return submissions.find(s => s.homework_id === homeworkId)?.is_completed || false;
  };

  const filteredHomework = homework.filter(hw => {
    const matchesSearch = hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hw.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = !filterSubject || hw.subject === filterSubject;
    
    const isHwCompleted = isCompleted(hw.id);
    const matchesCompleted = filterCompleted === "all" ||
                           (filterCompleted === "completed" && isHwCompleted) ||
                           (filterCompleted === "pending" && !isHwCompleted);
    
    return matchesSearch && matchesSubject && matchesCompleted;
  });

  const uniqueSubjects = [...new Set(homework.map(hw => hw.subject))];

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Поиск заданий</h1>
        
        <div className="relative mb-6">
          <SearchIcon 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            placeholder="Поиск по предмету или названию..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface-elevated border border-border rounded-xl 
                     text-foreground placeholder-text-muted focus:outline-none focus:ring-2 
                     focus:ring-primary focus:border-transparent"
          />
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-foreground"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 bg-surface-elevated rounded-xl border border-border space-y-4">
            <h3 className="font-semibold">Фильтры</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Предмет</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
              >
                <option value="">Все предметы</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Статус выполнения</label>
              <select
                value={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.value as "all" | "completed" | "pending")}
                className="w-full p-2 bg-background border border-border rounded-lg text-foreground"
              >
                <option value="all">Все задания</option>
                <option value="completed">Выполненные</option>
                <option value="pending">Невыполненные</option>
              </select>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="space-y-4">
            {searchQuery ? (
              filteredHomework.length > 0 ? (
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
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-muted">Ничего не найдено</p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <SearchIcon size={48} className="mx-auto text-text-muted mb-4" />
                <p className="text-text-muted">Введите запрос для поиска</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}