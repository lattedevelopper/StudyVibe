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

  return (
    <div className="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-b from-background to-surface">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Расписание уроков</h1>

        <div className="overflow-x-auto rounded-xl shadow-lg border border-border">
          <table className="w-full border-collapse bg-card">
            <thead>
              <tr className="bg-gradient-to-r from-primary/10 to-primary/5">
                <th className="border-r border-border p-4 text-left sticky left-0 z-10 bg-gradient-to-r from-primary/10 to-primary/5 font-bold">
                  Урок
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="border-r border-border p-4 text-center min-w-[140px] font-bold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((lessonNum) => (
                <tr key={lessonNum} className="hover:bg-surface/50 transition-colors">
                  <td className="border-r border-t border-border p-4 font-bold bg-surface-elevated sticky left-0 z-10 text-center text-lg">
                    {lessonNum}
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const lesson = getLessonForDay(dayIdx + 1, lessonNum);
                    return (
                      <td
                        key={dayIdx}
                        className={`border-r border-t border-border p-3 text-center transition-all ${
                          lesson 
                            ? "cursor-pointer hover:bg-primary/10 hover:shadow-md hover:scale-[1.02]" 
                            : "bg-surface-elevated/50"
                        }`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {lesson ? (
                          <div className="py-2">
                            <div className="font-semibold text-base mb-1 text-foreground">{lesson.subject}</div>
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
      </div>

      <LessonDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lesson={selectedLesson}
      />
    </div>
  );
}