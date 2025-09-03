import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { Loader } from "@/components/ui/loader";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-background" />
          </div>
          <h1 className="text-2xl font-bold">Добро пожаловать</h1>
          <p className="text-text-muted mt-2">Войдите в свой аккаунт</p>
        </div>

        {/* Auth Notice */}
        <div className="homework-card mb-6 border-primary/20">
          <div className="text-center">
            <h3 className="font-bold text-primary mb-2">Требуется Supabase</h3>
            <p className="text-sm text-text-muted mb-4">
              Для работы с регистрацией и SQL базой данных необходимо подключить Supabase интеграцию
            </p>
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-xs text-primary">
                Нажмите зеленую кнопку Supabase в правом верхнем углу интерфейса
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl 
                       text-foreground placeholder-text-muted focus:outline-none focus:ring-2 
                       focus:ring-primary focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl 
                         text-foreground placeholder-text-muted focus:outline-none focus:ring-2 
                         focus:ring-primary focus:border-transparent pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <CustomButton 
            type="submit" 
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader className="scale-50" /> : "Войти"}
          </CustomButton>
        </form>

        <div className="text-center mt-6">
          <p className="text-text-muted">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}