import { useState, useEffect } from "react";
import { Plus, Trash2, BookText, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: string;
  content: string | null;
  created_at: string;
}

interface Todo {
  id: string;
  title: string;
  is_completed: boolean;
}

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"notes" | "todos">("notes");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entryContent, setEntryContent] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    if (user) {
      loadEntries();
      loadTodos();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setEntries(data || []);
  };

  const loadTodos = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("journal_todos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setTodos(data || []);
  };

  const saveEntry = async () => {
    if (!user || !entryContent.trim()) return;

    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      await supabase
        .from("journal_entries")
        .insert({
          user_id: user.id,
          entry_date: currentDate,
          content: entryContent,
        });

      setEntryContent("");
      toast({
        title: "Успешно",
        description: "Заметка добавлена",
      });

      loadEntries();
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
      const currentDate = new Date().toISOString().split('T')[0];
      
      await supabase
        .from("journal_todos")
        .insert({
          user_id: user.id,
          entry_date: currentDate,
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

  const deleteEntry = async (id: string) => {
    try {
      await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);

      loadEntries();

      toast({
        title: "Успешно",
        description: "Заметка удалена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заметку",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Журнал</h1>

        {/* Tabs */}
        <div className="relative mb-6">
          <div className="flex gap-2 bg-surface-elevated p-1 rounded-lg relative">
            {/* Sliding background */}
            <div 
              className={cn(
                "absolute h-[calc(100%-8px)] w-[calc(50%-8px)] bg-primary rounded-md transition-transform duration-300 ease-out top-1",
                activeTab === "notes" ? "translate-x-1" : "translate-x-[calc(100%+8px)]"
              )}
            />
            
            {/* Tab buttons */}
            <button
              onClick={() => setActiveTab("notes")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors duration-300 relative z-10",
                activeTab === "notes" ? "text-primary-foreground" : "text-text-muted hover:text-foreground"
              )}
            >
              <BookText size={20} />
              <span className="font-medium">Заметки</span>
            </button>
            
            <button
              onClick={() => setActiveTab("todos")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-colors duration-300 relative z-10",
                activeTab === "todos" ? "text-primary-foreground" : "text-text-muted hover:text-foreground"
              )}
            >
              <ListTodo size={20} />
              <span className="font-medium">Задачи</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "notes" ? (
            <>
              {/* Add Note Section */}
              <div className="homework-card">
                <h3 className="text-lg font-semibold mb-3">Новая заметка</h3>
                <Textarea
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  placeholder="Напишите что-нибудь..."
                  className="min-h-[150px] mb-3"
                />
                <Button onClick={saveEntry}>
                  Добавить заметку
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry.id} className="homework-card">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm text-text-muted">
                        {new Date(entry.created_at).toLocaleString('ru-RU')}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteEntry(entry.id)}
                        className="h-8 w-8"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}

                {entries.length === 0 && (
                  <div className="text-center py-12">
                    <BookText size={48} className="mx-auto text-text-muted mb-4" />
                    <p className="text-text-muted">Нет заметок</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Add Todo Section */}
              <div className="homework-card">
                <h3 className="text-lg font-semibold mb-3">Новая задача</h3>
                <div className="flex gap-2">
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
              </div>

              {/* Todos List */}
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 homework-card"
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
                  <div className="text-center py-12">
                    <ListTodo size={48} className="mx-auto text-text-muted mb-4" />
                    <p className="text-text-muted">Нет задач</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
