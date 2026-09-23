import { useState } from "react";
import { amortize, federalTax, fmt, money, toNum } from "../lib.js";
import { Field, Grid, Page, Panel, Presets, Result, Select } from "../ui.jsx";

export function TipCalc() {
  const [bill, setBill] = useState("86.40");
  const [tip, setTip] = useState("20");
  const [people, setPeople] = useState("3");
  const tipAmt = toNum(bill) * (toNum(tip) / 100);
  const total = toNum(bill) + tipAmt;
  const split = total / Math.max(1, toNum(people));
  return (
    <Page title="Tip & Split" blurb="How much to leave, then split the total evenly among friends.">
      <Panel>
        <Field label="Bill" value={bill} onChange={setBill} suffix="USD" />
        <Presets
          values={[15, 18, 20, 25].map((n) => ({ label: `${n}%`, value: String(n) }))}
          onPick={(v) => setTip(v.value)}
        />
        <Grid>
          <Field label="Tip" value={tip} onChange={setTip} suffix="%" />
          <Field label="People" value={people} onChange={setPeople} />
        </Grid>
        <Grid>
          <Result label="Tip" value={money(tipAmt)} />
          <Result label="Total" value={money(total)} />
        </Grid>
        <Result label="Each person" value={money(split)} />
      </Panel>
    </Page>
  );
}

