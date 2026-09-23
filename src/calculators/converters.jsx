import { useEffect, useState } from "react";
import { fmt, toNum } from "../lib.js";
import { Field, Grid, Page, Panel, Result, Select } from "../ui.jsx";

const UNIT = {
  length: {
    label: "Length",
    base: {
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.344,
      mm: 0.001,
      cm: 0.01,
      m: 1,
      km: 1000,
    },
  },
  weight: {
    label: "Weight",
    base: { oz: 0.0283495, lb: 0.453592, st: 6.35029, g: 0.001, kg: 1, t: 1000 },
  },
  speed: {
    label: "Speed",
    base: { mph: 0.44704, "km/h": 0.277778, "m/s": 1, kn: 0.514444 },
  },
};

function convertLinear(amount, from, to, table) {
  return (toNum(amount) * table[from]) / table[to];
}

function convertTemp(amount, from, to) {
  let c = toNum(amount);
  if (from === "F") c = (c - 32) * (5 / 9);
  if (from === "K") c = c - 273.15;
  if (to === "F") return c * (9 / 5) + 32;
  if (to === "K") return c + 273.15;
  return c;
}

export function UnitCalc() {
  const [kind, setKind] = useState("length");
  const [from, setFrom] = useState("in");
  const [to, setTo] = useState("cm");
  const [amount, setAmount] = useState("12");

  const options =
    kind === "temperature"
      ? [
          { value: "C", label: "Celsius" },
          { value: "F", label: "Fahrenheit" },
          { value: "K", label: "Kelvin" },
        ]
      : Object.keys(UNIT[kind].base).map((k) => ({ value: k, label: k }));

  const result =
    kind === "temperature"
      ? convertTemp(amount, from, to)
      : convertLinear(amount, from, to, UNIT[kind].base);

  return (
    <Page title="Unit Converter" blurb="Length, weight, temperature, and speed — inches to centimeters and more.">
      <Panel>
        <Select
          label="Category"
          value={kind}
          onChange={(v) => {
            setKind(v);
            if (v === "temperature") {
              setFrom("F");
              setTo("C");
            } else {
              const keys = Object.keys(UNIT[v].base);
              setFrom(keys[0]);
              setTo(keys[1]);
            }
          }}
          options={[
            { value: "length", label: "Length" },
            { value: "weight", label: "Weight" },
            { value: "temperature", label: "Temperature" },
            { value: "speed", label: "Speed" },
          ]}
        />
        <Field label="Amount" value={amount} onChange={setAmount} />
        <Grid>
          <Select label="From" value={from} onChange={setFrom} options={options} />
          <Select label="To" value={to} onChange={setTo} options={options} />
        </Grid>
        <Result label="Converted" value={`${fmt(result, 6)} ${to}`} />
      </Panel>
    </Page>
  );
}

const FALLBACK = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151, CAD: 1.36, AUD: 1.53, CHF: 0.9, INR: 83, MXN: 17, BRL: 5.1, KRW: 1350, CNY: 7.2, NZD: 1.66, SGD: 1.35 };
const POPULAR = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "MXN", "BRL", "KRW", "NZD", "SGD", "SEK", "NOK", "HKD", "ZAR"];

export function CurrencyCalc() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [rates, setRates] = useState(FALLBACK);
  const [status, setStatus] = useState("Using backup rates…");

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.rates) {
          setRates(data.rates);
          setStatus(`Live rates · ${String(data.time_last_update_utc || "").slice(0, 16)}`);
        }
      })
      .catch(() => setStatus("Live rates unavailable — using backup figures."));
  }, []);

  const codes = POPULAR.filter((c) => rates[c] != null);
  const converted = (toNum(amount) / (rates[from] || 1)) * (rates[to] || 1);
  const opts = codes.map((c) => ({ value: c, label: c }));

  return (
    <Page title="Currency Converter" blurb="See what your money is worth in other countries. Rates update from the internet.">
      <Panel>
        <Field label="Amount" value={amount} onChange={setAmount} />
        <Grid>
          <Select label="From" value={from} onChange={setFrom} options={opts} />
          <Select label="To" value={to} onChange={setTo} options={opts} />
        </Grid>
        <Result label={`${to} value`} value={fmt(converted, 2)} hint={status} />
      </Panel>
    </Page>
  );
}

function iso(date) {
  return date.toISOString().slice(0, 10);
}

export function DateCalc() {
  const today = iso(new Date());
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [days, setDays] = useState("90");
  const a = new Date(start + "T00:00:00");
  const b = new Date(end + "T00:00:00");
  const diff = Math.round((b - a) / 86400000);
  const future = new Date(a.getTime() + toNum(days) * 86400000);

  return (
    <Page title="Date & Time" blurb="How many days between two dates, or what date is 90 days from now?">
      <Panel>
        <Grid>
          <Field label="Start date" type="date" value={start} onChange={setStart} />
          <Field label="End date" type="date" value={end} onChange={setEnd} />
        </Grid>
        <Result
          label="Days between"
          value={`${fmt(Math.abs(diff), 0)} days`}
          hint={diff < 0 ? "End is before start" : `${Math.floor(Math.abs(diff) / 7)} weeks`}
        />
        <Field label="Add days to start" value={days} onChange={setDays} suffix="days" />
        <Result label="Future date" value={iso(future)} />
      </Panel>
    </Page>
  );
}

