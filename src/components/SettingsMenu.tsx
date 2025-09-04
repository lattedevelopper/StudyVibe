import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomButton } from "@/components/ui/custom-button";
import { Settings, User, Bell, Moon, LogOut } from "lucide-react";

export const SettingsMenuDialog = ({ onLogout }: { onLogout?: () => void }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <CustomButton className="w-full flex items-center gap-2 border border-border bg-surface-elevated hover:bg-surface">
          <Settings size={20} />
          Настройки
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <User size={16} />
              Профиль
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>• Изменить имя пользователя и класс</li>
              <li>• Сбросить пароль</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Bell size={16} />
              Уведомления
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>• Включить/выключить уведомления</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Moon size={16} />
              Тема
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>• Переключить светлую/тёмную тему</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <LogOut size={16} />
              Выход
            </h3>
            <ul className="space-y-1 text-text-muted">
              <li>
                • <button
                  className="text-primary underline"
                  onClick={onLogout}
                  type="button"
                >Выйти из аккаунта</button>
              </li>
            </ul>
          </section>

          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              <strong>Совет:</strong> Проверь свои настройки — это поможет сделать использование StudyVibe удобнее!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
