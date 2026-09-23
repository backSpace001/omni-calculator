import { useEffect, useMemo, useState } from "react";
import { CALCULATORS, CATEGORIES } from "./catalog.js";
import { CameraCalc, HandwritingCalc, ReceiptCalc } from "./calculators/capture.jsx";
import { CurrencyCalc, CookingCalc, DateCalc, JewelryCalc, UnitCalc } from "./calculators/converters.jsx";
import { MusicCalc, PhotoCalc } from "./calculators/creative.jsx";
import { ProgrammerCalc, ScientificCalc, StandardCalc, StatisticsCalc, TapeCalc } from "./calculators/everyday.jsx";
import { GraphingCalc } from "./calculators/graphing.jsx";
import { BmiCalc, BodyFatCalc, PregnancyCalc, TdeeCalc, WaterCalc } from "./calculators/health.jsx";
import { CarpetCalc, ConcreteCalc, FlooringCalc, PaintCalc, RoofingCalc } from "./calculators/home.jsx";
import { AutoCalc, BettingCalc, CompoundCalc, ExtraCalc, LoanCalc, ProfitCalc, SalaryCalc, TipCalc } from "./calculators/money.jsx";

const PAGES = {
  standard: StandardCalc,
  tape: TapeCalc,
  scientific: ScientificCalc,
  graphing: GraphingCalc,
  programmer: ProgrammerCalc,
  statistics: StatisticsCalc,
  units: UnitCalc,
  currency: CurrencyCalc,
  datetime: DateCalc,
  cooking: CookingCalc,
  jewelry: JewelryCalc,
  tip: TipCalc,
  loan: LoanCalc,
  extra: ExtraCalc,
  compound: CompoundCalc,
  salary: SalaryCalc,
  auto: AutoCalc,
  profit: ProfitCalc,
  betting: BettingCalc,
  flooring: FlooringCalc,
  paint: PaintCalc,
  concrete: ConcreteCalc,
  roofing: RoofingCalc,
  carpet: CarpetCalc,
  bmi: BmiCalc,
  bodyfat: BodyFatCalc,
  tdee: TdeeCalc,
  water: WaterCalc,
  pregnancy: PregnancyCalc,
  photo: PhotoCalc,
  music: MusicCalc,
  camera: CameraCalc,
  receipt: ReceiptCalc,
  handwriting: HandwritingCalc,
};

function currentId() {
  return window.location.hash.replace(/^#\/?/, "");
}

export default function App() {
  const [route, setRoute] = useState(currentId);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onHash = () => setRoute(currentId());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = (id) => {
    window.location.hash = id ? `#/${id}` : "#/";
  };

  const Page = PAGES[route];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CALCULATORS;
    return CALCULATORS.filter((c) => `${c.title} ${c.blurb}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "28px 20px 64px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 880, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Page ? (
            <button
              className="back"
              onClick={() => go("")}
              style={{ alignSelf: "flex-start", color: "var(--muted)", fontSize: 14 }}
            >
              ← All calculators
            </button>
          ) : null}
          {!Page ? (
            <>
              <h1 style={{ margin: 0, fontSize: 32, letterSpacing: "-0.03em" }}>Omni Calculator</h1>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 16, lineHeight: 1.5 }}>
                Everyday math, money, home projects, health, and more — pick a tool to get started.
              </p>
            </>
          ) : null}
        </div>

        {Page ? (
          <Page />
        ) : (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search calculators"
              style={{
                background: "var(--panel)",
                border: "none",
                borderRadius: 14,
                padding: "14px 16px",
                fontSize: 16,
                outline: "none",
              }}
            />
            {CATEGORIES.map((cat) => {
              const items = filtered.filter((c) => c.category === cat.id);
              if (!items.length) return null;
              return (
                <section key={cat.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 13,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    {cat.label}
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {items.map((item) => (
                      <button
                        key={item.id}
                        className="card"
                        onClick={() => go(item.id)}
                        style={{
                          textAlign: "left",
                          background: "var(--panel)",
                          borderRadius: 16,
                          padding: 16,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          minHeight: 108,
                        }}
                      >
                        <strong style={{ fontSize: 16 }}>{item.title}</strong>
                        <span style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.45 }}>{item.blurb}</span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
            {filtered.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No calculators match “{query}”.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