const COOK = {
  volume: { tsp: 4.92892, tbsp: 14.7868, cup: 236.588, floz: 29.5735, ml: 1, l: 1000, pint: 473.176, quart: 946.353, gal: 3785.41 },
  weight: { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 },
};

const FLOUR = { "all-purpose": 120, bread: 127, cake: 113, sugar: 200, butter: 227, oats: 90, rice: 185 };

export function CookingCalc() {
  const [kind, setKind] = useState("volume");
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("cup");
  const [to, setTo] = useState("ml");
  const [oven, setOven] = useState("350");
  const [ovenFrom, setOvenFrom] = useState("F");
  const [ingredient, setIngredient] = useState("all-purpose");
  const [cups, setCups] = useState("2");

  const table = COOK[kind];
  const converted = (toNum(amount) * table[from]) / table[to];
  const ovenOut = ovenFrom === "F" ? ((toNum(oven) - 32) * 5) / 9 : (toNum(oven) * 9) / 5 + 32;
  const grams = toNum(cups) * FLOUR[ingredient];

  return (
    <Page title="Cooking" blurb="Cups to milliliters, grams of flour, and oven Celsius ↔ Fahrenheit.">
      <Panel>
        <Select
          label="Kitchen units"
          value={kind}
          onChange={(v) => {
            setKind(v);
            const keys = Object.keys(COOK[v]);
            setFrom(keys[0]);
            setTo(keys[1]);
          }}
          options={[
            { value: "volume", label: "Volume" },
            { value: "weight", label: "Weight" },
          ]}
        />
        <Field label="Amount" value={amount} onChange={setAmount} />
        <Grid>
          <Select
            label="From"
            value={from}
            onChange={setFrom}
            options={Object.keys(table).map((k) => ({ value: k, label: k }))}
          />
          <Select
            label="To"
            value={to}
            onChange={setTo}
            options={Object.keys(table).map((k) => ({ value: k, label: k }))}
          />
        </Grid>
        <Result label="Converted" value={`${fmt(converted, 3)} ${to}`} />
      </Panel>
      <Panel>
        <Select
          label="Ingredient (US cup → grams)"
          value={ingredient}
          onChange={setIngredient}
          options={Object.keys(FLOUR).map((k) => ({ value: k, label: k }))}
        />
        <Field label="Cups" value={cups} onChange={setCups} />
        <Result label="Grams" value={`${fmt(grams, 0)} g`} />
      </Panel>
      <Panel>
        <Grid>
          <Field label="Oven temp" value={oven} onChange={setOven} />
          <Select
            label="From"
            value={ovenFrom}
            onChange={setOvenFrom}
            options={[
              { value: "F", label: "°F" },
              { value: "C", label: "°C" },
            ]}
          />
        </Grid>
        <Result label={ovenFrom === "F" ? "Celsius" : "Fahrenheit"} value={fmt(ovenOut, 0)} />
      </Panel>
    </Page>
  );
}

const RINGS = [
  { us: 4, uk: "H", eu: 47, jp: 7, mm: 14.9 },
  { us: 5, uk: "J", eu: 49, jp: 9, mm: 15.7 },
  { us: 6, uk: "L", eu: 52, jp: 11, mm: 16.5 },
  { us: 7, uk: "N", eu: 54, jp: 14, mm: 17.3 },
  { us: 8, uk: "P", eu: 57, jp: 16, mm: 18.1 },
  { us: 9, uk: "R", eu: 59, jp: 18, mm: 18.9 },
  { us: 10, uk: "T", eu: 62, jp: 20, mm: 19.8 },
  { us: 11, uk: "V", eu: 64, jp: 23, mm: 20.6 },
  { us: 12, uk: "X", eu: 67, jp: 25, mm: 21.4 },
  { us: 13, uk: "Z", eu: 69, jp: 27, mm: 22.2 },
];

export function JewelryCalc() {
  const [us, setUs] = useState("7");
  const row =
    RINGS.reduce((best, r) =>
      Math.abs(r.us - toNum(us)) < Math.abs(best.us - toNum(us)) ? r : best
    , RINGS[0]);

  return (
    <Page title="Jewelry" blurb="Convert a ring size between US, UK, EU, Japan, and inside diameter.">
      <Panel>
        <Field label="US size" value={us} onChange={setUs} step="0.5" />
        <Grid cols={2}>
          <Result label="UK" value={row.uk} />
          <Result label="EU" value={String(row.eu)} />
          <Result label="Japan" value={String(row.jp)} />
          <Result label="Diameter" value={`${row.mm} mm`} />
        </Grid>
      </Panel>
    </Page>
  );
}
