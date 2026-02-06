import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { getTask, createComment, updateTask } from "../lib/api";
import type { Task } from "./BoardView";

interface TaskDetailModalProps {
  task: Task;
  boardId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskDetailModal({ task, boardId, onClose, onRefresh }: TaskDetailModalProps) {
  const { token } = useAuth();
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || "");

  const { data: taskData, refetch: refetchTask } = useQuery({
    queryKey: ["task", task.id],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const response = await getTask(task.id, token);
      return response.task;
    },
    enabled: !!token,
  });

  const currentTask = taskData || task;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCommentContent.trim()) return;

    setIsAddingComment(true);
    try {
      await createComment(task.id, newCommentContent, token);
      setNewCommentContent("");
      refetchTask();
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!token || editedTitle === task.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateTask(task.id, { title: editedTitle }, token);
      setIsEditingTitle(false);
      refetchTask();
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleSaveDescription = async () => {
    if (!token || editedDescription === (task.description || "")) {
      setIsEditingDescription(false);
      return;
    }

    try {
      await updateTask(task.id, { description: editedDescription }, token);
      setIsEditingDescription(false);
      refetchTask();
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>
          ✕
        </button>

        <div style={styles.content}>
          {isEditingTitle ? (
            <div style={styles.editGroup}>
              <input
                autoFocus
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                style={styles.editInput}
              />
              <div style={styles.editActions}>
                <button onClick={handleSaveTitle} style={styles.saveButton}>
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(task.title);
                    setIsEditingTitle(false);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <h2
              style={styles.title}
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit"
            >
              {currentTask.title}
            </h2>
          )}

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Description</h3>
            {isEditingDescription ? (
              <div style={styles.editGroup}>
                <textarea
                  autoFocus
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  style={{ ...styles.editInput, minHeight: "80px" }}
                />
                <div style={styles.editActions}>
                  <button onClick={handleSaveDescription} style={styles.saveButton}>
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedDescription(task.description || "");
                      setIsEditingDescription(false);
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                style={{
                  ...styles.description,
                  cursor: "pointer",
                  backgroundColor: "#f9f9f9",
                  padding: "8px",
                  borderRadius: "4px",
                }}
                onClick={() => setIsEditingDescription(true)}
                title="Click to edit"
              >
                {currentTask.description || "(No description)"}
              </p>
            )}
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              Comments ({currentTask.comments.length})
            </h3>

            <div style={styles.commentsList}>
              {currentTask.comments.map((comment) => (
                <div key={comment.id} style={styles.comment}>
                  <strong style={styles.commentAuthor}>{comment.user.name}</strong>
                  <p style={styles.commentContent}>{comment.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} style={styles.commentForm}>
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Add a comment..."
                style={styles.commentInput}
                disabled={isAddingComment}
              />
              <button
                type="submit"
                style={{
                  ...styles.commentButton,
                  opacity: isAddingComment || !newCommentContent.trim() ? 0.6 : 1,
                  cursor: isAddingComment || !newCommentContent.trim() ? "not-allowed" : "pointer",
                }}
                disabled={isAddingComment || !newCommentContent.trim()}
              >
                {isAddingComment ? "Adding..." : "Add comment"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "4px 8px",
    fontSize: "20px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#999",
  },
  content: {
    padding: "24px",
  },
  title: {
    margin: "0 0 16px 0",
    fontSize: "20px",
    fontWeight: 600,
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#333",
  },
  description: {
    margin: 0,
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.5",
  },
  editGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  editInput: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  editActions: {
    display: "flex",
    gap: "8px",
  },
  saveButton: {
    flex: 1,
    padding: "6px 12px",
    fontSize: "13px",
    backgroundColor: "#00aa00",
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  cancelButton: {
    flex: 1,
    padding: "6px 12px",
    fontSize: "13px",
    backgroundColor: "#999",
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  commentsList: {
    marginBottom: "12px",
  },
  comment: {
    padding: "8px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    marginBottom: "8px",
  },
  commentAuthor: {
    fontSize: "13px",
  },
  commentContent: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "#333",
    lineHeight: "1.4",
  },
  commentForm: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  commentInput: {
    padding: "8px 12px",
    fontSize: "13px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
    minHeight: "60px",
  },
  commentButton: {
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 600,
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
};
