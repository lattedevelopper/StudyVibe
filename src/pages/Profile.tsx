import { useState, useEffect, useRef } from "react";
import { User, Settings, LogOut, Camera, Edit2, Check, X } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  id: string;
  full_name: string | null;
  class_name: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setEditedName(data.full_name || "");
    }
  };

  const handleSignOut = async () => {
    setLogoutDialogOpen(false);
    await signOut();
    navigate("/login");
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
  };

  const handleNameSave = async () => {
    if (!user || !editedName.trim()) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editedName.trim() })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить имя",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Успешно",
        description: "Имя обновлено",
      });
      setIsEditingName(false);
      loadProfile();
    }
  };

  const handleNameCancel = () => {
    setEditedName(profile?.full_name || "");
    setIsEditingName(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    setUploading(true);

    try {
      // Upload image
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast({
        title: "Успешно",
        description: "Аватар обновлен",
      });

      loadProfile();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аватар",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 bg-background">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Профиль
        </h1>

        {/* Profile Card */}
        <div className="homework-card mb-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-primary/20 shadow-md">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-11 h-11 bg-primary rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-50 border-4 border-background"
              >
                <Camera size={18} className="text-primary-foreground" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Name Section */}
          <div className="text-center mb-8">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="max-w-xs text-center text-xl font-bold border-2"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-95 shadow-sm"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={handleNameCancel}
                  className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-95 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-3">
                <h2 className="text-2xl font-bold">
                  {profile?.full_name || "Имя не указано"}
                </h2>
                <button
                  onClick={handleNameEdit}
                  className="p-2 rounded-xl hover:bg-surface-elevated transition-all active:scale-95"
                >
                  <Edit2 size={18} className="text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-text-muted font-medium">
              {profile?.class_name ? `Класс ${profile.class_name}` : "Класс не указан"}
            </p>
            <p className="text-sm text-text-muted mt-1.5">{user.email}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <CustomButton
              onClick={() => navigate("/statistics")}
              className="flex flex-col items-center gap-3 py-7"
            >
              <div className="text-3xl">📊</div>
              <span className="text-sm font-semibold">Статистика</span>
            </CustomButton>

            <CustomButton
              onClick={() => navigate("/journal")}
              className="flex flex-col items-center gap-3 py-7"
            >
              <div className="text-3xl">📖</div>
              <span className="text-sm font-semibold">Журнал</span>
            </CustomButton>

            <CustomButton
              onClick={() => navigate("/schedule")}
              className="flex flex-col items-center gap-3 py-7"
            >
              <div className="text-3xl">📅</div>
              <span className="text-sm font-semibold">Расписание</span>
            </CustomButton>

            <CustomButton
              onClick={() => navigate("/settings")}
              className="flex flex-col items-center gap-3 py-7"
            >
              <div className="text-3xl">⚙️</div>
              <span className="text-sm font-semibold">Настройки</span>
            </CustomButton>
          </div>

          {/* Logout */}
          <div className="pt-4 border-t border-border">
            <CustomButton
              onClick={() => setLogoutDialogOpen(true)}
              className="w-full flex items-center gap-2 justify-center bg-destructive/10 border-destructive/20 hover:bg-destructive/20 text-destructive"
            >
              <LogOut size={20} />
              <span className="font-semibold">Выйти из аккаунта</span>
            </CustomButton>
          </div>
        </div>
      </div>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите выйти из аккаунта?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Выйти</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
