import { useState } from "react";
import { Send } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const NotificationSender = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: ""
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      // Get all user IDs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id");

      if (profilesError) throw profilesError;

      // Create notifications for all users
      const notifications = profiles.map(profile => ({
        title: formData.title,
        message: formData.message,
        user_id: profile.user_id
      }));

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: `Уведомление отправлено ${profiles.length} пользователям`
      });

      setFormData({ title: "", message: "" });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить уведомление",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <CustomButton className="flex items-center gap-2">
          <Send size={20} />
          Отправить уведомление
        </CustomButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Отправить уведомление всем пользователям</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Заголовок уведомления"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Текст уведомления"
              required
            />
          </div>
          
          <CustomButton type="submit" className="w-full" disabled={sending}>
            {sending ? "Отправка..." : "Отправить уведомление"}
          </CustomButton>
        </form>
      </DialogContent>
    </Dialog>
  );
};