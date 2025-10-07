import { useState, useEffect } from "react";
import { Send, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { CustomButton } from "@/components/ui/custom-button";

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
  profile?: Profile;
  replies?: Comment[];
}

interface HomeworkCommentsProps {
  homeworkId: string;
}

export function HomeworkComments({ homeworkId }: HomeworkCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [homeworkId]);

  const loadComments = async () => {
    const { data: commentsData, error } = await supabase
      .from("homework_comments")
      .select("*")
      .eq("homework_id", homeworkId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading comments:", error);
      return;
    }

    if (!commentsData) return;

    // Load profiles for all comment authors
    const userIds = [...new Set(commentsData.map((c) => c.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", userIds);

    const profilesMap = new Map(
      profilesData?.map((p) => [p.user_id, p]) || []
    );

    // Organize comments into tree structure
    const commentsWithProfiles = commentsData.map((comment) => ({
      ...comment,
      profile: profilesMap.get(comment.user_id),
      replies: [] as Comment[],
    }));

    const topLevelComments: Comment[] = [];
    const commentsMap = new Map(
      commentsWithProfiles.map((c) => [c.id, c])
    );

    commentsWithProfiles.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentsMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies!.push(comment);
        }
      } else {
        topLevelComments.push(comment);
      }
    });

    setComments(topLevelComments);
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("homework_comments").insert({
      homework_id: homeworkId,
      user_id: user.id,
      content: newComment.trim(),
      parent_comment_id: null,
    });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить комментарий",
        variant: "destructive",
      });
    } else {
      setNewComment("");
      loadComments();
      toast({
        title: "Успешно",
        description: "Комментарий добавлен",
      });
    }
    setLoading(false);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("homework_comments").insert({
      homework_id: homeworkId,
      user_id: user.id,
      content: replyContent.trim(),
      parent_comment_id: parentId,
    });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить ответ",
        variant: "destructive",
      });
    } else {
      setReplyContent("");
      setReplyingTo(null);
      loadComments();
      toast({
        title: "Успешно",
        description: "Ответ добавлен",
      });
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("homework_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить комментарий",
        variant: "destructive",
      });
    } else {
      loadComments();
      toast({
        title: "Успешно",
        description: "Комментарий удален",
      });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "только что";
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    return date.toLocaleDateString("ru-RU");
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? "ml-12 mt-3" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 border-2 border-primary/20 shrink-0">
          <AvatarImage src={comment.profile?.avatar_url || undefined} />
          <AvatarFallback className="text-sm bg-primary/10 text-primary">
            {getInitials(comment.profile?.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-surface-elevated rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">
                {comment.profile?.full_name || "Пользователь"}
              </span>
              {user?.id === comment.user_id && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-text-muted hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 mt-2 px-4">
            <span className="text-xs text-text-muted">{formatDate(comment.created_at)}</span>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-text-muted hover:text-primary transition-colors"
              >
                Ответить
              </button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 ml-4">
              <div className="flex gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Напишите ответ..."
                  className="resize-none min-h-[60px]"
                  disabled={loading}
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={loading || !replyContent.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    className="p-2 bg-surface-elevated rounded-full hover:bg-muted transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MessageCircle size={20} />
        Комментарии ({comments.length})
      </h2>

      {/* New Comment Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 border-2 border-primary/20 shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {getInitials(user?.user_metadata?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2 flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите комментарий..."
              className="resize-none min-h-[80px]"
              disabled={loading}
            />
            <button
              onClick={handleSubmitComment}
              disabled={loading || !newComment.trim()}
              className="w-20 h-20 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center shrink-0"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p>Пока нет комментариев</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}
