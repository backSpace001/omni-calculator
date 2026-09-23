import { useState } from "react";
import { fmt, toNum } from "../lib.js";
import { Field, Grid, Page, Panel, Result } from "../ui.jsx";

export function PhotoCalc() {
  const [focal, setFocal] = useState("50");
  const [aperture, setAperture] = useState("2.8");
  const [distance, setDistance] = useState("3");
  const [coc, setCoc] = useState("0.03");
  const [iso, setIso] = useState("100");
  const [ev, setEv] = useState("12");
  const f = toNum(focal);
  const N = toNum(aperture);
  const s = toNum(distance) * 1000;
  const c = toNum(coc);
  const hyper = (f * f) / (N * c) + f;
  const near = (s * (hyper - f)) / (hyper + s - 2 * f);
  const far = (s * (hyper - f)) / (hyper - s);
  const dof = far > 0 && Number.isFinite(far) ? (far - near) / 1000 : Infinity;
  const shutter = (N ** 2 / 2 ** toNum(ev)) * (100 / Math.max(1, toNum(iso)));
  const shutterLabel =
    shutter >= 1 ? `${fmt(shutter, 1)} s` : `1/${fmt(1 / shutter, 0)} s`;
  return (
    <Page title="Photography" blurb="Depth of field — which parts of the photo will be sharp vs blurry — plus exposure.">
      <Panel>
        <Grid>
          <Field label="Focal length" value={focal} onChange={setFocal} suffix="mm" />
          <Field label="Aperture (f/)" value={aperture} onChange={setAperture} />
          <Field label="Subject distance" value={distance} onChange={setDistance} suffix="m" />
          <Field label="Circle of confusion" value={coc} onChange={setCoc} suffix="mm" />
        </Grid>
        <Grid>
          <Result label="Hyperfocal" value={`${fmt(hyper / 1000, 2)} m`} />
          <Result label="Near sharp" value={`${fmt(near / 1000, 2)} m`} />
          <Result
            label="Far sharp"
            value={!Number.isFinite(far) || far < 0 ? "Infinity" : `${fmt(far / 1000, 2)} m`}
          />
          <Result label="DoF" value={!Number.isFinite(dof) ? "Infinity" : `${fmt(dof, 2)} m`} />
        </Grid>
        <Grid>
          <Field label="ISO" value={iso} onChange={setIso} />
          <Field label="Scene EV" value={ev} onChange={setEv} />
        </Grid>
        <Result label="Shutter at this aperture" value={shutterLabel} hint="Sunny day is about EV 15" />
      </Panel>
    </Page>
  );
}

export function MusicCalc() {
  const [bpm, setBpm] = useState("120");
  const quarter = 60000 / Math.max(1, toNum(bpm));
  const rows = [
    ["1/1", quarter * 4],
    ["1/2", quarter * 2],
    ["1/4", quarter],
    ["1/8", quarter / 2],
    ["1/8 dotted", (quarter / 2) * 1.5],
    ["1/8 triplet", quarter / 3],
    ["1/16", quarter / 4],
  ];
  return (
    <Page title="Music Production" blurb="Convert a song's tempo (BPM) into milliseconds for delay and reverb times.">
      <Panel>
        <Field label="Tempo" value={bpm} onChange={setBpm} suffix="BPM" />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map(([label, ms]) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: "var(--panel-soft)",
                borderRadius: 10,
                padding: "10px 14px",
              }}
            >
              <span style={{ color: "var(--muted)" }}>{label}</span>
              <strong>{fmt(ms, 1)} ms</strong>
            </div>
          ))}
        </div>
      </Panel>
    </Page>
  );
}
