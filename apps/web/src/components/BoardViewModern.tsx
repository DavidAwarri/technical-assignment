'use client';

import React from "react"
import { colors, spacing, radius } from "../styles/theme"; // Importing undeclared variables
import { styles } from "../styles/styles"; // Declaring the styles variable

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  getBoard,
  createColumn,
  updateColumn,
  deleteColumn,
  createTask,
  updateTask,
  deleteTask,
  updateBoard,
} from "../lib/api";
import { ColumnComponent } from "./Column";
import { TaskDetailModal } from "./TaskDetailModal";
import { Spinner } from "./Spinner";
import { ConfirmModal } from "./ConfirmModal";

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  comments: Array<{ id: string; content: string; user: { name: string } }>;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  tasks: Task[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
}

interface BoardViewProps {
  boardId: string;
  boardTitle: string;
  onBack: () => void;
}

export function BoardViewModern({ boardId, boardTitle, onBack }: BoardViewProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [draggedTaskData, setDraggedTaskData] = useState<{ taskId: string; sourceColumnId: string } | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<"column" | "task" | null>(null);

  const { data: boardData, isLoading, refetch } = useQuery({
    queryKey: ["board", boardId],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const response = await getBoard(boardId, token);
      return response.board;
    },
    enabled: !!token && !!boardId,
  });

  const board = boardData as Board | undefined;
  const columns = board?.columns || [];

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

  const handleEditColumn = async (columnId: string, newTitle: string) => {
    if (!token || !newTitle.trim()) return;

    try {
      await updateColumn(columnId, newTitle, 0, token);
      setEditingColumnId(null);
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Column updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update column");
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!token) return;

    try {
      await deleteColumn(columnId, token);
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Column deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete column");
    } finally {
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
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

    try {
      await deleteTask(taskId, token);
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      toast.success("Task deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setDeleteConfirmId(null);
      setDeleteConfirmType(null);
    }
  };



  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-bg-primary">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <header className="flex items-center justify-between p-lg border-b border-border bg-bg-secondary">
        <div className="flex items-center gap-md">
          <button
            onClick={onBack}
            className="bg-none border-none text-primary cursor-pointer text-xl p-sm flex items-center justify-center transition-colors hover:text-primary-light"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="m-0 text-text-primary">{boardTitle}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex gap-lg p-lg flex-wrap content-start">
          {columns.map((column) => (
            <ColumnComponent
              key={column.id}
              column={column}
              onCreateTask={(title) => handleCreateTask(column.id, title)}
              onSelectTask={(taskId) => setSelectedTaskId(taskId)}
              onMoveTask={handleMoveTask}
              onDeleteTask={(taskId) => {
                setDeleteConfirmId(taskId);
                setDeleteConfirmType("task");
              }}
              onEditColumn={(newTitle) => handleEditColumn(column.id, newTitle)}
              onDeleteColumn={() => {
                setDeleteConfirmId(column.id);
                setDeleteConfirmType("column");
              }}
              draggedTaskData={draggedTaskData}
              onDragStart={(taskId) => setDraggedTaskData({ taskId, sourceColumnId: column.id })}
              onDragEnd={() => setDraggedTaskData(null)}
            />
          ))}

          <form onSubmit={handleCreateColumn} className="flex gap-md min-w-[300px] items-center">
            <input
              type="text"
              placeholder="New column..."
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="flex-1 px-md py-sm bg-bg-secondary border border-border rounded-md text-text-primary text-sm"
            />
            <button
              type="submit"
              disabled={isCreatingColumn}
              className={`px-md py-sm bg-primary text-text-primary border-none rounded-md cursor-pointer font-medium transition-all flex items-center justify-center gap-sm ${
                isCreatingColumn ? "opacity-60" : "opacity-100 hover:bg-primary-dark"
              }`}
            >
              <FiPlus size={16} />
              {isCreatingColumn ? "Adding..." : "Add"}
            </button>
          </form>
        </div>
      </main>

      {selectedTaskId && (
        <TaskDetailModal
          task={{ id: selectedTaskId } as Task}
          boardId={boardId}
          onClose={() => setSelectedTaskId(null)}
          onRefresh={refetch}
        />
      )}

      <ConfirmModal
        isOpen={deleteConfirmType === "column"}
        title="Delete Column"
        message="This will delete the column and move all tasks. Are you sure?"
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={() => deleteConfirmId && handleDeleteColumn(deleteConfirmId)}
        onCancel={() => {
          setDeleteConfirmId(null);
          setDeleteConfirmType(null);
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmType === "task"}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={() => deleteConfirmId && handleDeleteTask(deleteConfirmId)}
        onCancel={() => {
          setDeleteConfirmId(null);
          setDeleteConfirmType(null);
        }}
      />
    </div>
  );
}
