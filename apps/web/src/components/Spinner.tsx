export function Spinner() {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    minHeight: "200px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f0f0f0",
    borderTop: "4px solid #0066cc",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

// Add CSS animation for spinner
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector("style[data-spinner]")) {
  style.setAttribute("data-spinner", "true");
  document.head.appendChild(style);
}
