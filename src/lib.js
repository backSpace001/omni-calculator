export function toNum(value) {
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function fmt(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function money(value, currency = "USD") {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function round(n, digits = 6) {
  if (!Number.isFinite(n)) return n;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

const FUNCTIONS = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  log: Math.log10,
  log10: Math.log10,
  ln: Math.log,
  sqrt: Math.sqrt,
  abs: Math.abs,
  exp: Math.exp,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};

const CONSTANTS = {
  pi: Math.PI,
  e: Math.E,
};

function tokenize(input) {
  const src = String(input)
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/π/g, "pi")
    .replace(/\s+/g, "");
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/[0-9.]/.test(ch)) {
      let s = ch;
      i += 1;
      while (i < src.length && /[0-9.]/.test(src[i])) {
        s += src[i];
        i += 1;
      }
      tokens.push({ t: "num", v: Number(s) });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let s = ch;
      i += 1;
      while (i < src.length && /[a-zA-Z0-9]/.test(src[i])) {
        s += src[i];
        i += 1;
      }
      tokens.push({ t: "id", v: s.toLowerCase() });
      continue;
    }
    if ("+-*/^(),".includes(ch)) {
      tokens.push({ t: ch });
      i += 1;
      continue;
    }
    throw new Error(`Unexpected "${ch}"`);
  }
  return tokens;
}

export function evaluate(expression, vars = {}) {
  const tokens = tokenize(expression);
  let i = 0;
  const peek = () => tokens[i];
  const eat = (t) => {
    const tok = tokens[i];
    if (!tok || (t && tok.t !== t)) throw new Error("Invalid expression");
    i += 1;
    return tok;
  };

  function parseExpr() {
    let left = parseTerm();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = eat().t;
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parsePower();
    while (peek() && (peek().t === "*" || peek().t === "/")) {
      const op = eat().t;
      const right = parsePower();
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  function parsePower() {
    let left = parseUnary();
    if (peek() && peek().t === "^") {
      eat("^");
      const right = parsePower();
      left = left ** right;
    }
    return left;
  }

  function parseUnary() {
    if (peek() && peek().t === "-") {
      eat("-");
      return -parseUnary();
    }
    if (peek() && peek().t === "+") {
      eat("+");
      return parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tok = peek();
    if (!tok) throw new Error("Unexpected end");
    if (tok.t === "num") {
      eat();
      return tok.v;
    }
    if (tok.t === "id") {
      eat();
      if (tok.v in CONSTANTS && (!peek() || peek().t !== "(")) return CONSTANTS[tok.v];
      if (tok.v in vars && (!peek() || peek().t !== "(")) return vars[tok.v];
      if (FUNCTIONS[tok.v]) {
        eat("(");
        const arg = parseExpr();
        eat(")");
        return FUNCTIONS[tok.v](arg);
      }
      throw new Error(`Unknown ${tok.v}`);
    }
    if (tok.t === "(") {
      eat("(");
      const v = parseExpr();
      eat(")");
      return v;
    }
    throw new Error("Invalid expression");
  }

  const value = parseExpr();
  if (i !== tokens.length) throw new Error("Invalid expression");
  return value;
}

export function pmt(principal, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
}

export function amortize({ principal, annualRate, years, extra = 0, tax = 0, insurance = 0 }) {
  const base = pmt(principal, annualRate, years);
  const monthly = base + extra;
  const r = annualRate / 100 / 12;
  let bal = principal;
  let months = 0;
  let interest = 0;
  const cap = years * 12 + 1;
  while (bal > 0.01 && months < cap * 4) {
    const i = bal * r;
    interest += i;
    const principalPay = monthly - i;
    if (principalPay <= 0) break;
    bal = Math.max(0, bal - principalPay);
    months += 1;
  }
  return {
    base,
    monthly: base + tax / 12 + insurance / 12 + extra,
    pi: base,
    months,
    interest,
    payoffYears: months / 12,
  };
}

export function federalTax(income) {
  const deduction = 14600;
  let taxable = Math.max(0, income - deduction);
  const brackets = [
    [11600, 0.1],
    [47150, 0.12],
    [100525, 0.22],
    [191950, 0.24],
    [243725, 0.32],
    [609350, 0.35],
    [Infinity, 0.37],
  ];
  let tax = 0;
  let prev = 0;
  for (const [cap, rate] of brackets) {
    const slice = Math.min(taxable, cap - prev);
    if (slice <= 0) break;
    tax += slice * rate;
    taxable -= slice;
    prev = cap;
  }
  const ss = Math.min(income, 168600) * 0.062;
  const medicare = income * 0.0145;
  return { federal: tax, fica: ss + medicare, total: tax + ss + medicare };
}

export function median(values) {
  const s = [...values].sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function stdev(values, sample = true) {
  if (values.length < 2) return NaN;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const d = values.reduce((a, b) => a + (b - mean) ** 2, 0);
  return Math.sqrt(d / (values.length - (sample ? 1 : 0)));
}

export function parseNumbers(text) {
  return String(text)
    .split(/[^0-9eE.+-]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}
