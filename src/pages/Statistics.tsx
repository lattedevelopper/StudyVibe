import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, BookOpen, Award, Target, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";
import { Progress } from "@/components/ui/progress";
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
  const {
    user
  } = useAuth();
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
      const {
        data: submissions
      } = await supabase.from("homework_submissions").select(`
          *,
          homework:homework_id (
            subject,
            title,
            due_date
          )
        `).eq("user_id", user.id);

      // Get all homework to calculate totals
      const {
        data: allHomework
      } = await supabase.from("homework").select("id, subject, title");
      if (!submissions || !allHomework) return;

      // Calculate stats
      const totalHomeworks = allHomework.length;
      const completedHomeworks = submissions.filter(s => s.is_completed).length;
      const overallCompletionRate = totalHomeworks > 0 ? completedHomeworks / totalHomeworks * 100 : 0;

      // Group by subject
      const subjectMap = new Map<string, {
        completed: number;
        total: number;
      }>();

      // Initialize with all subjects
      allHomework.forEach(hw => {
        if (!subjectMap.has(hw.subject)) {
          subjectMap.set(hw.subject, {
            completed: 0,
            total: 0
          });
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
        completionRate: data.total > 0 ? data.completed / data.total * 100 : 0
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
    return <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>;
  }
  if (!stats) {
    return <div className="min-h-screen pb-20 px-4 pt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate("/profile")} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Статистика</h1>
          </div>
          <p className="text-text-muted text-center">Не удалось загрузить статистику</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-b from-background to-surface">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/profile")} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Статистика</h1>
        </div>

        <div className="space-y-6">
          {/* Overall Stats Card */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp size={24} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Общая статистика</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 size={20} className="text-primary" />
                    <div className="text-3xl font-bold text-primary">{stats.completedHomeworks}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Выполнено заданий</div>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target size={20} className="text-foreground" />
                    <div className="text-3xl font-bold">{stats.totalHomeworks}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Всего заданий</div>
                </div>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Общий прогресс</span>
                  <span className="text-2xl font-bold text-primary">{stats.overallCompletionRate.toFixed(1)}%</span>
                </div>
                <Progress value={stats.overallCompletionRate} className="h-3" />
              </div>
            </div>
          </Card>

          {/* Subject Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <span>Успеваемость по предметам</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.subjectStats.map((subject, index) => (
                  <div key={subject.subject} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all group-hover:scale-110 ${
                          index === 0 
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' 
                            : index === 1 
                            ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800 shadow-md' 
                            : index === 2
                            ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-md'
                            : 'bg-surface-elevated text-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-base">{subject.subject}</div>
                          <div className="text-sm text-muted-foreground">
                            {subject.completed} из {subject.total} заданий
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          {subject.completionRate.toFixed(0)}%
                        </span>
                        {index === 0 && subject.completionRate > 80 && (
                          <Award size={20} className="text-yellow-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                    <Progress value={subject.completionRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}