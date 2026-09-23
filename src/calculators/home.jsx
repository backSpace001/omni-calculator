import { useState } from "react";
import { fmt, toNum } from "../lib.js";
import { Field, Grid, Page, Panel, Result } from "../ui.jsx";

export function FlooringCalc() {
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("10");
  const [coverage, setCoverage] = useState("20");
  const [waste, setWaste] = useState("10");
  const area = toNum(length) * toNum(width);
  const needed = area * (1 + toNum(waste) / 100);
  const boxes = Math.ceil(needed / Math.max(0.01, toNum(coverage)));
  return (
    <Page title="Flooring & Tile" blurb="How many boxes of tile or laminate you need. 10% extra for waste is included.">
      <Panel>
        <Grid>
          <Field label="Room length" value={length} onChange={setLength} suffix="ft" />
          <Field label="Room width" value={width} onChange={setWidth} suffix="ft" />
          <Field label="Coverage / box" value={coverage} onChange={setCoverage} suffix="ft²" />
          <Field label="Waste" value={waste} onChange={setWaste} suffix="%" />
        </Grid>
        <Grid>
          <Result label="Room area" value={`${fmt(area, 1)} ft²`} />
          <Result label="Boxes to buy" value={String(boxes)} hint={`Covers ${fmt(needed, 1)} ft² with waste`} />
        </Grid>
      </Panel>
    </Page>
  );
}

export function PaintCalc() {
  const [length, setLength] = useState("16");
  const [width, setWidth] = useState("12");
  const [height, setHeight] = useState("8");
  const [doors, setDoors] = useState("2");
  const [windows, setWindows] = useState("3");
  const [coats, setCoats] = useState("2");
  const [coverage, setCoverage] = useState("350");
  const walls = 2 * (toNum(length) + toNum(width)) * toNum(height);
  const openings = toNum(doors) * 20 + toNum(windows) * 15;
  const area = Math.max(0, walls - openings) * toNum(coats);
  const gallons = Math.ceil(area / Math.max(1, toNum(coverage)));
  return (
    <Page title="Paint Estimator" blurb="Gallons to cover the walls, minus doors and windows.">
      <Panel>
        <Grid>
          <Field label="Length" value={length} onChange={setLength} suffix="ft" />
          <Field label="Width" value={width} onChange={setWidth} suffix="ft" />
          <Field label="Height" value={height} onChange={setHeight} suffix="ft" />
          <Field label="Doors" value={doors} onChange={setDoors} />
          <Field label="Windows" value={windows} onChange={setWindows} />
          <Field label="Coats" value={coats} onChange={setCoats} />
        </Grid>
        <Field label="Coverage / gallon" value={coverage} onChange={setCoverage} suffix="ft²" />
        <Grid>
          <Result label="Paintable area" value={`${fmt(area, 0)} ft²`} />
          <Result label="Gallons" value={String(gallons)} />
        </Grid>
      </Panel>
    </Page>
  );
}

export function ConcreteCalc() {
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("8");
  const [depth, setDepth] = useState("4");
  const [wallL, setWallL] = useState("20");
  const [wallH, setWallH] = useState("4");
  const [brickL, setBrickL] = useState("8");
  const [brickH, setBrickH] = useState("2.25");
  const [mortar, setMortar] = useState("0.375");
  const cuFt = toNum(length) * toNum(width) * (toNum(depth) / 12);
  const bags80 = Math.ceil(cuFt / 0.6);
  const unitL = (toNum(brickL) + toNum(mortar)) / 12;
  const unitH = (toNum(brickH) + toNum(mortar)) / 12;
  const bricks = Math.ceil((toNum(wallL) / unitL) * (toNum(wallH) / unitH) * 1.05);
  return (
    <Page title="Concrete & Bricks" blurb="Bags of concrete for a slab, or bricks for a wall, with a little extra for waste.">
      <Panel>
        <Grid>
          <Field label="Slab length" value={length} onChange={setLength} suffix="ft" />
          <Field label="Slab width" value={width} onChange={setWidth} suffix="ft" />
          <Field label="Depth" value={depth} onChange={setDepth} suffix="in" />
        </Grid>
        <Result label="80 lb bags" value={String(bags80)} hint={`${fmt(cuFt, 1)} cubic feet`} />
      </Panel>
      <Panel>
        <Grid>
          <Field label="Wall length" value={wallL} onChange={setWallL} suffix="ft" />
          <Field label="Wall height" value={wallH} onChange={setWallH} suffix="ft" />
          <Field label="Brick length" value={brickL} onChange={setBrickL} suffix="in" />
          <Field label="Brick height" value={brickH} onChange={setBrickH} suffix="in" />
        </Grid>
        <Result label="Bricks" value={fmt(bricks, 0)} hint="Includes 5% waste" />
      </Panel>
    </Page>
  );
}

export function RoofingCalc() {
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("24");
  const [rise, setRise] = useState("6");
  const run = 12;
  const footprint = toNum(length) * toNum(width);
  const pitchFactor = Math.sqrt(toNum(rise) ** 2 + run ** 2) / run;
  const area = footprint * pitchFactor;
  const squares = area / 100;
  const bundles = Math.ceil(squares * 3);
  return (
    <Page title="Roofing" blurb="Roof area and how many bundles of shingles to buy, based on pitch.">
      <Panel>
        <Grid>
          <Field label="Roof length" value={length} onChange={setLength} suffix="ft" />
          <Field label="Roof width" value={width} onChange={setWidth} suffix="ft" />
          <Field label="Pitch rise" value={rise} onChange={setRise} suffix="/ 12" />
        </Grid>
        <Grid>
          <Result label="Roof area" value={`${fmt(area, 0)} ft²`} />
          <Result label="Squares" value={fmt(squares, 2)} />
        </Grid>
        <Result label="Bundles" value={String(bundles)} hint="3 bundles per square" />
      </Panel>
    </Page>
  );
}

export function CarpetCalc() {
  const [rooms, setRooms] = useState("12x10\n8x6\n4x4");
  const [width, setWidth] = useState("12");
  const [waste, setWaste] = useState("10");
  const rects = rooms
    .split("\n")
    .map((line) => line.trim().toLowerCase().split(/[x×,]/).map(Number))
    .filter((p) => p.length >= 2 && p.every(Number.isFinite));
  const area = rects.reduce((s, [l, w]) => s + l * w, 0);
  const needed = area * (1 + toNum(waste) / 100);
  const rollWidth = toNum(width);
  const lengthFt = needed / Math.max(0.5, rollWidth);
  const yards = lengthFt / 3;
  return (
    <Page title="Carpet" blurb="Estimate roll length for irregular rooms. Add each rectangle on its own line.">
      <Panel>
        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Rooms (ft × ft, one per line)</span>
          <textarea
            value={rooms}
            rows={4}
            onChange={(e) => setRooms(e.target.value)}
            style={{
              background: "var(--panel-soft)",
              border: "none",
              borderRadius: 12,
              padding: 14,
              outline: "none",
            }}
          />
        </label>
        <Grid>
          <Field label="Roll width" value={width} onChange={setWidth} suffix="ft" />
          <Field label="Waste" value={waste} onChange={setWaste} suffix="%" />
        </Grid>
        <Grid>
          <Result label="Floor area" value={`${fmt(area, 1)} ft²`} />
          <Result label="Roll length" value={`${fmt(yards, 1)} yd`} hint={`${fmt(lengthFt, 1)} ft`} />
        </Grid>
      </Panel>
    </Page>
  );
}
