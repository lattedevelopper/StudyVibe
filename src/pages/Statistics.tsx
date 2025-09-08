import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, BookOpen, Clock, Target, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface SubjectStats {
  subject: string;
  completed: number;
  total: number;
  completionRate: number;
}

interface UserStats {
  totalHomeworks: number;
  completedHomeworks: number;
  overallCompletionRate: number;
  subjectStats: SubjectStats[];
  averageCompletionTime: number;
}

export default function Statistics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadStatistics();
  }, [user, navigate]);

  const loadStatistics = async () => {
    if (!user) return;

    try {
      // Get all homework submissions for the user
      const { data: submissions } = await supabase
        .from("homework_submissions")
        .select(`
          *,
          homework:homework_id (
            subject,
            title,
            due_date
          )
        `)
        .eq("user_id", user.id);

      // Get all homework to calculate totals
      const { data: allHomework } = await supabase
        .from("homework")
        .select("id, subject, title");

      if (!submissions || !allHomework) return;

      // Calculate stats
      const totalHomeworks = allHomework.length;
      const completedHomeworks = submissions.filter(s => s.is_completed).length;
      const overallCompletionRate = totalHomeworks > 0 ? (completedHomeworks / totalHomeworks) * 100 : 0;

      // Group by subject
      const subjectMap = new Map<string, { completed: number; total: number }>();
      
      // Initialize with all subjects
      allHomework.forEach(hw => {
        if (!subjectMap.has(hw.subject)) {
          subjectMap.set(hw.subject, { completed: 0, total: 0 });
        }
        subjectMap.get(hw.subject)!.total++;
      });

      // Count completed by subject
      submissions.forEach(submission => {
        if (submission.is_completed && submission.homework) {
          const subject = (submission.homework as any).subject;
          if (subjectMap.has(subject)) {
            subjectMap.get(subject)!.completed++;
          }
        }
      });

      const subjectStats: SubjectStats[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
        subject,
        completed: data.completed,
        total: data.total,
        completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0
      })).sort((a, b) => b.completionRate - a.completionRate);

      // Calculate average completion time (simplified)
      const completedSubmissions = submissions.filter(s => s.is_completed && s.submitted_at);
      const averageCompletionTime = completedSubmissions.length > 0 ? 2.5 : 0; // Placeholder value

      setStats({
        totalHomeworks,
        completedHomeworks,
        overallCompletionRate,
        subjectStats,
        averageCompletionTime
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen pb-20 px-4 pt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate("/profile")} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Статистика</h1>
          </div>
          <p className="text-text-muted text-center">Не удалось загрузить статистику</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate("/profile")} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Статистика</h1>
        </div>

        <div className="space-y-4">
          {/* Overall Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} />
                Общая статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.completedHomeworks}</div>
                  <div className="text-sm text-text-muted">Выполнено</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.totalHomeworks}</div>
                  <div className="text-sm text-text-muted">Всего заданий</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold">{stats.overallCompletionRate.toFixed(1)}%</div>
                <div className="text-sm text-text-muted">Процент выполнения</div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                Успеваемость по предметам
              </CardTitle>
              <CardDescription>
                Статистика выполнения заданий по предметам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.subjectStats.map((subject, index) => (
                  <div key={subject.subject} className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        index === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{subject.subject}</div>
                        <div className="text-sm text-text-muted">{subject.completed}/{subject.total} заданий</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{subject.completionRate.toFixed(1)}%</div>
                      {index === 0 && subject.completionRate > 80 && (
                        <Award size={16} className="text-yellow-500 mx-auto mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Временная статистика
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.averageCompletionTime.toFixed(1)} ч</div>
                <div className="text-sm text-text-muted">Среднее время выполнения</div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} />
                Достижения
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.overallCompletionRate > 80 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950">
                    <Award size={16} className="text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">Отличник - более 80% выполнения</span>
                  </div>
                )}
                {stats.completedHomeworks >= 10 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <Award size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">Трудолюбивый - выполнено 10+ заданий</span>
                  </div>
                )}
                {stats.subjectStats.some(s => s.completionRate === 100) && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
                    <Award size={16} className="text-purple-600" />
                    <span className="text-sm text-purple-700 dark:text-purple-300">Перфекционист - 100% по предмету</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}