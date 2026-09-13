# Decision Sprint

Responsive React + Vite decision tool.

Use Node.js 24 and pnpm 11:

```sh
pnpm install --frozen-lockfile
pnpm dev --host 127.0.0.1
```

Open http://127.0.0.1:5173/ for development.

## GitHub Pages

Public site: https://elinxxy1307-cloud.github.io/decision_sprint/

`.github/workflows/deploy.yml` installs locked dependencies, runs lint and tests, builds, and deploys `dist` on pushes to `main` or manual dispatch. Repository Settings → Pages → Source must be **GitHub Actions**.

Production builds use `/decision_sprint/` as the Vite base path. Run `pnpm build` and `pnpm preview`, then open http://localhost:4173/decision_sprint/ to check the production build locally.

Completed decisions are saved in Supabase public.decisions for the signed-in owner. Each browser origin migrates its legacy history on first authenticated use; verified writes precede removal of the unchanged local snapshot.

## Flow

Start a Decision → category → options → choose and rank three priorities in the Top 3 area → rate options one priority at a time → weighted recommendation → optional coin flip → reaction → user-selected final choice → save to your account.

The app also includes Recent Decisions, detail views, and My Patterns after five completed decisions. The first load has no fabricated history; “Try an example” only fills an unsaved draft.

## Mock boundaries

Scoring uses rank weights 3, 2, and 1. Each option’s score is the weighted sum divided by the maximum 30 and rounded to 0–100. Ties are shown explicitly, while the user still chooses the final option.

Legacy decisions were stored under `decision-sprint:completed:v1` in localStorage with IDs, timestamps, category, options, selected criteria and ranks, raw ratings, normalized option scores, recommendation, coin-flip state and reaction, final choice, and duration. My Patterns computes counts, averages, tie-breaker rate, reactions, category and priority frequencies, and recommendation follow rate directly from those records.

Supabase provides email/password accounts and private decision storage. There is no payment, LLM API, chatbot, personality analysis, or fabricated pattern data. The coin animation and the example are UI conveniences; scoring, history, and pattern calculations are real local logic.

No payments, personality test, compatibility scoring, or long-term profiling.

## Validation

```sh
pnpm build
pnpm lint
pnpm test
```

### Decision Atlas interface
The main screens use a floating Home / Decide / Patterns navigation. Patterns keeps
the existing five-completed-decision unlock. A compact 280px map represents every
saved decision, with category-grouped markers and chronological route lines.
Category, priority, and coin-reaction filters highlight actual matching records;
node and metric details open in keyboard-accessible native dialog sheets.

The bento summaries derive pace, category shares, priority frequencies, tie-breaker
usage and recommendation follow rate from the signed-in account’s history. Home's weekly count uses
the local Monday boundary. There are no synthetic metric values. The map positions
are illustrative, not geographic or psychological distances. The forked-path
companion is an inline SVG with contextual expressions and accessories.

Top priorities support desktop dragging, touch dragging by the numbered handle,
and accessible arrow buttons. Coin motion lasts 750ms; reduced-motion preference
disables decorative animation. Recommendation weights and localStorage schema
remain unchanged.

### Calm Decision Playground — desktop refresh
The current presentation uses a centered 1240px desktop layout with Home, Atlas,
and Patterns navigation; the bottom navigation is mobile-only (700px and below).
Home combines the Decision Dial compass, three switchable examples, recent
decisions and a local-Monday weekly reflection. SVG/CSS character animation
includes pointer movement, cursor-following eyes, click spin and coin reaction.

Atlas now groups records into six illustrated category regions. Paths illustrate
terrain only and do not imply connections between unrelated decisions. Category,
method and time filters operate on saved records. Confidence is explicitly
“Not recorded”; no proxy confidence or new stored field is introduced.

Patterns retains the five-decision unlock and presents expandable observations
with supporting records. The lower disclosure retains category/priority counts,
pace and reaction metrics. No confidence or revisit conclusions are fabricated.
The scoring engine, final choice flow and localStorage schema are unchanged.

### Illustrated scenery pass
Confidence has been removed from Atlas filters, marker previews and detail copy.
No confidence data was previously collected, and the storage format is unchanged.

Reusable SVG scenes now provide category landmarks, terrain, trees, benches,
water routes, small islands and a sailboat. Atlas pins open local previews before
the existing decision detail. Patterns follow alternating journey stops with
wayfinding objects and contextual companions. Insight detail uses a field-notebook
treatment and an actual supporting-record proportion ring. Home adds illustrated
category pebbles, cloud/hill layers, alternating thoughts and a river-shaped
example ribbon. Reduced-motion preferences disable decorative movement.

## Email/password accounts

Copy `.env.example` to `.env.local` and provide the project URL and browser-safe publishable key. Never use a secret or service-role key in a `VITE_` variable. GitHub Pages builds read the same names from GitHub repository Actions variables.

The header account dialog supports registration with matching passwords (minimum 8 characters), email confirmation when required by Supabase, password login, persisted sessions, and logout on this device. Passwords are not stored by application code. Supabase manages authentication sessions separately from the existing decision storage key.

Decision records use the existing protected `public.decisions` table. The client only performs SELECT, INSERT and DELETE with an owner filter; RLS enforces ownership. No UPDATE/upsert or schema changes are required. Frontend configuration uses only the project URL and publishable key.

Migration binds the legacy snapshot to the first signed-in owner before writing. Each record keeps its UUID; retries accept an existing record only when all persisted fields match. Failure retains the browser copy. The unchanged legacy snapshot is removed only after every cloud write is verified. An ownership marker remains to prevent another account importing leftovers. Logout clears account records from React state; drafts remain in memory only. Derived scores and patterns are recalculated from stored ratings using scoring version 1.


## Atlas coverage and Patterns evidence

Atlas is a coverage map with milestones at 5 (Decision Landscape) and 10 (Decision Dimensions). Category islands retain record previews; recorded dimension nodes link to Patterns analysis. Mobile uses a vertical discovery route.

Patterns uses reusable selectors in decisionInsights.js. Fewer than three supporting records are suppressed; sample sizes of 3–4 are emerging, while consistent frequency labels require at least ten observations and 80% support. Comparative signals require at least three records in each cohort and never receive an automatic consistency label. Tied highest-scored options all count as a comparison match. Close scores have a top-two gap of at most ten points out of 100. Priority filtering selects observations without reducing their evidence denominator. Reaction evidence uses coin-flip records as the denominator and only the matching reaction as supporting records.

Confidence and later outcomes are not collected and are never inferred from a coin reaction. No database changes or analytics dependency were added.
