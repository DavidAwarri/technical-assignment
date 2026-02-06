import { useState } from "react";
import type { Column, Task } from "./BoardViewModern";
import { colors, spacing, radius, shadows } from "../lib/styles";

interface ColumnProps {
  column: Column;
  onCreateTask: (title: string) => void;
  onSelectTask: (taskId: string) => void;
  onMoveTask: (taskId: string, columnId: string, position: number) => void;
  onDeleteTask: (taskId: string) => void;
  onEditColumn: (newTitle: string) => void;
  onDeleteColumn: () => void;
  draggedTaskData?: { taskId: string; sourceColumnId: string } | null;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: () => void;
}

export function ColumnComponent({
  column,
  onCreateTask,
  onSelectTask,
  onMoveTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
  draggedTaskData,
  onDragStart,
  onDragEnd,
}: ColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

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

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== column.title) {
      onEditColumn(editedTitle);
    }
    setIsEditingTitle(false);
    setEditedTitle(column.title);
  };

  const handleDragStart = (taskId: string) => {
    onDragStart?.(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTaskData) {
      e.currentTarget.style.backgroundColor = colors.bgTertiary;
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.style.backgroundColor = "transparent";
  };

  const handleDrop = (e: React.DragEvent, targetTaskId?: string) => {
    e.preventDefault();
    e.currentTarget.style.backgroundColor = "transparent";

    if (!draggedTaskData) return;

    const targetPosition = targetTaskId
      ? column.tasks.findIndex((t) => t.id === targetTaskId)
      : column.tasks.length;

    onMoveTask(draggedTaskData.taskId, column.id, targetPosition);
    onDragEnd?.();
  };

  const styles = {
    column: {
      minWidth: "320px",
      backgroundColor: colors.bgSecondary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      display: "flex",
      flexDirection: "column" as const,
      height: "fit-content",
      maxHeight: "calc(100vh - 200px)",
      overflow: "hidden",
      boxShadow: shadows.md,
    },
    columnHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: colors.bgTertiary,
    },
    columnTitleContainer: {
      flex: 1,
    },
    columnTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: colors.textPrimary,
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
    },
    taskCount: {
      fontSize: "12px",
      color: colors.textMuted,
      fontWeight: 400,
    },
    columnActions: {
      display: "flex",
      gap: spacing.xs,
    },
    iconButton: {
      background: "none",
      border: "none",
      color: colors.textMuted,
      cursor: "pointer",
      padding: spacing.xs,
      fontSize: "16px",
      transition: `color 0.2s`,
    },
    titleInput: {
      flex: 1,
      padding: `${spacing.xs} ${spacing.sm}`,
      backgroundColor: colors.bgSecondary,
      border: `1px solid ${colors.primary}`,
      borderRadius: radius.md,
      color: colors.textPrimary,
      fontSize: "16px",
    },
    taskList: {
      flex: 1,
      overflow: "auto",
      padding: spacing.md,
      display: "flex",
      flexDirection: "column" as const,
      gap: spacing.md,
    },
    taskCard: {
      backgroundColor: colors.bgPrimary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      padding: spacing.md,
      cursor: "grab",
      transition: `all 0.2s`,
      position: "relative" as const,
    },
    taskTitle: {
      margin: 0,
      fontSize: "14px",
      color: colors.textPrimary,
      fontWeight: 500,
      marginBottom: spacing.xs,
    },
    taskDescription: {
      fontSize: "12px",
      color: colors.textMuted,
      margin: 0,
    },
    taskDeleteButton: {
      position: "absolute" as const,
      top: spacing.xs,
      right: spacing.xs,
      background: "none",
      border: "none",
      color: colors.textMuted,
      cursor: "pointer",
      opacity: 0,
      transition: `opacity 0.2s`,
    },
    addTaskForm: {
      display: "flex",
      gap: spacing.sm,
      padding: spacing.md,
      borderTop: `1px solid ${colors.border}`,
    },
    addTaskInput: {
      flex: 1,
      padding: `${spacing.xs} ${spacing.sm}`,
      backgroundColor: colors.bgPrimary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      color: colors.textPrimary,
      fontSize: "13px",
    },
    addTaskButton: {
      padding: `${spacing.xs} ${spacing.sm}`,
      backgroundColor: colors.primary,
      color: colors.textPrimary,
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "13px",
      transition: `all 0.2s`,
    },
  };

  return (
    <div style={styles.column}>
      <div style={styles.columnHeader}>
        {isEditingTitle ? (
          <input
            autoFocus
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") {
                setIsEditingTitle(false);
                setEditedTitle(column.title);
              }
            }}
            style={styles.titleInput}
          />
        ) : (
          <div style={styles.columnTitleContainer}>
            <h3
              style={styles.columnTitle}
              onDoubleClick={() => setIsEditingTitle(true)}
              title="Double-click to edit"
            >
              {column.title}
              <span style={styles.taskCount}>({column.tasks.length})</span>
            </h3>
          </div>
        )}
        <div style={styles.columnActions}>
          <button
            onClick={() => setIsEditingTitle(!isEditingTitle)}
            style={styles.iconButton}
            title="Edit column"
            onMouseOver={(e) => (e.currentTarget.style.color = colors.primary)}
            onMouseOut={(e) => (e.currentTarget.style.color = colors.textMuted)}
          >
            ✏️
          </button>
          <button
            onClick={onDeleteColumn}
            style={styles.iconButton}
            title="Delete column"
            onMouseOver={(e) => (e.currentTarget.style.color = colors.danger)}
            onMouseOut={(e) => (e.currentTarget.style.color = colors.textMuted)}
          >
            🗑️
          </button>
        </div>
      </div>

      <div
        style={styles.taskList}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
      >
        {column.tasks.map((task) => (
          <div
            key={task.id}
            style={styles.taskCard}
            draggable
            onDragStart={() => handleDragStart(task.id)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, task.id)}
            onClick={() => onSelectTask(task.id)}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgTertiary;
              const deleteBtn = e.currentTarget.querySelector('[data-delete-btn]') as HTMLElement;
              if (deleteBtn) deleteBtn.style.opacity = "1";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgPrimary;
              const deleteBtn = e.currentTarget.querySelector('[data-delete-btn]') as HTMLElement;
              if (deleteBtn) deleteBtn.style.opacity = "0";
            }}
          >
            <h4 style={styles.taskTitle}>{task.title}</h4>
            {task.description && <p style={styles.taskDescription}>{task.description}</p>}
            <button
              data-delete-btn
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask(task.id);
              }}
              style={styles.taskDeleteButton}
              title="Delete task"
              onMouseOver={(e) => (e.currentTarget.style.color = colors.danger)}
              onMouseOut={(e) => (e.currentTarget.style.color = colors.textMuted)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreateTask} style={styles.addTaskForm}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add task..."
          style={styles.addTaskInput}
          disabled={isCreating}
        />
        <button
          type="submit"
          disabled={isCreating || !newTaskTitle.trim()}
          style={{
            ...styles.addTaskButton,
            opacity: isCreating || !newTaskTitle.trim() ? 0.6 : 1,
          }}
          onMouseOver={(e) => !isCreating && (e.currentTarget.style.backgroundColor = colors.primaryDark)}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
        >
          +
        </button>
      </form>
    </div>
  );
}
