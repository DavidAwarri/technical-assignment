import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getBoards, createBoard, deleteBoard, updateBoard } from "../lib/api";
import { BoardView } from "../components/BoardView";
import { Spinner } from "../components/Spinner";
import { ConfirmModal } from "../components/ConfirmModal";
import { colors, spacing, radius, shadows } from "../lib/styles";

interface Board {
  id: string;
  title: string;
}

export function BoardListPage() {
  const { user, token, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: boardsData, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const response = await getBoards(token);
      return response.boards;
    },
    enabled: !!token,
  });

  const boards: Board[] = boardsData || [];
  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newBoardTitle.trim()) return;

    setIsCreating(true);
    try {
      await createBoard(newBoardTitle, token);
      setNewBoardTitle("");
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditBoard = async (boardId: string, newTitle: string) => {
    if (!token || !newTitle.trim()) return;

    try {
      await updateBoard(boardId, newTitle, token);
      setEditingBoardId(null);
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update board");
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!token) return;

    try {
      await deleteBoard(boardId, token);
      if (selectedBoardId === boardId) {
        setSelectedBoardId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete board");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (selectedBoard) {
    return (
      <BoardView
        boardId={selectedBoard.id}
        boardTitle={selectedBoard.title}
        onBack={() => setSelectedBoardId(null)}
      />
    );
  }

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: colors.bgPrimary,
      display: "flex",
      flexDirection: "column" as const,
    },
    header: {
      backgroundColor: colors.bgSecondary,
      borderBottom: `1px solid ${colors.border}`,
      padding: spacing.lg,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: spacing.md,
    },
    logo: {
      fontSize: "24px",
      fontWeight: 700,
      color: colors.primary,
      margin: 0,
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: spacing.md,
    },
    userName: {
      fontSize: "14px",
      color: colors.textSecondary,
    },
    logoutButton: {
      padding: `${spacing.xs} ${spacing.md}`,
      backgroundColor: colors.danger,
      color: colors.textPrimary,
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "14px",
      transition: `all 0.2s`,
    },
    main: {
      flex: 1,
      padding: spacing.xl,
      overflow: "auto",
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: 600,
      color: colors.textPrimary,
      marginBottom: spacing.lg,
    },
    createBoardForm: {
      display: "flex",
      gap: spacing.md,
      marginBottom: spacing.xl,
      maxWidth: "500px",
    },
    createBoardInput: {
      flex: 1,
      padding: `${spacing.sm} ${spacing.md}`,
      backgroundColor: colors.bgSecondary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      color: colors.textPrimary,
      fontSize: "14px",
      transition: `all 0.2s`,
    },
    createBoardButton: {
      padding: `${spacing.sm} ${spacing.md}`,
      backgroundColor: colors.primary,
      color: colors.textPrimary,
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "14px",
      transition: `all 0.2s`,
    },
    boardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: spacing.lg,
    },
    boardCard: {
      backgroundColor: colors.bgSecondary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: spacing.lg,
      cursor: "pointer",
      transition: `all 0.3s`,
      display: "flex",
      flexDirection: "column" as const,
      gap: spacing.md,
    },
    boardTitle: {
      fontSize: "18px",
      fontWeight: 600,
      color: colors.textPrimary,
      margin: 0,
    },
    boardActions: {
      display: "flex",
      gap: spacing.md,
    },
    actionButton: {
      flex: 1,
      padding: `${spacing.xs} ${spacing.md}`,
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "13px",
      transition: `all 0.2s`,
    },
    openButton: {
      backgroundColor: colors.primary,
      color: colors.textPrimary,
    },
    editButton: {
      backgroundColor: colors.bgTertiary,
      color: colors.primary,
      border: `1px solid ${colors.primary}`,
    },
    deleteButton: {
      backgroundColor: colors.bgTertiary,
      color: colors.danger,
      border: `1px solid ${colors.danger}`,
    },
    emptyState: {
      textAlign: "center" as const,
      padding: spacing.xl,
      color: colors.textMuted,
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: spacing.md,
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>📋 Team Boards</h1>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name}</span>
          <button
            onClick={logout}
            style={styles.logoutButton}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Create New Board</h2>
          <form onSubmit={handleCreateBoard} style={styles.createBoardForm}>
            <input
              type="text"
              placeholder="Board name..."
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              style={styles.createBoardInput}
              disabled={isCreating}
              onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)}
              onBlur={(e) => (e.currentTarget.style.borderColor = colors.border)}
            />
            <button
              type="submit"
              disabled={isCreating || !newBoardTitle.trim()}
              style={{
                ...styles.createBoardButton,
                opacity: isCreating || !newBoardTitle.trim() ? 0.6 : 1,
              }}
              onMouseOver={(e) => !isCreating && (e.currentTarget.style.backgroundColor = colors.primaryDark)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
            >
              Create Board
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Boards</h2>
          {isLoading ? (
            <Spinner />
          ) : boards.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p>No boards yet. Create one to get started!</p>
            </div>
          ) : (
            <div style={styles.boardsGrid}>
              {boards.map((board) => (
                <div
                  key={board.id}
                  style={styles.boardCard}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = shadows.lg;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = shadows.md;
                  }}
                >
                  {editingBoardId === board.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingBoardTitle}
                      onChange={(e) => setEditingBoardTitle(e.target.value)}
                      onBlur={() => handleEditBoard(board.id, editingBoardTitle)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditBoard(board.id, editingBoardTitle);
                        if (e.key === "Escape") setEditingBoardId(null);
                      }}
                      style={{
                        ...styles.createBoardInput,
                        fontSize: "18px",
                      }}
                    />
                  ) : (
                    <h3 style={styles.boardTitle}>{board.title}</h3>
                  )}

                  <div style={styles.boardActions}>
                    <button
                      onClick={() => setSelectedBoardId(board.id)}
                      style={{ ...styles.actionButton, ...styles.openButton }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.primaryDark)}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        setEditingBoardId(board.id);
                        setEditingBoardTitle(board.title);
                      }}
                      style={{ ...styles.actionButton, ...styles.editButton }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(board.id)}
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.danger)}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.bgTertiary)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Board"
        message="Are you sure you want to delete this board? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={() => deleteConfirmId && handleDeleteBoard(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
