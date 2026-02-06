import { useState } from "react";
import type { Column, Task } from "./BoardView";

interface ColumnProps {
  column: Column;
  onCreateTask: (title: string) => void;
  onSelectTask: (taskId: string) => void;
  onMoveTask: (taskId: string, columnId: string, position: number) => void;
  onDeleteTask: (taskId: string) => void;
}

export function ColumnComponent({
  column,
  onCreateTask,
  onSelectTask,
  onMoveTask,
  onDeleteTask,
}: ColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);
    try {
      onCreateTask(newTaskTitle);
      setNewTaskTitle("");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "#f0f0f0";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.style.backgroundColor = "transparent";
  };

  const handleDrop = (e: React.DragEvent, targetTaskId?: string) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "transparent";

    if (!draggedTaskId) return;

    const targetPosition = targetTaskId
      ? column.tasks.findIndex((t) => t.id === targetTaskId)
      : column.tasks.length;

    onMoveTask(draggedTaskId, column.id, targetPosition);
    setDraggedTaskId(null);
  };

  return (
    <div style={styles.column}>
      <h2 style={styles.columnTitle}>
        {column.title}
        <span style={styles.taskCount}>({column.tasks.length})</span>
      </h2>

      <div
        style={styles.taskList}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
      >
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onSelect={() => onSelectTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onDragStart={() => handleDragStart(task.id)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, task.id)}
          />
        ))}
      </div>

      <form onSubmit={handleCreateTask} style={styles.addTaskForm}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a card..."
          style={styles.addTaskInput}
          disabled={isCreating}
        />
        <button
          type="submit"
          style={{
            ...styles.addTaskButton,
            opacity: isCreating || !newTaskTitle.trim() ? 0.6 : 1,
            cursor: isCreating || !newTaskTitle.trim() ? "not-allowed" : "pointer",
          }}
          disabled={isCreating || !newTaskTitle.trim()}
        >
          {isCreating ? "..." : "+"}
        </button>
      </form>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

function TaskCard({
  task,
  onSelect,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: TaskCardProps) {
  return (
    <div
      style={styles.taskCard}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div style={styles.taskCardContent}>
        <p style={styles.taskTitle}>{task.title}</p>
        {task.description && <p style={styles.taskDescription}>{task.description}</p>}
        {task.comments.length > 0 && (
          <div style={styles.taskMeta}>
            💬 {task.comments.length} comment{task.comments.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
      <div style={styles.taskActions}>
        <button onClick={onSelect} style={styles.taskActionButton}>
          Open
        </button>
        <button
          onClick={onDelete}
          style={{
            ...styles.taskActionButton,
            backgroundColor: "#cc0000",
            fontSize: "12px",
          }}
        >
          X
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  column: {
    minWidth: "272px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #ddd",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
  },
  columnTitle: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#333",
  },
  taskCount: {
    fontSize: "12px",
    color: "#999",
    fontWeight: "normal",
    marginLeft: "4px",
  },
  taskList: {
    flex: 1,
    overflowY: "auto",
    minHeight: "100px",
    marginBottom: "12px",
    borderRadius: "4px",
  },
  taskCard: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #eee",
    borderRadius: "4px",
    padding: "12px",
    marginBottom: "8px",
    cursor: "grab",
  },
  taskCardContent: {
    marginBottom: "8px",
  },
  taskTitle: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "1.4",
  },
  taskDescription: {
    margin: "0 0 4px 0",
    fontSize: "12px",
    color: "#666",
  },
  taskMeta: {
    margin: 0,
    fontSize: "12px",
    color: "#999",
  },
  taskActions: {
    display: "flex",
    gap: "4px",
  },
  taskActionButton: {
    flex: 1,
    padding: "4px 8px",
    fontSize: "11px",
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },
  addTaskForm: {
    display: "flex",
    gap: "4px",
  },
  addTaskInput: {
    flex: 1,
    padding: "6px 8px",
    fontSize: "12px",
    border: "1px solid #ddd",
    borderRadius: "3px",
    fontFamily: "inherit",
  },
  addTaskButton: {
    padding: "6px 8px",
    fontSize: "14px",
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "3px",
  },
};
