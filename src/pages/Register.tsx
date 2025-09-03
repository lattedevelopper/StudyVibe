import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    class: "",
    password: ""
  });
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name, formData.class);
      
      if (error) {
        toast({
          title: "Ошибка регистрации",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Регистрация успешна",
          description: "Проверьте почту для подтверждения аккаунта"
        });
        navigate("/login");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла неожиданная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} className="text-background" />
          </div>
          <h1 className="text-2xl font-bold">Создать аккаунт StudyVibe</h1>
          <p className="text-text-muted mt-2">Зарегистрируйтесь для начала</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Имя</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl 
                       text-foreground placeholder-text-muted focus:outline-none focus:ring-2 
                       focus:ring-primary focus:border-transparent"
              placeholder="Ваше имя"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl 
                       text-foreground placeholder-text-muted focus:outline-none focus:ring-2 
                       focus:ring-primary focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Класс</label>
            <select
              required
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl 
                       text-foreground focus:outline-none focus:ring-2 
                       focus:ring-primary focus:border-transparent"
            >
              <option value="">Выберите класс</option>
              <option value="9">9 класс</option>
              <option value="10">10 класс</option>
              <option value="11">11 класс</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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
            {isLoading ? <Loader className="scale-50" /> : "Зарегистрироваться"}
          </CustomButton>
        </form>

        <div className="text-center mt-6">
          <p className="text-text-muted">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}