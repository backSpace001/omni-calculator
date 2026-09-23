import { fmt, money } from "./lib.js";

export function Page({ title, blurb, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-0.02em" }}>{title}</h1>
        {blurb ? (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: 15, lineHeight: 1.5 }}>{blurb}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}

export function Panel({ children, style }) {
  return (
    <section
      style={{
        background: "var(--panel)",
        borderRadius: 20,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function Grid({ children, cols = 2 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

export function Field({ label, value, onChange, suffix, type = "number", min, step, placeholder }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ color: "var(--muted)", fontSize: 13 }}>{label}</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--panel-soft)",
          borderRadius: 12,
          padding: "0 14px",
        }}
      >
        <input
          type={type}
          value={value}
          min={min}
          step={step}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "var(--text)",
            fontSize: 16,
            padding: "12px 0",
            outline: "none",
            width: "100%",
          }}
        />
        {suffix ? <span style={{ color: "var(--muted)", fontSize: 13 }}>{suffix}</span> : null}
      </div>
    </label>
  );
}

export function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ color: "var(--muted)", fontSize: 13 }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--panel-soft)",
          border: "none",
          borderRadius: 12,
          padding: "12px 14px",
          fontSize: 16,
          outline: "none",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Area({ label, value, onChange, rows = 5, placeholder }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ color: "var(--muted)", fontSize: 13 }}>{label}</span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--panel-soft)",
          border: "none",
          borderRadius: 12,
          padding: 14,
          fontSize: 16,
          outline: "none",
          resize: "vertical",
        }}
      />
    </label>
  );
}

export function Result({ label, value, hint }) {
  return (
    <div
      style={{
        background: "var(--panel-soft)",
        borderRadius: 14,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ color: "var(--muted)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </span>
      <strong style={{ fontSize: 22, fontWeight: 650 }}>{value}</strong>
      {hint ? <span style={{ color: "var(--muted)", fontSize: 13 }}>{hint}</span> : null}
    </div>
  );
}

export function Stat({ label, value }) {
  return <Result label={label} value={value} />;
}

export function Presets({ values, onPick }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {values.map((v) => (
        <button
          key={v.label}
          className="preset"
          onClick={() => onPick(v)}
          style={{
            background: "var(--panel-soft)",
            borderRadius: 999,
            padding: "8px 12px",
            fontSize: 13,
          }}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

export function Key({ label, variant = "plain", span = 1, onClick }) {
  return (
    <button
      className={variant === "accent" ? "key-accent" : variant === "muted" ? "key-muted" : "key"}
      onClick={() => onClick(label)}
      style={{
        padding: "18px 0",
        borderRadius: 14,
        fontSize: 18,
        fontWeight: 550,
        color: variant === "accent" ? "#1b2437" : "var(--text)",
        background: variant === "accent" ? "var(--accent)" : variant === "muted" ? "var(--panel-soft)" : "var(--key)",
        gridColumn: span === 2 ? "span 2" : undefined,
      }}
    >
      {label}
    </button>
  );
}

export { fmt, money };
