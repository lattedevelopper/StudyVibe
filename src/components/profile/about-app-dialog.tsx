import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomButton } from "@/components/ui/custom-button";
import { Info, BookOpen, User, Bell, Search } from "lucide-react";

export const AboutAppDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CustomButton className="w-full flex items-center gap-2 border border-border bg-surface-elevated hover:bg-surface">
          <Info size={20} />
          О приложении
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-96 overflow-hidden">
        <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        <DialogHeader>
          <DialogTitle>StudyVibe - Инструкция</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <BookOpen size={16} />
              Домашние задания
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>• Просматривайте все домашние задания на главной странице</li>
              <li>• Нажмите "Выполнить" чтобы отметить задание как выполненное</li>
              <li>• Нажмите "Подробнее" чтобы увидеть полное описание</li>
              <li>• Выполненные задания помечаются галочкой</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Search size={16} />
              Поиск
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>• Используйте поиск для быстрого нахождения заданий</li>
              <li>• Можно искать по названию или предмету</li>
              <li>• Введите запрос в строку поиска</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Bell size={16} />
              Уведомления
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>• Нажмите на колокольчик чтобы посмотреть уведомления</li>
              <li>• Получайте важные объявления от преподавателей</li>
              <li>• Непрочитанные уведомления выделены цветом</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <User size={16} />
              Профиль
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>• Просматривайте и редактируйте информацию профиля</li>
              <li>• Меняйте пароль в настройках</li>
              <li>• Выходите из аккаунта при необходимости</li>
            </ul>
          </section>

          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              <strong>Совет:</strong> Регулярно проверяйте домашние задания и отмечайте выполненные, 
              чтобы не пропустить важные сроки!
            </p>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};