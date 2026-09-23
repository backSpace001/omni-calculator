import { useState } from "react";
import { fmt, toNum } from "../lib.js";
import { Field, Grid, Page, Panel, Result, Select } from "../ui.jsx";

export function BmiCalc() {
  const [unit, setUnit] = useState("us");
  const [height, setHeight] = useState("70");
  const [weight, setWeight] = useState("170");
  const kg = unit === "us" ? toNum(weight) * 0.453592 : toNum(weight);
  const m = unit === "us" ? toNum(height) * 0.0254 : toNum(height) / 100;
  const bmi = kg / m ** 2;
  const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy range" : bmi < 30 ? "Overweight" : "Obese";
  return (
    <Page title="BMI" blurb="A quick check of whether your weight is in a healthy range for your height.">
      <Panel>
        <Select
          label="Units"
          value={unit}
          onChange={setUnit}
          options={[
            { value: "us", label: "lb / in" },
            { value: "metric", label: "kg / cm" },
          ]}
        />
        <Grid>
          <Field label={unit === "us" ? "Height (in)" : "Height (cm)"} value={height} onChange={setHeight} />
          <Field label={unit === "us" ? "Weight (lb)" : "Weight (kg)"} value={weight} onChange={setWeight} />
        </Grid>
        <Result label="BMI" value={fmt(bmi, 1)} hint={label} />
      </Panel>
    </Page>
  );
}

export function BodyFatCalc() {
  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState("70");
  const [neck, setNeck] = useState("16");
  const [waist, setWaist] = useState("34");
  const [hip, setHip] = useState("40");
  const h = toNum(height);
  const n = toNum(neck);
  const w = toNum(waist);
  const hi = toNum(hip);
  const pct =
    sex === "male"
      ? 86.01 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76
      : 163.205 * Math.log10(w + hi - n) - 97.684 * Math.log10(h) - 78.387;
  return (
    <Page title="Body Fat Percentage" blurb="US Navy tape method using waist, neck, and hip measurements.">
      <Panel>
        <Select
          label="Sex"
          value={sex}
          onChange={setSex}
          options={[
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ]}
        />
        <Grid>
          <Field label="Height (in)" value={height} onChange={setHeight} />
          <Field label="Neck (in)" value={neck} onChange={setNeck} />
          <Field label="Waist (in)" value={waist} onChange={setWaist} />
          {sex === "female" ? <Field label="Hip (in)" value={hip} onChange={setHip} /> : null}
        </Grid>
        <Result label="Body fat" value={`${fmt(pct, 1)}%`} />
      </Panel>
    </Page>
  );
}

const ACTIVITY = [
  { value: "1.2", label: "Sedentary" },
  { value: "1.375", label: "Light" },
  { value: "1.55", label: "Moderate" },
  { value: "1.725", label: "Active" },
  { value: "1.9", label: "Very active" },
];

export function TdeeCalc() {
  const [sex, setSex] = useState("female");
  const [age, setAge] = useState("32");
  const [height, setHeight] = useState("165");
  const [weight, setWeight] = useState("68");
  const [act, setAct] = useState("1.55");
  const bmr =
    sex === "male"
      ? 10 * toNum(weight) + 6.25 * toNum(height) - 5 * toNum(age) + 5
      : 10 * toNum(weight) + 6.25 * toNum(height) - 5 * toNum(age) - 161;
  const tdee = bmr * toNum(act);
  return (
    <Page title="Calorie Counter" blurb="Calories you burn in a day, so you know how much to eat to lose or gain weight.">
      <Panel>
        <Grid>
          <Select
            label="Sex"
            value={sex}
            onChange={setSex}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
            ]}
          />
          <Select label="Activity" value={act} onChange={setAct} options={ACTIVITY} />
          <Field label="Age" value={age} onChange={setAge} suffix="years" />
          <Field label="Height" value={height} onChange={setHeight} suffix="cm" />
          <Field label="Weight" value={weight} onChange={setWeight} suffix="kg" />
        </Grid>
        <Grid>
          <Result label="Maintain" value={`${fmt(tdee, 0)} kcal`} />
          <Result label="Lose (~0.5 kg/wk)" value={`${fmt(tdee - 500, 0)} kcal`} />
          <Result label="Gain (~0.5 kg/wk)" value={`${fmt(tdee + 500, 0)} kcal`} />
          <Result label="BMR" value={`${fmt(bmr, 0)} kcal`} />
        </Grid>
      </Panel>
    </Page>
  );
}

export function WaterCalc() {
  const [weight, setWeight] = useState("160");
  const [activity, setActivity] = useState("30");
  const oz = toNum(weight) * 0.5 + toNum(activity) * 0.4;
  return (
    <Page title="Water Intake" blurb="Daily water from body weight, plus extra for workout minutes.">
      <Panel>
        <Grid>
          <Field label="Weight" value={weight} onChange={setWeight} suffix="lb" />
          <Field label="Activity" value={activity} onChange={setActivity} suffix="min" />
        </Grid>
        <Result label="Drink" value={`${fmt(oz, 0)} oz`} hint={`${fmt(oz * 0.0295735, 1)} liters`} />
      </Panel>
    </Page>
  );
}

export function PregnancyCalc() {
  const [lmp, setLmp] = useState(new Date().toISOString().slice(0, 10));
  const start = new Date(lmp + "T00:00:00");
  const due = new Date(start.getTime() + 280 * 86400000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today - start) / 86400000);
  const weeks = Math.max(0, Math.floor(days / 7));
  const rem = Math.max(0, days % 7);
  return (
    <Page title="Pregnancy Due Date" blurb="Predicts the due date from the first day of the last period.">
      <Panel>
        <Field label="Last period started" type="date" value={lmp} onChange={setLmp} />
        <Grid>
          <Result label="Due date" value={due.toISOString().slice(0, 10)} />
          <Result label="Gestational age" value={`${weeks}w ${rem}d`} />
        </Grid>
      </Panel>
    </Page>
  );
}
