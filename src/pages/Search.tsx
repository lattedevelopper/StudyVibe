import { useState } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { HomeworkCard } from "@/components/homework/homework-card";

const mockHomework = [
  {
    id: 1,
    title: "Решение квадратных уравнений",
    subject: "Математика",
    dueDate: "25 декабря",
    timeLeft: "2 дня",
    description: "Решить уравнения из учебника, страницы 45-47",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Сочинение по роману Война и мир",
    subject: "Литература",
    dueDate: "28 декабря",
    timeLeft: "5 дней",
    description: "Написать эссе на тему характеры главных героев",
    isCompleted: true,
  },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsLoading(true);
      // Simulate search delay
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const filteredHomework = mockHomework.filter(hw =>
    hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hw.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-foreground">
            <Filter size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : (
          <div className="space-y-4">
            {searchQuery ? (
              filteredHomework.length > 0 ? (
                filteredHomework.map((homework) => (
                  <HomeworkCard key={homework.id} {...homework} />
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