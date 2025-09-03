import { useState } from "react";
import { Plus, BookOpen, Clock, TrendingUp } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { HomeworkCard } from "@/components/homework/homework-card";
import { Link } from "react-router-dom";

const mockHomework = [
  {
    id: 1,
    title: "Решение квадратных уравнений",
    subject: "Математика", 
    dueDate: "25 декабря",
    timeLeft: "2 дня",
    description: "Решить уравнения из учебника, страницы 45-47. Показать подробное решение для каждого примера.",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Сочинение по роману Война и мир", 
    subject: "Литература",
    dueDate: "28 декабря",
    timeLeft: "5 дней",
    description: "Написать эссе на тему характеры главных героев. Объем 2-3 страницы.",
    isCompleted: true,
  },
  {
    id: 3,
    title: "Лабораторная работа по физике",
    subject: "Физика",
    dueDate: "30 декабря", 
    timeLeft: "1 неделя",
    description: "Измерение ускорения свободного падения. Оформить отчет с графиками.",
    isCompleted: false,
  }
];

const Index = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredHomework = mockHomework.filter(hw => {
    if (filter === 'pending') return !hw.isCompleted;
    if (filter === 'completed') return hw.isCompleted;
    return true;
  });

  const stats = {
    total: mockHomework.length,
    completed: mockHomework.filter(hw => hw.isCompleted).length,
    pending: mockHomework.filter(hw => !hw.isCompleted).length,
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Домашние задания</h1>
            <p className="text-text-muted">Сегодня, 23 декабря</p>
          </div>
          <Link to="/login">
            <CustomButton className="p-3">
              <Plus size={20} />
            </CustomButton>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="homework-card text-center py-3">
            <BookOpen className="mx-auto mb-1 text-primary" size={20} />
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-text-muted">Всего</div>
          </div>
          <div className="homework-card text-center py-3">
            <Clock className="mx-auto mb-1 text-primary" size={20} />
            <div className="text-lg font-bold">{stats.pending}</div>
            <div className="text-xs text-text-muted">В процессе</div>
          </div>
          <div className="homework-card text-center py-3">
            <TrendingUp className="mx-auto mb-1 text-primary" size={20} />
            <div className="text-lg font-bold">{stats.completed}</div>
            <div className="text-xs text-text-muted">Выполнено</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-primary text-background' 
                : 'bg-surface-elevated text-text-muted hover:text-foreground'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending' 
                ? 'bg-primary text-background' 
                : 'bg-surface-elevated text-text-muted hover:text-foreground'
            }`}
          >
            В процессе
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-primary text-background' 
                : 'bg-surface-elevated text-text-muted hover:text-foreground'
            }`}
          >
            Выполнено
          </button>
        </div>
      </div>

      {/* Homework List */}
      <div className="px-4 space-y-4">
        {filteredHomework.map((homework) => (
          <HomeworkCard key={homework.id} {...homework} />
        ))}
        
        {filteredHomework.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
            <p className="text-text-muted">Заданий не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
