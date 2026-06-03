# Find My Car 🚗

A guided tool that takes a confused car buyer from *"I don't know what to buy"* to a
confident shortlist. Answer five quick questions → get a ranked list of cars with a
match % and plain-English reasons → compare your top picks side by side.

Built for the Indian market (CarDekho context): prices in ₹ lakhs, real makes/models
(Swift, Nexon, Creta, Scorpio-N, Innova, ZS EV…).

---

## 1. What I built & why

The buyer's problem isn't *lack of data* — CarDekho already has specs on everything.
It's **decision paralysis**. So the whole app is built around reducing choices to a
trustworthy few:

1. **A 5-question quiz** — budget, body type, fuel, primary use, top priority. Body and
   fuel default to "Any" so an undecided buyer isn't forced to pretend they know.
2. **A scoring engine** — every car is scored 0-100 against the answers across five
   weighted factors (priority and primary-use weighted highest), and each result carries
   **2-3 reasons in plain English** ("5-star safety — among the safest here"). The
   reasons matter as much as the rank: a shortlist you don't understand isn't trustworthy.
3. **A compare view** — pick up to 3, see them side by side with the best value in each
   row highlighted, so the final call is easy.

### What I deliberately cut

- **No auth / accounts.** The job is "help me decide," not "manage my profile." Login is
  pure friction for a first-time anonymous buyer and adds zero decision value.
- **No database.** The dataset is ~26 cars in a JSON file loaded into memory. A DB would
  be ceremony at this size — it adds setup, migrations, and a moving part to the
  "runs in under 2 minutes" promise, for no functional gain. The data layer is isolated
  behind `getCars()`, so swapping in SQLite later is a one-file change.
- **No payments / dealer flow.** Out of scope — the brief ends at "confident shortlist,"
  not "transact."

These cuts kept the time budget on the part that actually helps the buyer: the scoring
logic and the reasons.

---

## 2. Tech stack & why

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **React + TypeScript + Tailwind, Vite** | Vite = instant dev server, zero-config TS. Tailwind = fast, consistent UI without a component library. Types catch shape mismatches against the API. |
| Backend | **Node + Express + TypeScript** | Smallest possible HTTP layer. Express is boring and reliable; TS shares the same mental model as the frontend. |
| Data | **Seeded JSON + a pure scoring engine** | The dataset is static and small, so in-memory JSON is the right size. The scoring lives in `recommend.ts` as a **pure function** — no Express, no I/O — so it's trivial to reason about and test. |

The scoring engine being framework-free is the one architectural decision I'd defend
hardest: the product *is* the scoring, so it shouldn't be tangled in route handlers.

---

## 3. AI vs. manual

**Delegated to AI (Claude Code):**
- Scaffolding — `package.json`s, tsconfig, Tailwind/PostCSS config, Express boilerplate.
- The seed dataset — generating 26 plausible Indian cars with realistic specs.
- Repetitive UI — turning a described layout into Tailwind markup (cards, the compare table).

**Did / drove manually:**
- **The scoring model** — the factors, their weights, and how "Any" answers become no-ops.
  This is the core product logic; I specified it precisely rather than accepting a guess.
- **Scoping** — what to cut (auth/DB/payments) and the screen flow (quiz → results → compare).
- **Review & course-correction** — I read every diff and ran builds/smoke tests after each step.

**Where AI helped most:** boilerplate and the dataset — easily an hour saved, and it let me
spend the time on logic instead of typing config.

**Where it got in the way:**
- Tailwind/TS setup needed two real fixes the tool got wrong first: a referenced `tsconfig`
  project can't disable emit, and `import.meta.env` needs `vite/client` types. Generic.
- A root `postinstall` using `npm install --prefix` recursed infinitely (re-read the root
  `package.json`). Switching to `cd`-based installs fixed it. A case where reading the
  actual error beat trusting the first generated answer.

---

## 4. If I had 4 more hours

- **Real review aggregation** — replace the single `userRating` number with aggregated
  user reviews (counts, sentiment, common themes) feeding into the score.
- **SQLite persistence** — move the dataset behind SQLite so it can grow past a JSON file
  and support real filtering/queries. (Already isolated behind the data layer.)
- **EMI calculator** — most Indian buyers think in monthly payments, not ex-showroom price.
  A down-payment + tenure → EMI estimate per car would map straight to how people decide.
- **Save / share shortlist** — a shareable link so a buyer can show family before deciding.

---

## 5. Run it locally (single command)

**Prerequisites:** Node 18+.

```bash
npm install     # installs root + auto-installs backend & frontend
npm run dev     # boots backend (:5000) and frontend (:5173) together
```
``` Frontend Env
VITE_API_URL=http://localhost:5000
```

Then open **http://localhost:5173**.

> `npm install` runs a `postinstall` that installs both `backend/` and `frontend/`.
> `npm run dev` uses `concurrently` to run both servers in one terminal.

### Run separately (optional)

```bash
cd backend && npm run dev      # API on http://localhost:5000
cd frontend && npm run dev     # UI on http://localhost:5173
```

The frontend reads the API base URL from `frontend/.env` (`VITE_API_URL`, default
`http://localhost:5000`).

### API

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/cars` | Full dataset |
| GET | `/api/cars/:id` | One car |
| POST | `/api/recommend` | Quiz answers → ranked shortlist with reasons |
| POST | `/api/compare` | Up to 3 cars by id |