export function LoanCalc() {
  const [price, setPrice] = useState("425000");
  const [down, setDown] = useState("85000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [tax, setTax] = useState("4800");
  const [ins, setIns] = useState("1400");
  const principal = Math.max(0, toNum(price) - toNum(down));
  const a = amortize({
    principal,
    annualRate: toNum(rate),
    years: toNum(years),
    tax: toNum(tax),
    insurance: toNum(ins),
  });
  return (
    <Page title="Loan & Mortgage" blurb="Monthly payment for a house or car, including property tax and insurance.">
      <Panel>
        <Grid>
          <Field label="Price" value={price} onChange={setPrice} />
          <Field label="Down payment" value={down} onChange={setDown} />
          <Field label="Interest" value={rate} onChange={setRate} suffix="%" />
          <Field label="Term" value={years} onChange={setYears} suffix="years" />
          <Field label="Property tax / year" value={tax} onChange={setTax} />
          <Field label="Insurance / year" value={ins} onChange={setIns} />
        </Grid>
        <Grid>
          <Result label="Principal & interest" value={money(a.pi)} />
          <Result label="Total monthly" value={money(a.monthly)} hint="Includes tax and insurance" />
        </Grid>
      </Panel>
    </Page>
  );
}

export function ExtraCalc() {
  const [principal, setPrincipal] = useState("280000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState("30");
  const [extra, setExtra] = useState("100");
  const base = amortize({ principal: toNum(principal), annualRate: toNum(rate), years: toNum(years) });
  const withExtra = amortize({
    principal: toNum(principal),
    annualRate: toNum(rate),
    years: toNum(years),
    extra: toNum(extra),
  });
  const monthsSaved = base.months - withExtra.months;
  const interestSaved = base.interest - withExtra.interest;
  return (
    <Page title="Extra Payment" blurb="See how much money and time you save by paying extra every month.">
      <Panel>
        <Grid>
          <Field label="Balance" value={principal} onChange={setPrincipal} />
          <Field label="Rate" value={rate} onChange={setRate} suffix="%" />
          <Field label="Term" value={years} onChange={setYears} suffix="years" />
          <Field label="Extra / month" value={extra} onChange={setExtra} />
        </Grid>
        <Presets
          values={[50, 100, 200, 500].map((n) => ({ label: `+$${n}`, value: String(n) }))}
          onPick={(v) => setExtra(v.value)}
        />
        <Grid>
          <Result label="Time saved" value={`${fmt(monthsSaved / 12, 1)} years`} hint={`${fmt(monthsSaved, 0)} months`} />
          <Result label="Interest saved" value={money(interestSaved)} />
        </Grid>
        <Result label="Payoff" value={`${fmt(withExtra.payoffYears, 1)} years`} hint={`Was ${fmt(base.payoffYears, 1)} years`} />
      </Panel>
    </Page>
  );
}

export function CompoundCalc() {
  const [principal, setPrincipal] = useState("10000");
  const [contrib, setContrib] = useState("300");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("20");
  const [inflation, setInflation] = useState("2.5");
  const r = toNum(rate) / 100 / 12;
  const n = toNum(years) * 12;
  const p = toNum(principal);
  const c = toNum(contrib);
  const fv = r === 0 ? p + c * n : p * (1 + r) ** n + c * (((1 + r) ** n - 1) / r);
  const real = fv / (1 + toNum(inflation) / 100) ** toNum(years);
  const decades = [10, 20, 30]
    .filter((y) => y <= toNum(years) || y === 10)
    .map((y) => {
      const m = y * 12;
      const value = r === 0 ? p + c * m : p * (1 + r) ** m + c * (((1 + r) ** m - 1) / r);
      return { y, value };
    });
  return (
    <Page title="Compound Interest" blurb="See savings grow over 10, 20, or 30 years, including real value after inflation.">
      <Panel>
        <Grid>
          <Field label="Starting amount" value={principal} onChange={setPrincipal} />
          <Field label="Monthly contribution" value={contrib} onChange={setContrib} />
          <Field label="Annual return" value={rate} onChange={setRate} suffix="%" />
          <Field label="Years" value={years} onChange={setYears} />
          <Field label="Inflation" value={inflation} onChange={setInflation} suffix="%" />
        </Grid>
        <Grid>
          <Result label="Future value" value={money(fv)} />
          <Result label="Real value" value={money(real)} hint="Today's dollars" />
        </Grid>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {decades.map((d) => (
            <div key={d.y} style={{ display: "flex", justifyContent: "space-between", background: "var(--panel-soft)", borderRadius: 10, padding: "10px 14px" }}>
              <span style={{ color: "var(--muted)" }}>{d.y} years</span>
              <strong>{money(d.value)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </Page>
  );
}

export function SalaryCalc() {
  const [hourly, setHourly] = useState("32");
  const [hours, setHours] = useState("40");
  const [weeks, setWeeks] = useState("52");
  const [salary, setSalary] = useState("");
  const annual = salary === "" ? toNum(hourly) * toNum(hours) * toNum(weeks) : toNum(salary);
  const derivedHourly = annual / Math.max(1, toNum(hours) * toNum(weeks));
  const tax = federalTax(annual);
  const takeHome = annual - tax.total;
  return (
    <Page title="Salary & Tax" blurb="Hourly wage to yearly salary, and estimated take-home after US federal tax and FICA.">
      <Panel>
        <Grid>
          <Field
            label="Hourly"
            value={hourly}
            onChange={(v) => {
              setHourly(v);
              setSalary("");
            }}
          />
          <Field label="Hours / week" value={hours} onChange={setHours} />
          <Field label="Weeks / year" value={weeks} onChange={setWeeks} />
          <Field
            label="Or yearly salary"
            value={salary}
            onChange={(v) => {
              setSalary(v);
              if (v) setHourly(String(round2(toNum(v) / Math.max(1, toNum(hours) * toNum(weeks)))));
            }}
          />
        </Grid>
        <Grid>
          <Result label="Gross yearly" value={money(annual)} hint={`${money(derivedHourly)} / hour`} />
          <Result label="Est. tax + FICA" value={money(tax.total)} />
        </Grid>
        <Result label="Take-home" value={money(takeHome)} hint={`${money(takeHome / 12)} / month`} />
      </Panel>
    </Page>
  );
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function AutoCalc() {
  const [miles, setMiles] = useState("12000");
  const [years, setYears] = useState("5");
  const [mpg, setMpg] = useState("28");
  const [gas, setGas] = useState("3.60");
  const [kwh, setKwh] = useState("28");
  const [elec, setElec] = useState("0.16");
  const [gasPrice, setGasPrice] = useState("32000");
  const [evPrice, setEvPrice] = useState("38000");
  const gasFuel = (toNum(miles) / Math.max(0.1, toNum(mpg))) * toNum(gas) * toNum(years);
  const evFuel = (toNum(miles) * (toNum(kwh) / 100)) * toNum(elec) * toNum(years);
  const gasTotal = toNum(gasPrice) + gasFuel;
  const evTotal = toNum(evPrice) + evFuel;
  return (
    <Page title="Auto Loan & EV Savings" blurb="Compare buying a gas car vs an electric car, including fuel and charging.">
      <Panel>
        <Grid>
          <Field label="Miles / year" value={miles} onChange={setMiles} />
          <Field label="Years owned" value={years} onChange={setYears} />
          <Field label="Gas car price" value={gasPrice} onChange={setGasPrice} />
          <Field label="EV price" value={evPrice} onChange={setEvPrice} />
          <Field label="MPG" value={mpg} onChange={setMpg} />
          <Field label="$ / gallon" value={gas} onChange={setGas} />
          <Field label="EV kWh / 100 mi" value={kwh} onChange={setKwh} />
          <Field label="$ / kWh" value={elec} onChange={setElec} />
        </Grid>
        <Grid>
          <Result label="Gas fuel" value={money(gasFuel)} />
          <Result label="EV charging" value={money(evFuel)} />
          <Result label="Gas 5-yr total" value={money(gasTotal)} />
          <Result label="EV total" value={money(evTotal)} />
        </Grid>
        <Result
          label={evTotal < gasTotal ? "EV saves" : "Gas saves"}
          value={money(Math.abs(gasTotal - evTotal))}
          hint="Purchase plus energy over the years owned"
        />
      </Panel>
    </Page>
  );
}

export function ProfitCalc() {
  const [cost, setCost] = useState("40");
  const [price, setPrice] = useState("65");
  const [target, setTarget] = useState("40");
  const c = toNum(cost);
  const p = toNum(price);
  const margin = p === 0 ? 0 : ((p - c) / p) * 100;
  const markup = c === 0 ? 0 : ((p - c) / c) * 100;
  const priceFromMargin = c / (1 - toNum(target) / 100);
  return (
    <Page title="Business Profit" blurb="Margin vs markup, and the price you need to hit a target margin.">
      <Panel>
        <Grid>
          <Field label="Cost" value={cost} onChange={setCost} />
          <Field label="Sell price" value={price} onChange={setPrice} />
        </Grid>
        <Grid>
          <Result label="Margin" value={`${fmt(margin, 2)}%`} hint="Profit / price" />
          <Result label="Markup" value={`${fmt(markup, 2)}%`} hint="Profit / cost" />
        </Grid>
        <Field label="Desired margin" value={target} onChange={setTarget} suffix="%" />
        <Result label="Price to hit it" value={money(priceFromMargin)} />
      </Panel>
    </Page>
  );
}

export function BettingCalc() {
  const [american, setAmerican] = useState("+150");
  const [stake, setStake] = useState("100");
  const a = Number(String(american).replace("+", ""));
  const decimal = a > 0 ? a / 100 + 1 : 100 / Math.abs(a) + 1;
  const implied = 1 / decimal;
  const profit = toNum(stake) * (decimal - 1);
  const frac = a > 0 ? `${a}/100` : `100/${Math.abs(a)}`;
  return (
    <Page title="Sports Betting" blurb="Convert +150 style odds into percentages, decimal odds, and potential winnings.">
      <Panel>
        <Grid>
          <Field label="American odds" value={american} onChange={setAmerican} type="text" />
          <Field label="Stake" value={stake} onChange={setStake} />
        </Grid>
        <Grid>
          <Result label="Decimal" value={fmt(decimal, 3)} />
          <Result label="Fractional" value={frac} />
          <Result label="Implied" value={`${fmt(implied * 100, 2)}%`} />
          <Result label="Profit if win" value={money(profit)} hint={`Payout ${money(profit + toNum(stake))}`} />
        </Grid>
      </Panel>
    </Page>
  );
}

