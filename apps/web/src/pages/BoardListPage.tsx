import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { getBoards, createBoard, deleteBoard } from "../lib/api";
import { BoardView } from "../components/BoardView";
import { Spinner } from "../components/Spinner";

export function BoardListPage() {
  const { user, token, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: boardsData, isLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      const response = await getBoards(token);
      return response.boards;
    },
    enabled: !!token,
  });

  const boards = boardsData || [];
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

  const handleDeleteBoard = async (boardId: string) => {
    if (!token) return;
    const confirmed = window.confirm("Are you sure you want to delete this board?");
    if (!confirmed) return;

    try {
      await deleteBoard(boardId, token);
      if (selectedBoardId === boardId) {
        setSelectedBoardId(null);
      }
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      toast.success("Board deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete board");
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

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Team Boards</h1>
        <div style={styles.userSection}>
          <span style={styles.userInfo}>{user?.name}</span>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Create New Board</h2>
          <form onSubmit={handleCreateBoard} style={styles.createForm}>
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Enter board name..."
              style={styles.createInput}
              disabled={isCreating}
            />
            <button
              type="submit"
              style={{
                ...styles.createButton,
                opacity: isCreating || !newBoardTitle.trim() ? 0.6 : 1,
                cursor: isCreating || !newBoardTitle.trim() ? "not-allowed" : "pointer",
              }}
              disabled={isCreating || !newBoardTitle.trim()}
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </form>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Your Boards</h2>
          {isLoading ? (
            <Spinner />
          ) : boards.length === 0 ? (
            <p style={styles.emptyState}>No boards yet. Create one to get started!</p>
          ) : (
            <div style={styles.boardGrid}>
              {boards.map((board) => (
                <div key={board.id} style={styles.boardCard}>
                  <h3 style={styles.boardCardTitle}>{board.title}</h3>
                  <p style={styles.boardCardMeta}>
                    {board.columns.length} columns · {board.columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks
                  </p>
                  <div style={styles.boardCardActions}>
                    <button
                      onClick={() => setSelectedBoardId(board.id)}
                      style={styles.boardCardButton}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDeleteBoard(board.id)}
                      style={{ ...styles.boardCardButton, backgroundColor: "#cc0000" }}
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
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  userInfo: {
    fontSize: "14px",
    color: "#666",
  },
  logoutButton: {
    padding: "6px 12px",
    fontSize: "14px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
  },
  main: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  section: {
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  createForm: {
    display: "flex",
    gap: "12px",
  },
  createInput: {
    flex: 1,
    padding: "8px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontFamily: "inherit",
  },
  createButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: 600,
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
  },
  emptyState: {
    padding: "24px",
    textAlign: "center",
    color: "#999",
  },
  boardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "16px",
  },
  boardCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #ddd",
    padding: "16px",
  },
  boardCardTitle: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: 600,
  },
  boardCardMeta: {
    margin: "0 0 12px 0",
    fontSize: "13px",
    color: "#999",
  },
  boardCardActions: {
    display: "flex",
    gap: "8px",
  },
  boardCardButton: {
    flex: 1,
    padding: "6px 12px",
    fontSize: "13px",
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
