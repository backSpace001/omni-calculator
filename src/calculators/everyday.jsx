import { useState } from "react";
import { evaluate, round } from "../lib.js";
import { Key, Page, Panel } from "../ui.jsx";

const BASIC = [
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

function show(value) {
  if (!Number.isFinite(value)) return "Error";
  return String(round(value, 10));
}

export function StandardCalc() {
  const [display, setDisplay] = useState("0");
  const [pending, setPending] = useState(null);
  const [fresh, setFresh] = useState(true);

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
    try {
      return evaluate(`${pending.left}${pending.op}${display}`);
    } catch {
      return NaN;
    }
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
      setDisplay(show(Number(display) / 100));
      setFresh(false);
      return;
    }
    if (key === "=") {
      if (!pending) return;
      setDisplay(show(resolve()));
      setPending(null);
      setFresh(true);
      return;
    }
    const left = resolve();
    setDisplay(show(left));
    setPending({ op: key, left });
    setFresh(true);
  };

  return (
    <Page title="Standard Calculator" blurb="Large buttons and a clear display for everyday arithmetic.">
      <Panel>
        <div
          aria-live="polite"
          style={{
            textAlign: "right",
            fontSize: 52,
            fontWeight: 650,
            minHeight: 64,
            overflowWrap: "anywhere",
          }}
        >
          {display}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {BASIC.map(([label, variant]) => (
            <Key key={label} label={label} variant={variant} onClick={handle} />
          ))}
        </div>
      </Panel>
    </Page>
  );
}

export function TapeCalc() {
  const [lines, setLines] = useState([
    { id: 1, op: "", value: "0" },
    { id: 2, op: "+", value: "" },
  ]);

  const update = (id, patch) => {
    setLines(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };

  const totals = [];
  let run = 0;
  lines.forEach((line, index) => {
    const n = Number(line.value);
    if (!Number.isFinite(n) || line.value === "") {
      totals.push(run);
      return;
    }
    if (index === 0 || line.op === "") run = n;
    else if (line.op === "+") run += n;
    else if (line.op === "−" || line.op === "-") run -= n;
    else if (line.op === "×") run *= n;
    else if (line.op === "÷") run = n === 0 ? NaN : run / n;
    totals.push(run);
  });

  const addLine = (op) => {
    setLines([...lines, { id: Date.now(), op, value: "" }]);
  };

  return (
    <Page
      title="Living Tape"
      blurb="A scrolling adding-machine tape. Tap any number to fix it — every total below updates."
    >
      <Panel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflow: "auto" }}>
          {lines.map((line, index) => (
            <div
              key={line.id}
              style={{
                display: "grid",
                gridTemplateColumns: "64px 1fr 88px",
                gap: 8,
                alignItems: "center",
              }}
            >
              {index === 0 ? (
                <span style={{ color: "var(--muted)", fontSize: 13 }}>Start</span>
              ) : (
                <select
                  value={line.op}
                  onChange={(e) => update(line.id, { op: e.target.value })}
                  style={{
                    background: "var(--panel-soft)",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 8px",
                  }}
                >
                  {["+", "−", "×", "÷"].map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              )}
              <input
                value={line.value}
                onChange={(e) => update(line.id, { value: e.target.value })}
                inputMode="decimal"
                style={{
                  background: "var(--panel-soft)",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 18,
                  outline: "none",
                }}
              />
              <span style={{ textAlign: "right", fontWeight: 650 }}>{show(totals[index])}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["+", "−", "×", "÷"].map((op) => (
            <button
              key={op}
              className="preset"
              onClick={() => addLine(op)}
              style={{
                background: "var(--key)",
                borderRadius: 12,
                padding: "12px 16px",
                fontWeight: 600,
              }}
            >
              {op} line
            </button>
          ))}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, textAlign: "right" }}>
          Total {show(totals[totals.length - 1])}
        </div>
      </Panel>
    </Page>
  );
}

const SCI = [
  ["sin", "muted"],
  ["cos", "muted"],
  ["tan", "muted"],
  ["ln", "muted"],
  ["log", "muted"],
  ["√", "muted"],
  ["^", "muted"],
  ["π", "muted"],
  ["(", "muted"],
  [")", "muted"],
  ["e", "muted"],
  ["AC", "muted"],
  ["7", "plain"],
  ["8", "plain"],
  ["9", "plain"],
  ["÷", "accent"],
  ["4", "plain"],
  ["5", "plain"],
  ["6", "plain"],
  ["×", "accent"],
  ["1", "plain"],
  ["2", "plain"],
  ["3", "plain"],
  ["−", "accent"],
  ["0", "plain"],
  [".", "plain"],
  ["⌫", "plain"],
  ["+", "accent"],
];

