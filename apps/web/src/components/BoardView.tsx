import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getBoard, createColumn, createTask, updateTask, deleteTask } from "../lib/api";
import { ColumnComponent } from "./Column";
import { TaskDetailModal } from "./TaskDetailModal";
import { Spinner } from "./Spinner";

interface BoardViewProps {
  boardId: string;
  boardTitle: string;
  onBack: () => void;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  position: number;
  comments: Array<{ id: string; content: string; user: { name: string } }>;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
}

export function BoardView({ boardId, boardTitle, onBack }: BoardViewProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [draggedTaskData, setDraggedTaskData] = useState<{ taskId: string; sourceColumnId: string } | null>(null);

  const { data: boardData, isLoading } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const response = await getBoard(boardId, token);
      return response.board;
    },
    enabled: !!token && !!boardId,
  });

  const columns: Column[] = boardData?.columns || [];

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newColumnTitle.trim()) return;

    setIsCreatingColumn(true);
    try {
      await createColumn(boardId, newColumnTitle, token);
      setNewColumnTitle("");
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Column created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create column");
    } finally {
      setIsCreatingColumn(false);
    }
  };

  const handleCreateTask = async (columnId: string, title: string) => {
    if (!token || !title.trim()) return;

    try {
      await createTask(boardId, title, columnId, "", token);
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleMoveTask = async (taskId: string, newColumnId: string, position: number) => {
    if (!token) return;

    try {
      await updateTask(taskId, { columnId: newColumnId, position }, token);
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task moved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!token) return;
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      await deleteTask(taskId, token);
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const selectedTask = columns
    .flatMap((col) => col.tasks)
    .find((task) => task.id === selectedTaskId);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backButton}>
            ← Back
          </button>
          <h1 style={styles.title}>{boardTitle}</h1>
        </div>
      </header>

      <main style={styles.main}>
        {isLoading ? (
          <Spinner />
        ) : (
          <div style={styles.boardContainer}>
            {columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                onCreateTask={(title) => handleCreateTask(column.id, title)}
                onSelectTask={(taskId) => setSelectedTaskId(taskId)}
                onMoveTask={handleMoveTask}
                onDeleteTask={handleDeleteTask}
                draggedTaskData={draggedTaskData}
                onDragStart={(taskId) => setDraggedTaskData({ taskId, sourceColumnId: column.id })}
                onDragEnd={() => setDraggedTaskData(null)}
              />
            ))}

            <div style={styles.addColumnSection}>
              <form onSubmit={handleCreateColumn} style={styles.addColumnForm}>
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="New column..."
                  style={styles.addColumnInput}
                  disabled={isCreatingColumn}
                />
                <button
                  type="submit"
                  style={{
                    ...styles.addColumnButton,
                    opacity: isCreatingColumn || !newColumnTitle.trim() ? 0.6 : 1,
                    cursor: isCreatingColumn || !newColumnTitle.trim() ? "not-allowed" : "pointer",
                  }}
                  disabled={isCreatingColumn || !newColumnTitle.trim()}
                >
                  {isCreatingColumn ? "..." : "+"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          boardId={boardId}
          onClose={() => setSelectedTaskId(null)}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    borderBottom: "1px solid #ddd",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  backButton: {
    padding: "6px 12px",
    fontSize: "14px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
  },
  main: {
    padding: "24px",
    overflow: "auto",
  },
  boardContainer: {
    display: "flex",
    gap: "16px",
    minHeight: "calc(100vh - 100px)",
  },
  addColumnSection: {
    minWidth: "272px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #ddd",
    padding: "12px",
  },
  addColumnForm: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  addColumnInput: {
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  addColumnButton: {
    padding: "8px",
    fontSize: "16px",
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
};
