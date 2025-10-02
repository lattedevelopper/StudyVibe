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
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Расписание</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border bg-surface-elevated p-3 text-left sticky left-0 z-10">
                  Урок
                </th>
                {DAYS.map((day, idx) => (
                  <th key={day} className="border border-border bg-surface-elevated p-3 text-center min-w-[120px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7].map((lessonNum) => (
                <tr key={lessonNum}>
                  <td className="border border-border p-3 font-semibold bg-surface-elevated sticky left-0 z-10">
                    {lessonNum}
                  </td>
                  {DAYS.map((_, dayIdx) => {
                    const lesson = getLessonForDay(dayIdx + 1, lessonNum);
                    return (
                      <td
                        key={dayIdx}
                        className={`border border-border p-3 text-center ${
                          lesson ? "cursor-pointer hover:bg-surface transition-colors" : "bg-surface-elevated"
                        }`}
                        onClick={() => handleLessonClick(lesson)}
                      >
                        {lesson ? (
                          <div className="text-sm">
                            <div className="font-semibold">{lesson.subject}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
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