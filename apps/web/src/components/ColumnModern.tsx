import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import type { Column, Task } from "./BoardViewModern";
import { colors, spacing, radius } from "../lib/styles";

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
      (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgPrimary;
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
  };

  const handleDrop = (e: React.DragEvent, targetTaskId?: string) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";

    if (!draggedTaskData) return;

    const targetPosition = targetTaskId
      ? column.tasks.findIndex((t) => t.id === targetTaskId)
      : column.tasks.length;

    onMoveTask(draggedTaskData.taskId, column.id, targetPosition);
    onDragEnd?.();
  };

  const styles = {
    column: {
      display: "flex",
      flexDirection: "column" as const,
      height: "100%",
      minHeight: "calc(100vh - 180px)",
      width: "360px",
      minWidth: "360px",
      backgroundColor: colors.bgSecondary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      overflow: "hidden",
      transition: `all 0.2s`,
    },
    columnHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.md,
      borderBottom: `1px solid ${colors.border}`,
      backgroundColor: colors.bgTertiary,
      flexShrink: 0,
      gap: spacing.sm,
    },
    columnTitleContainer: {
      flex: 1,
      minWidth: 0,
    },
    columnTitle: {
      fontSize: "15px",
      fontWeight: 600,
      color: colors.textPrimary,
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: spacing.xs,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap" as const,
    },
    taskCount: {
      fontSize: "12px",
      color: colors.textMuted,
      fontWeight: 400,
      flexShrink: 0,
    },
    columnActions: {
      display: "flex",
      gap: spacing.xs,
      flexShrink: 0,
    },
    iconButton: {
      background: "none",
      border: "none",
      color: colors.textMuted,
      cursor: "pointer",
      padding: `4px 6px`,
      fontSize: "16px",
      transition: `color 0.2s`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.sm,
    },
    titleInput: {
      flex: 1,
      padding: `${spacing.xs} ${spacing.sm}`,
      backgroundColor: colors.bgSecondary,
      border: `1px solid ${colors.primary}`,
      borderRadius: radius.md,
      color: colors.textPrimary,
      fontSize: "15px",
      fontWeight: 600,
    },
    addTaskForm: {
      display: "flex",
      gap: spacing.sm,
      padding: spacing.md,
      borderBottom: `1px solid ${colors.border}`,
      flexShrink: 0,
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
      padding: `${spacing.xs} ${spacing.md}`,
      backgroundColor: colors.primary,
      color: "white",
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "13px",
      transition: `all 0.2s`,
      display: "flex",
      alignItems: "center",
      gap: spacing.xs,
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
      flexShrink: 0,
      userSelect: "none" as const,
    },
    taskTitle: {
      margin: 0,
      fontSize: "14px",
      color: colors.textPrimary,
      fontWeight: 500,
      marginBottom: spacing.xs,
      paddingRight: "24px",
      wordBreak: "break-word" as const,
    },
    taskDescription: {
      fontSize: "12px",
      color: colors.textMuted,
      margin: 0,
      wordBreak: "break-word" as const,
    },
    taskDeleteButton: {
      position: "absolute" as const,
      top: "8px",
      right: "8px",
      background: "none",
      border: "none",
      color: colors.textMuted,
      cursor: "pointer",
      opacity: 0,
      transition: `opacity 0.2s`,
      padding: "2px 4px",
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      borderRadius: radius.sm,
    },
    emptyState: {
      fontSize: "13px",
      color: colors.textMuted,
      textAlign: "center" as const,
      padding: spacing.lg,
    },
  };

  return (
    <div style={styles.column}>
      {/* Column Header with Edit/Delete */}
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
            <h3 style={styles.columnTitle}>
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
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.primary)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={onDeleteColumn}
            style={styles.iconButton}
            title="Delete column"
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.danger)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Add Task Form at Top */}
      <form onSubmit={handleCreateTask} style={styles.addTaskForm}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add task..."
          style={styles.addTaskInput}
          disabled={isCreating}
          onFocus={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = colors.primary;
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLInputElement).style.borderColor = colors.border;
          }}
        />
        <button
          type="submit"
          disabled={isCreating || !newTaskTitle.trim()}
          style={{
            ...styles.addTaskButton,
            opacity: isCreating || !newTaskTitle.trim() ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isCreating && newTaskTitle.trim()) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primaryDark;
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primary;
          }}
        >
          <FiPlus size={14} />
        </button>
      </form>

      {/* Tasks Container - Scrollable */}
      <div
        style={styles.taskList}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e)}
      >
        {column.tasks.length === 0 ? (
          <div style={styles.emptyState}>No tasks yet</div>
        ) : (
          column.tasks.map((task) => (
            <div
              key={task.id}
              style={{
                ...styles.taskCard,
                opacity: draggedTaskData?.taskId === task.id ? 0.5 : 1,
                cursor: draggedTaskData?.taskId === task.id ? "grabbing" : "grab",
              }}
              draggable
              onDragStart={() => handleDragStart(task.id)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, task.id)}
              onClick={() => onSelectTask(task.id)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgTertiary;
                (e.currentTarget as HTMLElement).style.borderColor = colors.primary;
                const deleteBtn = e.currentTarget.querySelector("[data-delete-btn]") as HTMLElement;
                if (deleteBtn) deleteBtn.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = colors.bgPrimary;
                (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                const deleteBtn = e.currentTarget.querySelector("[data-delete-btn]") as HTMLElement;
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
                onMouseEnter={(e) => (e.currentTarget.style.color = colors.danger)}
                onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
              >
                <FiX size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
