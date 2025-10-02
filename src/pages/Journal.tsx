import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

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

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [entryContent, setEntryContent] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    if (user) {
      loadEntry();
      loadTodos();
    }
  }, [selectedDate, user]);

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
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Журнал</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Выберите дату</label>
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>

        <div className="space-y-6">
          {/* Notes Section */}
          <div className="homework-card">
            <h2 className="text-xl font-semibold mb-4">Заметки</h2>
            <Textarea
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              placeholder="Напишите что-нибудь..."
              className="min-h-[200px] mb-4"
            />
            <Button onClick={saveEntry}>
              Сохранить заметку
            </Button>
          </div>

          {/* To-Do List Section */}
          <div className="homework-card">
            <h2 className="text-xl font-semibold mb-4">Задачи</h2>
            
            <div className="flex gap-2 mb-4">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Новая задача..."
              />
              <Button onClick={addTodo} size="icon">
                <Plus size={20} />
              </Button>
            </div>

            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 bg-surface-elevated border border-border rounded-lg"
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
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}

              {todos.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Нет задач на эту дату
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
