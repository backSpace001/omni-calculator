import { useEffect, useRef, useState } from "react";
import { evaluate, round } from "../lib.js";
import { Field, Key, Page, Panel, Result } from "../ui.jsx";

function show(v) {
  if (!Number.isFinite(v)) return "Error";
  return String(round(v, 10));
}

export function CameraCalc() {
  const [image, setImage] = useState("");
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState("");
  const [steps, setSteps] = useState([]);

  const solve = () => {
    try {
      const value = evaluate(expr);
      setOut(show(value));
      setSteps([`Read: ${expr}`, `Evaluate left to right with precedence`, `Result = ${show(value)}`]);
    } catch {
      setOut("Could not parse that. Use numbers and + − × ÷ ^ sin() log().");
      setSteps([]);
    }
  };

  return (
    <Page
      title="Camera Math"
      blurb="Photograph a textbook problem, type what you see, and get the answer with steps."
    >
      <Panel>
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Photo</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImage(URL.createObjectURL(file));
            }}
          />
        </label>
        {image ? (
          <img src={image} alt="Problem" style={{ width: "100%", borderRadius: 14, maxHeight: 240, objectFit: "contain" }} />
        ) : null}
        <Field label="Expression from the photo" value={expr} onChange={setExpr} type="text" placeholder="(3+5)*2^3" />
        <button
          onClick={solve}
          style={{ background: "var(--accent)", color: "#1b2437", borderRadius: 12, padding: "12px 16px", fontWeight: 700 }}
        >
          Solve
        </button>
        {out ? <Result label="Answer" value={out} /> : null}
        {steps.map((s) => (
          <div key={s} style={{ color: "var(--muted)", fontSize: 14 }}>
            {s}
          </div>
        ))}
      </Panel>
    </Page>
  );
}

export function ReceiptCalc() {
  const [image, setImage] = useState("");
  const [raw, setRaw] = useState("Milk 4.29\nBread 3.50\nApples 6.10\nTax 1.12");
  const [people, setPeople] = useState("2");
  const items = raw
    .split("\n")
    .map((line) => {
      const match = line.trim().match(/^(.*?)(-?\d+(\.\d+)?)\s*$/);
      if (!match) return null;
      return { name: match[1].trim() || "Item", amount: Number(match[2]) };
    })
    .filter(Boolean);
  const total = items.reduce((s, i) => s + i.amount, 0);
  const split = total / Math.max(1, Number(people) || 1);

  return (
    <Page title="Receipt Scanner" blurb="Photograph a receipt, turn it into a list, then add it up or split it.">
      <Panel>
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Receipt photo</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImage(URL.createObjectURL(file));
            }}
          />
        </label>
        {image ? (
          <img src={image} alt="Receipt" style={{ width: "100%", borderRadius: 14, maxHeight: 240, objectFit: "contain" }} />
        ) : null}
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Items (name then price)</span>
          <textarea
            value={raw}
            rows={6}
            onChange={(e) => setRaw(e.target.value)}
            style={{
              background: "var(--panel-soft)",
              border: "none",
              borderRadius: 12,
              padding: 14,
              outline: "none",
            }}
          />
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, i) => (
            <div key={`${item.name}-${i}`} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{item.name}</span>
              <strong>{item.amount.toFixed(2)}</strong>
            </div>
          ))}
        </div>
        <Field label="Split between" value={people} onChange={setPeople} suffix="people" />
        <Result label="Total" value={total.toFixed(2)} hint={`${split.toFixed(2)} each`} />
      </Panel>
    </Page>
  );
}

function recognize(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let ink = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 30) {
        ink += 1;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (ink < 20) return "";
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const aspect = bw / bh;
  if (aspect > 3 && bh < height * 0.25) return "−";
  const off = document.createElement("canvas");
  off.width = 32;
  off.height = 32;
  const o = off.getContext("2d");
  o.fillStyle = "#000";
  o.fillRect(0, 0, 32, 32);
  o.drawImage(canvas, minX, minY, bw, bh, 2, 2, 28, 28);
  const glyphs = "0123456789+×÷=.";
  const probe = document.createElement("canvas");
  probe.width = 32;
  probe.height = 32;
  const p = probe.getContext("2d");
  let best = "";
  let bestScore = Infinity;
  for (const g of glyphs) {
    p.fillStyle = "#000";
    p.fillRect(0, 0, 32, 32);
    p.fillStyle = "#fff";
    p.font = "26px sans-serif";
    p.textAlign = "center";
    p.textBaseline = "middle";
    p.fillText(g, 16, 18);
    const A = o.getImageData(0, 0, 32, 32).data;
    const B = p.getImageData(0, 0, 32, 32).data;
    let score = 0;
    for (let i = 0; i < A.length; i += 4) {
      const av = A[i + 3] > 20 ? 1 : 0;
      const bv = B[i] > 20 ? 1 : 0;
      score += av !== bv ? 1 : 0;
    }
    if (score < bestScore) {
      bestScore = score;
      best = g;
    }
  }
  return bestScore < 700 ? best : "";
}

export function HandwritingCalc() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [expr, setExpr] = useState("");
  const [out, setOut] = useState("0");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#263047";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: ((src.clientX - r.left) / r.width) * canvasRef.current.width,
      y: ((src.clientY - r.top) / r.height) * canvasRef.current.height,
    };
  };

  const start = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => {
    drawing.current = false;
  };

  const commit = () => {
    const g = recognize(canvasRef.current);
    if (g === "=") {
      try {
        setOut(show(evaluate(expr || "0")));
      } catch {
        setOut("Error");
      }
    } else if (g) setExpr(expr + g);
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#263047";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const clearPad = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#263047";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <Page title="Handwriting" blurb="Draw a digit or operator, then add it. Draw = to solve.">
      <Panel>
        <div style={{ fontSize: 28, fontWeight: 650, minHeight: 40 }}>{expr || "Draw below"}</div>
        <canvas
          ref={canvasRef}
          width={360}
          height={220}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={(e) => {
            e.preventDefault();
            start(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            move(e);
          }}
          onTouchEnd={end}
          style={{ width: "100%", borderRadius: 14, touchAction: "none", background: "var(--panel-soft)" }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={commit} style={{ background: "var(--accent)", color: "#1b2437", borderRadius: 12, padding: "12px 16px", fontWeight: 700 }}>
            Read drawing
          </button>
          <button className="preset" onClick={clearPad} style={{ background: "var(--key)", borderRadius: 12, padding: "12px 16px" }}>
            Clear pad
          </button>
          <button
            className="preset"
            onClick={() => {
              setExpr("");
              setOut("0");
            }}
            style={{ background: "var(--key)", borderRadius: 12, padding: "12px 16px" }}
          >
            AC
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "−", "×", "÷", "."].map((k) => (
            <Key key={k} label={k} onClick={() => setExpr(expr + k)} />
          ))}
        </div>
        <button
          onClick={() => {
            try {
              setOut(show(evaluate(expr || "0")));
            } catch {
              setOut("Error");
            }
          }}
          style={{ background: "var(--accent)", color: "#1b2437", borderRadius: 12, padding: "12px 16px", fontWeight: 700 }}
        >
          =
        </button>
        <Result label="Result" value={out} />
      </Panel>
    </Page>
  );
}
