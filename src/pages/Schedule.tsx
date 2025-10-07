import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LessonDialog } from "@/components/schedule/lesson-dialog";

interface Lesson {
  id: string;
  day_of_week: number;
  lesson_number: number;
  subject: string;
  teacher_name: string;
  room_number: string;
  start_time: string;
}

const DAYS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье"
];

export default function Schedule() {
  const [schedule, setSchedule] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    const { data } = await supabase
      .from("schedule")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("lesson_number", { ascending: true });

    if (data) {
      setSchedule(data);
    }
  };

  const getLessonForDay = (dayOfWeek: number, lessonNumber: number) => {
    return schedule.find(
      (l) => l.day_of_week === dayOfWeek && l.lesson_number === lessonNumber
    );
  };

  const handleLessonClick = (lesson: Lesson | undefined) => {
    if (lesson) {
      setSelectedLesson(lesson);
      setDialogOpen(true);
    }
  };

  const maxLessonNumber = Math.max(...schedule.map(l => l.lesson_number), 6);

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-b from-background to-surface">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Расписание уроков
        </h1>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-x-auto rounded-xl shadow-2xl border border-border/50">
          <table className="w-full border-collapse bg-card">
            <thead>
              <tr className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5">
                <th className="border-r border-border p-4 text-left sticky left-0 z-10 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 font-bold text-lg">
                  Урок
                </th>
                {DAYS.slice(0, 6).map((day) => (
                  <th key={day} className="border-r border-border p-4 text-center min-w-[140px] font-bold text-base">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxLessonNumber }, (_, i) => i + 1).map((lessonNum) => (
                <tr key={lessonNum} className="hover:bg-surface/50 transition-colors">
                  <td className="border-r border-t border-border p-4 font-bold bg-surface-elevated sticky left-0 z-10 text-center text-lg">
                    {lessonNum}
                  </td>
                  {DAYS.slice(0, 6).map((_, dayIdx) => {
                    const lesson = getLessonForDay(dayIdx + 1, lessonNum);
                    return (
                      <td
                        key={dayIdx}
                        className={`border-r border-t border-border p-3 text-center transition-all ${
                          lesson 
                            ? "cursor-pointer hover:bg-primary/10 hover:shadow-md hover:scale-[1.02]" 
                            : "bg-surface-elevated/30"
                        }`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {lesson ? (
                          <div className="py-2">
                            <div className="font-semibold text-base mb-1">{lesson.subject}</div>
                            <div className="text-xs text-muted-foreground mb-1">{lesson.start_time.slice(0, 5)}</div>
                            <div className="text-xs text-muted-foreground">{lesson.room_number}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden space-y-6">
          {DAYS.slice(0, 6).map((day, dayIdx) => {
            const dayLessons = schedule.filter(l => l.day_of_week === dayIdx + 1);
            if (dayLessons.length === 0) return null;

            return (
              <div key={day} className="space-y-3">
                <h2 className="text-xl font-bold sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 border-b border-border">
                  {day}
                </h2>
                <div className="space-y-2">
                  {dayLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson)}
                      className="homework-card cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-primary">{lesson.lesson_number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1 truncate">{lesson.subject}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="truncate">{lesson.teacher_name}</span>
                            <span className="flex-shrink-0">{lesson.start_time.slice(0, 5)}</span>
                            <span className="flex-shrink-0">Каб. {lesson.room_number}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={selectedLesson}
      />
    </div>
  );
}