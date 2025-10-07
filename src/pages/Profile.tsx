import { useState, useEffect, useRef } from "react";
import { Settings, LogOut, Camera, Edit2, Check, X, BarChart3, Calendar, BookOpen, Shield } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loading, setLoading] = useState(true);
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

    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setEditedName(data.full_name || "");
    }
    setLoading(false);
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
    <div className="min-h-screen pb-20 px-4 pt-6 bg-gradient-to-b from-background to-surface">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Профиль</h1>

        {loading ? (
          <div className="homework-card mb-6 space-y-6">
            <div className="flex flex-col items-center mb-6">
              <Skeleton className="w-32 h-32 rounded-full" />
            </div>
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-4 w-40 mx-auto" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </div>
        ) : (
          <div className="homework-card mb-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Avatar" />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Camera size={20} className="text-primary-foreground" />
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
          <div className="text-center mb-6">
            {isEditingName ? (
              <div className="flex items-center justify-center gap-2 mb-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="max-w-xs text-center text-xl font-bold"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={handleNameCancel}
                  className="p-2 rounded-lg bg-muted hover:bg-muted/80"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">
                  {profile?.full_name || "Имя не указано"}
                </h2>
                <button
                  onClick={handleNameEdit}
                  className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            )}
            <p className="text-text-muted">
              {profile?.class_name ? `Класс ${profile.class_name}` : "Класс не указан"}
            </p>
            <p className="text-sm text-text-muted mt-1">{user.email}</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <CustomButton
              onClick={() => navigate("/statistics")}
              className="flex flex-col items-center gap-2 py-6 group"
            >
              <BarChart3 size={24} className="text-primary-foreground transition-colors" />
              <span className="text-sm">Статистика</span>
            </CustomButton>

            <CustomButton
              onClick={() => navigate("/journal")}
              className="flex flex-col items-center gap-2 py-6 group"
            >
              <BookOpen size={24} className="text-primary-foreground transition-colors" />
              <span className="text-sm">Журнал</span>
            </CustomButton>

            <CustomButton
              onClick={() => navigate("/schedule")}
              className="flex flex-col items-center gap-2 py-6 group"
            >
              <Calendar size={24} className="text-primary-foreground transition-colors" />
              <span className="text-sm">Расписание</span>
            </CustomButton>

            <CustomButton
              onClick={() => navigate("/admin")}
              className="flex flex-col items-center gap-2 py-6 group"
            >
              <Shield size={24} className="text-primary-foreground transition-colors" />
              <span className="text-sm">Админ</span>
            </CustomButton>
          </div>

          {/* Settings & Logout */}
          <div className="space-y-3 pt-4 border-t border-border">
            <CustomButton
              className="w-full flex items-center gap-2 justify-center"
              onClick={() => navigate("/settings")}
            >
              <Settings size={20} />
              Настройки
            </CustomButton>

            <CustomButton
              onClick={() => setLogoutDialogOpen(true)}
              className="w-full flex items-center gap-2 justify-center border-destructive/50 hover:bg-destructive/10"
            >
              <LogOut size={20} />
              Выйти из аккаунта
            </CustomButton>
          </div>
        </div>
        )}
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