export function ScientificCalc() {
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState("0");

  const press = (key) => {
    if (key === "AC") {
      setExpr("");
      setOut("0");
      return;
    }
    if (key === "⌫") {
      setExpr(expr.slice(0, -1));
      return;
    }
    if (key === "√") {
      setExpr(`${expr}sqrt(`);
      return;
    }
    if (["sin", "cos", "tan", "ln", "log"].includes(key)) {
      setExpr(`${expr}${key}(`);
      return;
    }
    setExpr(expr + key);
  };

  const solve = () => {
    try {
      setOut(show(evaluate(expr || "0")));
    } catch {
      setOut("Error");
    }
  };

  return (
    <Page title="Scientific Calculator" blurb="Trigonometry, logarithms, exponents, π, and e.">
      <Panel>
        <div style={{ color: "var(--muted)", minHeight: 24, overflowWrap: "anywhere" }}>{expr || " "}</div>
        <div style={{ fontSize: 40, fontWeight: 650, textAlign: "right" }}>{out}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {SCI.map(([label, variant]) => (
            <Key key={label} label={label} variant={variant} onClick={press} />
          ))}
          <Key label="=" variant="accent" span={2} onClick={solve} />
        </div>
      </Panel>
    </Page>
  );
}

export function ProgrammerCalc() {
  const [value, setValue] = useState(42);
  const n = value >>> 0;
  const setFrom = (base, raw) => {
    const parsed = parseInt(raw.replace(/\s/g, ""), base);
    if (Number.isFinite(parsed)) setValue(parsed);
  };
  const bits = n.toString(2).padStart(32, "0");

  return (
    <Page title="Programmer" blurb="Convert between binary, hexadecimal, octal, and decimal. Flip bits as you go.">
      <Panel>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
            letterSpacing: 1,
            lineHeight: 1.8,
            wordBreak: "break-all",
          }}
        >
          {bits.match(/.{4}/g).join(" ")}
        </div>
        {[
          ["DEC", 10, n.toString(10)],
          ["HEX", 16, n.toString(16).toUpperCase()],
          ["OCT", 8, n.toString(8)],
          ["BIN", 2, n.toString(2)],
        ].map(([label, base, shown]) => (
          <label key={label} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ width: 40, color: "var(--muted)", fontSize: 12 }}>{label}</span>
            <input
              value={shown}
              onChange={(e) => setFrom(base, e.target.value)}
              style={{
                flex: 1,
                background: "var(--panel-soft)",
                border: "none",
                borderRadius: 10,
                padding: "10px 12px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                outline: "none",
              }}
            />
          </label>
        ))}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            ["AND 1", n & 1],
            ["OR 1", n | 1],
            ["XOR 1", n ^ 1],
            ["NOT", ~n >>> 0],
            ["<< 1", (n << 1) >>> 0],
            [">> 1", n >>> 1],
          ].map(([label, next]) => (
            <button
              key={label}
              className="preset"
              onClick={() => setValue(next)}
              style={{ background: "var(--key)", borderRadius: 10, padding: "10px 12px" }}
            >
              {label}
            </button>
          ))}
        </div>
      </Panel>
    </Page>
  );
}

export function StatisticsCalc() {
  const [text, setText] = useState("12, 15, 18, 20, 22, 25, 30");
  const values = String(text)
    .split(/[^0-9eE.+-]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const n = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = n ? sum / n : NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const med =
    n === 0 ? NaN : n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const variance = n > 1 ? values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : NaN;
  const sd = Math.sqrt(variance);
  return (
    <Page title="Statistics" blurb="Paste a list of numbers. Get count, mean, median, and standard deviation.">
      <Panel>
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Numbers</span>
          <textarea
            value={text}
            rows={5}
            onChange={(e) => setText(e.target.value)}
            style={{
              background: "var(--panel-soft)",
              border: "none",
              borderRadius: 12,
              padding: 14,
              outline: "none",
            }}
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {[
            ["Count", n],
            ["Sum", show(sum)],
            ["Mean", show(mean)],
            ["Median", show(med)],
            ["Min", n ? show(sorted[0]) : "—"],
            ["Max", n ? show(sorted[n - 1]) : "—"],
            ["Sample SD", show(sd)],
            ["Range", n ? show(sorted[n - 1] - sorted[0]) : "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "var(--panel-soft)", borderRadius: 12, padding: 12 }}>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 650 }}>{value}</div>
            </div>
          ))}
        </div>
      </Panel>
    </Page>
  );
}
