# Piano di implementazione — Zen Count Trainer

Basato su `zen-count-trainer-spec.md` (root del progetto).

## 0. Setup iniziale
- Inizializzare repo git nella root (`blackJack` non è ancora un repo git).
- Scaffolding progetto con Vite + template `svelte-ts` (**TypeScript**, confermato).
- Struttura cartelle come da sezione 10 della spec (estensioni `.ts`).

## 1. Core logic (nessuna UI, testabile in isolamento)
- `src/lib/zen.ts`: `ZEN_VALUES`, funzione `zenValueOf(card)`, test di sanità (somma = 0 su 52 carte) eseguito all'avvio.
- `src/lib/deck.ts`: creazione carte (rank × suit), costruzione shoe (N mazzi), shuffle Fisher–Yates.
- `src/lib/storage.ts`: wrapper `localStorage` (get/set con default, namespacing chiavi) per impostazioni e statistiche.
- Unit test minimali per `zen.ts` e `deck.ts` (Vitest).

## 2. Stato sessione
- `src/stores/session.ts`: store Svelte per impostazioni (velocità, n. mazzi, n. carte, toggle valore Zen/running count) e stato sessione corrente (shoe, indice carta, running count reale, timer, pausa/stop).

**Stato: blocco 0-2 completato.**
- Scaffolding Vite + svelte-ts creato nella root, repo git inizializzato (branch `main`), demo template rimossa.
- `src/lib/zen.ts`, `src/lib/deck.ts`, `src/lib/storage.ts` implementati.
- `src/stores/session.ts` implementato (store impostazioni con persistenza + store stato run).
- Test Vitest (`zen.test.ts`, `deck.test.ts`): 9/9 passati. `pnpm check` (svelte-check + tsc): 0 errori. `pnpm build`: ok.
- `App.svelte` è un placeholder minimo (chiama `assertZenValuesSanity()` all'avvio) in attesa del blocco 3 (UI).

**Stato: blocco 3 (UI) implementato, in attesa di test manuale dell'utente.**
- `src/components/Card.svelte`, `Settings.svelte`, `Trainer.svelte`, `Evaluation.svelte`, `Stats.svelte` implementati.
- `src/lib/trueCount.ts` (+ test) aggiunto per il calcolo true count.
- `src/App.svelte` fa da router tra le 4 schermate basandosi sullo store `screen`.
- `src/app.css` riscritto: design system mobile-first (nessuna dipendenza da `:hover`, bottoni ≥44px, safe-area, font base 16px).
- `pnpm check`: 0 errori. `pnpm test`: 13/13 passati. `pnpm build`: ok.
- Dev server avviato su http://localhost:5173 — **non testato visivamente da Claude** (nessun tool browser disponibile in sessione), da verificare manualmente dall'utente.

Prossimo: dopo conferma utente, verificare requisiti mobile a 360/390/430px (sezione 11-bis) e checklist definition of done (sezione 12), poi README finale.

## 3. Componenti UI (mobile-first)
- `Card.svelte`: rendering singola carta (rango grande, seme colorato), font scalabile con `clamp()`.
- `Settings.svelte`: schermata impostazioni/home (slider velocità + preset, selettori mazzi/carte, toggle, tabella valori Zen collassabile, bottone "Inizia allenamento").
- `Trainer.svelte`: loop carte con `setInterval`/`setTimeout` (pulizia in `onDestroy`), pausa/riprendi, stop, tap-carta-per-pausa, indicatore progresso, input tastiera (spazio = pausa).
- `Evaluation.svelte`: input running count (`inputmode="numeric"`, bottoni +/−), verifica, esito, differenza, true count, statistiche sessione, "Rivedi le carte".
- `Stats.svelte`: storico sessioni, percentuale corrette, streak, reset statistiche.
- `App.svelte`: routing semplice tra le 4 schermate (stato locale, no router esterno — non serve per 4 view).

## 4. Dettagli mobile/responsive (sezione 11-bis)
- Viewport meta, layout fluido (%, rem, clamp), bottoni ≥44×44px, `:active`/`:focus-visible` invece di `:hover`, safe-area insets, font base ≥16px.
- Verifica manuale a 360/390/430px + un breakpoint desktop (devtools responsive mode).

## 5. Extra opzionali (solo se c'è tempo/richiesta esplicita dopo il core)
- Modalità Apprendimento, Flash a coppie, velocità progressiva, PWA (manifest+icone).
- Questi restano fuori dallo scope del primo giro di lavoro salvo conferma.

## 6. Finalizzazione
- README con istruzioni (`npm install`, `npm run dev`, `npm run build`).
- Verifica checklist "definition of done" (sezione 12 della spec).
- Commit iniziale.

---

**Domande prima di partire:**
1. JS puro o TypeScript per il progetto?
2. Procedo con lo scaffolding + core logic (punti 0–2) come primo blocco di lavoro, poi mi fermo per una verifica prima di passare alla UI?
