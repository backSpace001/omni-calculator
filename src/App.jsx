import { useState } from "react";

const KEYS = [
  ["AC", "muted"],
  ["±", "muted"],
  ["%", "muted"],
  ["÷", "accent"],
  ["7", "plain"],
  ["8", "plain"],
  ["9", "plain"],
  ["×", "accent"],
  ["4", "plain"],
  ["5", "plain"],
  ["6", "plain"],
  ["−", "accent"],
  ["1", "plain"],
  ["2", "plain"],
  ["3", "plain"],
  ["+", "accent"],
  ["0", "plain"],
  [".", "plain"],
  ["⌫", "plain"],
  ["=", "accent"],
];

const OPS = {
  "÷": (a, b) => (b === 0 ? NaN : a / b),
  "×": (a, b) => a * b,
  "−": (a, b) => a - b,
  "+": (a, b) => a + b,
};

function format(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round(value * 1e10) / 1e10;
  return String(rounded);
}

export default function App() {
  const [display, setDisplay] = useState("0");
  const [pending, setPending] = useState(null);
  const [fresh, setFresh] = useState(true);
  const [history, setHistory] = useState([]);

  const pushDigit = (digit) => {
    if (digit === "." && display.includes(".") && !fresh) return;
    if (fresh) {
      setDisplay(digit === "." ? "0." : digit);
      setFresh(false);
      return;
    }
    setDisplay(display === "0" && digit !== "." ? digit : display + digit);
  };

  const resolve = () => {
    if (!pending) return Number(display);
    return OPS[pending.op](pending.left, Number(display));
  };

  const handle = (key) => {
    if (/^[0-9.]$/.test(key)) return pushDigit(key);

    if (key === "AC") {
      setDisplay("0");
      setPending(null);
      setFresh(true);
      return;
    }

    if (key === "⌫") {
      if (fresh) return;
      const next = display.slice(0, -1);
      setDisplay(next === "" || next === "-" ? "0" : next);
      return;
    }

    if (key === "±") {
      setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
      return;
    }

    if (key === "%") {
      setDisplay(format(Number(display) / 100));
      setFresh(false);
      return;
    }

    if (key === "=") {
      if (!pending) return;
      const result = resolve();
      const expression = `${format(pending.left)} ${pending.op} ${display}`;
      setHistory([{ expression, result: format(result) }, ...history].slice(0, 5));
      setDisplay(format(result));
      setPending(null);
      setFresh(true);
      return;
    }

    const left = resolve();
    setDisplay(format(left));
    setPending({ op: key, left });
    setFresh(true);
  };

  const keyStyle = (variant) => ({
    padding: "18px 0",
    borderRadius: 14,
    fontSize: 20,
    fontWeight: 500,
    color: variant === "accent" ? "#1b2437" : "var(--text)",
    background:
      variant === "accent"
        ? "var(--accent)"
        : variant === "muted"
        ? "var(--panel-soft)"
        : "#2c3752",
  });

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: 32,
        width: "100%",
        maxWidth: 420,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-0.01em" }}>
          Omni Calculator
        </h1>
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
          A small everyday calculator.
        </p>
      </header>

      <section
        style={{
          background: "var(--panel)",
          borderRadius: 20,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          aria-live="polite"
          style={{
            textAlign: "right",
            fontSize: 44,
            fontWeight: 600,
            minHeight: 56,
            overflowWrap: "anywhere",
          }}
        >
          {display}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
          }}
        >
          {KEYS.map(([key, variant]) => (
            <button
              key={key}
              onClick={() => handle(key)}
              className={
                variant === "accent"
                  ? "key-accent"
                  : variant === "muted"
                  ? "key-muted"
                  : "key"
              }
              style={keyStyle(variant)}
            >
              {key}
            </button>
          ))}
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--muted)",
          }}
        >
          Recent
        </h2>
        {history.length === 0 ? (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
            Your last five calculations appear here.
          </p>
        ) : (
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {history.map((entry, index) => (
              <li
                key={`${entry.expression}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  background: "var(--panel)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 14,
                }}
              >
                <span style={{ color: "var(--muted)" }}>{entry.expression}</span>
                <span style={{ fontWeight: 600 }}>{entry.result}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
