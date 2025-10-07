import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, BookText, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: string;
  entry_date: string;
  content: string | null;
}

interface Todo {
  id: string;
  entry_date: string;
  title: string;
  is_completed: boolean;
}

interface JournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JournalDialog({ open, onOpenChange }: JournalDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [entryContent, setEntryContent] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [activeTab, setActiveTab] = useState<"notes" | "todos">("notes");

  useEffect(() => {
    if (user && open) {
      loadEntry();
      loadTodos();
    }
  }, [selectedDate, user, open]);

  const loadEntry = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", selectedDate)
      .maybeSingle();

    setEntry(data);
    setEntryContent(data?.content || "");
  };

  const loadTodos = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("journal_todos")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", selectedDate)
      .order("created_at", { ascending: true });

    setTodos(data || []);
  };

  const saveEntry = async () => {
    if (!user) return;

    try {
      if (entry) {
        await supabase
          .from("journal_entries")
          .update({ content: entryContent })
          .eq("id", entry.id);
      } else {
        await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            entry_date: selectedDate,
            content: entryContent,
          });
      }

      toast({
        title: "Успешно",
        description: "Заметка сохранена",
      });

      loadEntry();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить заметку",
        variant: "destructive",
      });
    }
  };

  const addTodo = async () => {
    if (!user || !newTodo.trim()) return;

    try {
      await supabase
        .from("journal_todos")
        .insert({
          user_id: user.id,
          entry_date: selectedDate,
          title: newTodo,
        });

      setNewTodo("");
      loadTodos();

      toast({
        title: "Успешно",
        description: "Задача добавлена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить задачу",
        variant: "destructive",
      });
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      await supabase
        .from("journal_todos")
        .update({ is_completed: !todo.is_completed })
        .eq("id", todo.id);

      loadTodos();
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить задачу",
        variant: "destructive",
      });
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await supabase
        .from("journal_todos")
        .delete()
        .eq("id", id);

      loadTodos();

      toast({
        title: "Успешно",
        description: "Задача удалена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задачу",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Журнал</DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Дата</label>
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mb-6">
          <div className="flex gap-2 bg-surface-elevated p-1 rounded-lg relative">
            {/* Animated background */}
            <div
              className={cn(
                "absolute top-1 h-[calc(100%-8px)] bg-primary rounded-md transition-all duration-300 ease-out",
                activeTab === "notes" ? "left-1 w-[calc(50%-4px)]" : "left-[calc(50%+2px)] w-[calc(50%-4px)]"
              )}
            />
            
            <button
              onClick={() => setActiveTab("notes")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors relative z-10 font-medium",
                activeTab === "notes" ? "text-primary-foreground" : "text-foreground hover:text-primary"
              )}
            >
              <BookText size={18} />
              Заметки
            </button>
            
            <button
              onClick={() => setActiveTab("todos")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors relative z-10 font-medium",
                activeTab === "todos" ? "text-primary-foreground" : "text-foreground hover:text-primary"
              )}
            >
              <ListTodo size={18} />
              Задачи
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {activeTab === "notes" && (
            <div className="space-y-4 animate-fade-in">
              <Textarea
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="Ваши мысли и заметки..."
                className="min-h-[300px] resize-none"
              />
              <Button onClick={saveEntry} className="w-full">
                Сохранить заметку
              </Button>
            </div>
          )}

          {activeTab === "todos" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex gap-2">
                <Input
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Новая задача..."
                />
                <Button onClick={addTodo} size="icon" className="shrink-0">
                  <Plus size={20} />
                </Button>
              </div>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 bg-surface-elevated border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() => toggleTodo(todo)}
                    />
                    <span className={`flex-1 ${todo.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="shrink-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}

                {todos.length === 0 && (
                  <div className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-lg">
                    <ListTodo size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Нет задач</p>
                    <p className="text-xs mt-1">Добавьте первую задачу</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}