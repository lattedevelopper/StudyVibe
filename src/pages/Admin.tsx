import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Calendar, BookOpen } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NotificationSender } from "@/components/admin/notification-sender";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Homework {
  id: string;
  title: string;
  subject: string;
  description: string;
  due_date: string;
}

export default function Admin() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    due_date: ""
  });
  const [passwordDialog, setPasswordDialog] = useState(true);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handlePasswordSubmit = () => {
    if (password === "1467") {
      setPasswordDialog(false);
      loadHomework();
    } else {
      toast({
        title: "Неверный пароль",
        description: "Доступ запрещен",
        variant: "destructive"
      });
    }
  };

  const loadHomework = async () => {
    const { data, error } = await supabase
      .from("homework")
      .select("*")
      .order("due_date", { ascending: true });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить домашние задания",
        variant: "destructive"
      });
    } else {
      setHomework(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingHomework) {
        const { error } = await supabase
          .from("homework")
          .update(formData)
          .eq("id", editingHomework.id);
        
        if (error) throw error;
        
        toast({
          title: "Успешно",
          description: "Домашнее задание обновлено"
        });
      } else {
        const { error } = await supabase
          .from("homework")
          .insert([formData]);
        
        if (error) throw error;
        
        toast({
          title: "Успешно",
          description: "Домашнее задание добавлено"
        });
      }
      
      setIsDialogOpen(false);
      setEditingHomework(null);
      setFormData({ title: "", subject: "", description: "", due_date: "" });
      loadHomework();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить домашнее задание",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (hw: Homework) => {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      subject: hw.subject,
      description: hw.description,
      due_date: hw.due_date.split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить это задание?")) return;
    
    const { error } = await supabase
      .from("homework")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить домашнее задание",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Успешно",
        description: "Домашнее задание удалено"
      });
      loadHomework();
    }
  };

  if (passwordDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-background" />
            </div>
            <h1 className="text-2xl font-bold">Админ панель StudyVibe</h1>
            <p className="text-text-muted mt-2">Введите пароль для доступа</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
            </div>
            <CustomButton onClick={handlePasswordSubmit} className="w-full">
              Войти
            </CustomButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Админ панель StudyVibe</h1>
            <p className="text-text-muted">Управление домашними заданиями</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <CustomButton 
                  onClick={() => {
                    setEditingHomework(null);
                    setFormData({ title: "", subject: "", description: "", due_date: "" });
                  }}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Plus size={20} />
                  Добавить ДЗ
                </CustomButton>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingHomework ? "Редактировать задание" : "Добавить задание"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Предмет</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_date">Дата сдачи</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                  />
                </div>
                
                <CustomButton type="submit" className="w-full">
                  {editingHomework ? "Обновить" : "Добавить"}
                </CustomButton>
              </form>
            </DialogContent>
          </Dialog>
          
          <NotificationSender />
          </div>
        </div>

        <div className="grid gap-4">
          {homework.map((hw) => (
            <div key={hw.id} className="homework-card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-primary">{hw.subject}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2 break-words">{hw.title}</h3>
                  <p className="text-text-muted text-sm mb-4 break-words">{hw.description}</p>
                  <div className="flex items-center gap-1 text-sm text-text-muted">
                    <Calendar size={14} />
                    <span>{new Date(hw.due_date).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(hw)}
                    className="p-2 text-text-muted hover:text-foreground transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(hw.id)}
                    className="p-2 text-text-muted hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}