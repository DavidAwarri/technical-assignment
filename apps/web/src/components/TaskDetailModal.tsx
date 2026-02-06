'use client';

import React from "react"

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getTask, createComment, updateTask } from "../lib/api";
import { Spinner } from "./Spinner";
import type { Task } from "./BoardView";

interface TaskDetailModalProps {
  task: Task;
  boardId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function TaskDetailModal({ task, boardId, onClose, onRefresh }: TaskDetailModalProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || "");

  const { data: taskData, isLoading, refetch: refetchTask } = useQuery({
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
      await refetchTask();
      queryClient.invalidateQueries({ queryKey: ["board"] });
      toast.success("Comment added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
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
      await refetchTask();
      queryClient.invalidateQueries({ queryKey: ["board"] });
      toast.success("Title updated");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
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
      await refetchTask();
      queryClient.invalidateQueries({ queryKey: ["board"] });
      toast.success("Description updated");
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md w-[90%] max-w-2xl max-h-[90vh] overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-xs text-xl bg-transparent border-none cursor-pointer text-gray-600"
        >
          ✕
        </button>

        <div className="p-lg">
          {isEditingTitle ? (
            <div className="flex flex-col gap-xs">
              <input
                autoFocus
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="px-sm py-xs text-sm border border-gray-300 rounded-md font-inherit"
              />
              <div className="flex gap-xs">
                <button
                  onClick={handleSaveTitle}
                  className="flex-1 px-sm py-xs text-xs font-semibold text-white bg-green-600 border-none rounded cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(task.title);
                    setIsEditingTitle(false);
                  }}
                  className="flex-1 px-sm py-xs text-xs font-semibold text-white bg-gray-600 border-none rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <h2
              className="mb-md text-xl font-semibold cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
              title="Click to edit"
            >
              {currentTask.title}
            </h2>
          )}

          <section className="mb-lg">
            <h3 className="mb-xs text-sm font-semibold text-gray-900">Description</h3>
            {isEditingDescription ? (
              <div className="flex flex-col gap-xs">
                <textarea
                  autoFocus
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="px-sm py-xs text-sm border border-gray-300 rounded-md font-inherit min-h-[80px]"
                />
                <div className="flex gap-xs">
                  <button
                    onClick={handleSaveDescription}
                    className="flex-1 px-sm py-xs text-xs font-semibold text-white bg-green-600 border-none rounded cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedDescription(task.description || "");
                      setIsEditingDescription(false);
                    }}
                    className="flex-1 px-sm py-xs text-xs font-semibold text-white bg-gray-600 border-none rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p
                className="m-0 text-sm text-gray-600 leading-relaxed cursor-pointer bg-gray-50 p-xs rounded-md"
                onClick={() => setIsEditingDescription(true)}
                title="Click to edit"
              >
                {currentTask.description || "(No description)"}
              </p>
            )}
          </section>

          <section className="mb-lg">
            <h3 className="mb-xs text-sm font-semibold text-gray-900">
              Comments ({currentTask.comments.length})
            </h3>

            {isLoading ? (
              <div className="min-h-[100px]">
                <Spinner />
              </div>
            ) : (
              <div className="mb-sm">
                {currentTask.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-xs bg-gray-50 rounded-md mb-xs"
                  >
                    <strong className="text-xs">{comment.user.name}</strong>
                    <p className="m-0 mt-xs text-xs text-gray-900 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex flex-col gap-xs">
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Add a comment..."
                disabled={isAddingComment}
                className="px-sm py-xs text-xs border border-gray-300 rounded-md font-inherit min-h-[60px]"
              />
              <button
                type="submit"
                disabled={isAddingComment || !newCommentContent.trim()}
                className={`px-sm py-xs text-xs font-semibold text-white bg-blue-600 border-none rounded ${
                  isAddingComment || !newCommentContent.trim()
                    ? "opacity-60 cursor-not-allowed"
                    : "opacity-100 cursor-pointer"
                }`}
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
