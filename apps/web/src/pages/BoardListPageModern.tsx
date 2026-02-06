import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  FiLogOut, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiColumns, 
  FiCheckSquare 
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getBoards, createBoard, deleteBoard, updateBoard } from "../lib/api";
import { BoardView } from "../components/BoardView";
import { Spinner } from "../components/Spinner";
import { ConfirmModal } from "../components/ConfirmModal";
import { colors, spacing, radius, shadows } from "../lib/styles";

interface Board {
  id: string;
  title: string;
  columns?: any[];
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
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
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
      padding: `${spacing.sm} ${spacing.md}`,
      backgroundColor: colors.danger,
      color: "white",
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "14px",
      transition: `all 0.2s`,
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
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
      display: "flex",
      alignItems: "center",
      gap: spacing.md,
    },
    createForm: {
      display: "flex",
      gap: spacing.md,
      marginBottom: spacing.xl,
      maxWidth: "500px",
    },
    formInput: {
      flex: 1,
      padding: `${spacing.sm} ${spacing.md}`,
      backgroundColor: colors.bgSecondary,
      color: colors.textPrimary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.md,
      fontSize: "14px",
      transition: `all 0.2s`,
    },
    createButton: {
      padding: `${spacing.sm} ${spacing.lg}`,
      backgroundColor: colors.primary,
      color: "white",
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: spacing.sm,
      transition: `all 0.2s`,
    },
    boardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: spacing.lg,
    },
    boardCard: {
      backgroundColor: colors.bgSecondary,
      border: `1px solid ${colors.border}`,
      borderRadius: radius.lg,
      padding: spacing.lg,
      cursor: "pointer",
      transition: `all 0.2s`,
      display: "flex",
      flexDirection: "column" as const,
      gap: spacing.md,
    },
    boardTitle: {
      fontSize: "16px",
      fontWeight: 600,
      color: colors.textPrimary,
      margin: 0,
    },
    boardStats: {
      display: "flex",
      gap: spacing.md,
      fontSize: "13px",
      color: colors.textSecondary,
    },
    statItem: {
      display: "flex",
      alignItems: "center",
      gap: spacing.xs,
    },
    boardActions: {
      display: "flex",
      gap: spacing.sm,
      justifyContent: "flex-end",
      paddingTop: spacing.md,
      borderTop: `1px solid ${colors.border}`,
    },
    iconButton: {
      padding: spacing.xs,
      backgroundColor: "transparent",
      color: colors.textSecondary,
      border: "none",
      borderRadius: radius.md,
      cursor: "pointer",
      fontSize: "16px",
      transition: `all 0.2s`,
    },
    deleteButton: {
      color: colors.danger,
    },
    editButton: {
      color: colors.primary,
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

  const handleBoardClick = (boardId: string) => {
    setSelectedBoardId(boardId);
  };

  const calculateBoardStats = (board: Board) => {
    const columns = board.columns || [];
    const tasks = columns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0);
    return { columns: columns.length, tasks };
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>
            <FiColumns size={28} />
            Team Boards
          </h1>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.name}</span>
          <button
            style={styles.logoutButton}
            onClick={logout}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.danger;
            }}
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FiPlus size={20} />
            Create New Board
          </h2>
          <form onSubmit={handleCreateBoard} style={styles.createForm}>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Enter board name..."
              style={styles.formInput}
              onFocus={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = colors.primary;
                (e.currentTarget as HTMLInputElement).style.boxShadow = `0 0 0 3px rgba(59, 130, 246, 0.1)`;
              }}
              onBlur={(e) => {
                (e.currentTarget as HTMLInputElement).style.borderColor = colors.border;
                (e.currentTarget as HTMLInputElement).style.boxShadow = "none";
              }}
              disabled={isCreating}
            />
            <button
              type="submit"
              style={styles.createButton}
              disabled={isCreating}
              onMouseEnter={(e) => {
                if (!isCreating) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primaryDark;
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.primary;
              }}
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FiColumns size={20} />
            Your Boards
          </h2>

          {isLoading ? (
            <Spinner />
          ) : boards.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p>No boards yet. Create one to get started!</p>
            </div>
          ) : (
            <div style={styles.boardsGrid}>
              {boards.map((board) => {
                const stats = calculateBoardStats(board);
                const isEditing = editingBoardId === board.id;

                return (
                  <div
                    key={board.id}
                    style={styles.boardCard}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = colors.primary;
                      (e.currentTarget as HTMLDivElement).style.boxShadow = shadows.lg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editingBoardTitle}
                        onChange={(e) => setEditingBoardTitle(e.target.value)}
                        style={styles.formInput}
                        onBlur={() => {
                          if (editingBoardTitle.trim()) {
                            handleEditBoard(board.id, editingBoardTitle);
                          }
                          setEditingBoardId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (editingBoardTitle.trim()) {
                              handleEditBoard(board.id, editingBoardTitle);
                            }
                            setEditingBoardId(null);
                          } else if (e.key === "Escape") {
                            setEditingBoardId(null);
                          }
                        }}
                      />
                    ) : (
                      <>
                        <h3
                          style={styles.boardTitle}
                          onClick={() => handleBoardClick(board.id)}
                        >
                          {board.title}
                        </h3>
                        <div style={styles.boardStats}>
                          <div style={styles.statItem}>
                            <FiColumns size={14} />
                            {stats.columns} column{stats.columns !== 1 ? "s" : ""}
                          </div>
                          <div style={styles.statItem}>
                            <FiCheckSquare size={14} />
                            {stats.tasks} task{stats.tasks !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div style={styles.boardActions}>
                          <button
                            style={{ ...styles.iconButton, ...styles.editButton }}
                            onClick={() => {
                              setEditingBoardId(board.id);
                              setEditingBoardTitle(board.title);
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bgTertiary;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            }}
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            style={{ ...styles.iconButton, ...styles.deleteButton }}
                            onClick={() => {
                              setDeleteConfirmId(board.id);
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.bgTertiary;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                            }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {deleteConfirmId && (
        <ConfirmModal
          title="Delete Board"
          message="Are you sure you want to delete this board? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={() => {
            handleDeleteBoard(deleteConfirmId);
          }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}
    </div>
  );
}
