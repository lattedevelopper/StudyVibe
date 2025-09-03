import { Settings, BookOpen, TrendingUp, Award } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

export default function Profile() {
  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Профиль</h1>
        
        {/* User Info */}
        <div className="homework-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-background">АИ</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Алексей Иванов</h2>
              <p className="text-text-muted">11 класс А</p>
            </div>
          </div>
          <CustomButton className="w-full">
            Редактировать профиль
          </CustomButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="homework-card text-center">
            <BookOpen className="mx-auto mb-2 text-primary" size={24} />
            <div className="text-2xl font-bold">24</div>
            <div className="text-sm text-text-muted">Выполнено</div>
          </div>
          <div className="homework-card text-center">
            <TrendingUp className="mx-auto mb-2 text-primary" size={24} />
            <div className="text-2xl font-bold">89%</div>
            <div className="text-sm text-text-muted">Успеваемость</div>
          </div>
        </div>

        {/* Achievements */}
        <div className="homework-card mb-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Award className="text-primary" size={20} />
            Достижения
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-background">🏆</span>
              </div>
              <div>
                <div className="font-semibold text-sm">Отличник недели</div>
                <div className="text-xs text-text-muted">Выполнил все задания</div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="homework-card">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Settings className="text-primary" size={20} />
            Настройки
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-background rounded-lg transition-colors">
              Уведомления
            </button>
            <button className="w-full text-left p-2 hover:bg-background rounded-lg transition-colors">
              Конфиденциальность
            </button>
            <button className="w-full text-left p-2 hover:bg-background rounded-lg transition-colors text-destructive">
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}