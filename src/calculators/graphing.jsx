import { useEffect, useRef, useState } from "react";
import { evaluate } from "../lib.js";
import { Field, Page, Panel } from "../ui.jsx";

export function GraphingCalc() {
  const [formula, setFormula] = useState("x^2");
  const [xmin, setXmin] = useState("-6");
  const [xmax, setXmax] = useState("6");
  const [ymin, setYmin] = useState("-2");
  const [ymax, setYmax] = useState("10");
  const [point, setPoint] = useState(null);
  const canvasRef = useRef(null);

  const plot = (hoverX) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const x0 = Number(xmin);
    const x1 = Number(xmax);
    const y0 = Number(ymin);
    const y1 = Number(ymax);
    const xTo = (x) => ((x - x0) / (x1 - x0)) * w;
    const yTo = (y) => h - ((y - y0) / (y1 - y0)) * h;
    ctx.fillStyle = "#1b2437";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, yTo(0));
    ctx.lineTo(w, yTo(0));
    ctx.moveTo(xTo(0), 0);
    ctx.lineTo(xTo(0), h);
    ctx.stroke();
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= w; px += 1) {
      const x = x0 + (px / w) * (x1 - x0);
      let y;
      try {
        y = evaluate(formula, { x });
      } catch {
        y = NaN;
      }
      if (!Number.isFinite(y)) {
        started = false;
        continue;
      }
      const py = yTo(y);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (hoverX != null) {
      const x = x0 + (hoverX / w) * (x1 - x0);
      let y;
      try {
        y = evaluate(formula, { x });
      } catch {
        y = NaN;
      }
      if (Number.isFinite(y)) {
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.arc(hoverX, yTo(y), 5, 0, Math.PI * 2);
        ctx.fill();
        setPoint({ x, y });
      }
    }
  };

  useEffect(() => {
    plot(null);
  }, [formula, xmin, xmax, ymin, ymax]);

  const zoom = (factor) => {
    const cx = (Number(xmin) + Number(xmax)) / 2;
    const cy = (Number(ymin) + Number(ymax)) / 2;
    const hx = ((Number(xmax) - Number(xmin)) / 2) * factor;
    const hy = ((Number(ymax) - Number(ymin)) / 2) * factor;
    setXmin(String(cx - hx));
    setXmax(String(cx + hx));
    setYmin(String(cy - hy));
    setYmax(String(cy + hy));
  };

  return (
    <Page title="Graphing" blurb="Type a formula in x. Zoom the view, then tap the curve to read a point.">
      <Panel>
        <Field label="y =" value={formula} onChange={setFormula} type="text" />
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            plot(((e.clientX - rect.left) / rect.width) * e.currentTarget.width);
          }}
          style={{ width: "100%", borderRadius: 14, background: "#1b2437", cursor: "crosshair" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="preset" onClick={() => zoom(0.7)} style={{ background: "var(--key)", borderRadius: 10, padding: "10px 14px" }}>
            Zoom in
          </button>
          <button className="preset" onClick={() => zoom(1.4)} style={{ background: "var(--key)", borderRadius: 10, padding: "10px 14px" }}>
            Zoom out
          </button>
        </div>
        {point ? (
          <div style={{ fontSize: 16 }}>
            x = {point.x.toFixed(3)} · y = {point.y.toFixed(3)}
          </div>
        ) : (
          <div style={{ color: "var(--muted)" }}>Tap the graph to inspect a point.</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <Field label="X min" value={xmin} onChange={setXmin} />
          <Field label="X max" value={xmax} onChange={setXmax} />
          <Field label="Y min" value={ymin} onChange={setYmin} />
          <Field label="Y max" value={ymax} onChange={setYmax} />
        </div>
      </Panel>
    </Page>
  );
}
