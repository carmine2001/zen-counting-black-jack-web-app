# Zen Count Trainer — Specifica di Sviluppo

> Documento di specifica per **Claude Code**. Obiettivo: costruire una web app in **Svelte** che alleni l'utente a contare le carte al Black Jack con il metodo **Zen Count**, con velocità regolabile dall'utente.

---

## 1. Obiettivo

Creare un'app di allenamento che mostri carte da gioco una alla volta, a una velocità scelta dall'utente, e lo alleni a mantenere il **running count** con il sistema Zen. A fine sessione l'utente inserisce il conteggio che ha tenuto a mente e l'app gli dice se è corretto, mostrando statistiche di progresso.

L'app deve essere:
- **Mobile-first e pienamente responsive**: l'uso principale è da **cellulare**, quindi il design va pensato prima per lo schermo piccolo e poi adattato al desktop (vedi sezione 11-bis).
- **Semplice e immediata** da usare (poche schermate, nessun login).
- **Configurabile** su velocità e difficoltà.
- **Precisa** nel conteggio (nessun errore di logica: la valutazione dell'utente deve essere sempre affidabile).
- **Offline-first**: gira interamente nel browser, nessun backend.

---

## 2. Valori del conteggio Zen

Il sistema Zen è un conteggio **bilanciato di livello 2**. La somma dei valori su un mazzo completo (52 carte) è **zero**. Questi sono i valori esatti da implementare:

| Carta            | Valore Zen |
|------------------|:----------:|
| 2, 3, 7          |    **+1**  |
| 4, 5, 6          |    **+2**  |
| 8, 9             |     **0**  |
| 10, J, Q, K      |    **−2**  |
| Asso (A)         |    **−1**  |

Definire questi valori in un **unico oggetto/mappa costante** (`ZEN_VALUES`) usato come sorgente di verità per tutta la logica di conteggio. Nessun valore "magico" sparso nel codice.

```js
// esempio di riferimento
export const ZEN_VALUES = {
  '2': 1, '3': 1, '7': 1,
  '4': 2, '5': 2, '6': 2,
  '8': 0, '9': 0,
  '10': -2, 'J': -2, 'Q': -2, 'K': -2,
  'A': -1,
};
```

**Verifica automatica (test di sanità):** all'avvio, calcolare la somma dei valori Zen su un mazzo completo di 52 carte e assicurarsi che sia esattamente `0`. Se non lo è, i valori sono sbagliati.

---

## 3. Stack tecnico

- **Framework:** Svelte (con **Vite** come build tool — `npm create vite@latest` template `svelte`). SvelteKit non è necessario ma è accettabile se preferito.
- **Linguaggio:** JavaScript (TypeScript opzionale ma gradito per la sicurezza dei tipi sui valori delle carte).
- **Styling:** CSS puro o un layer leggero (niente framework CSS pesanti). L'app deve essere pulita, leggibile e ben contrastata — le carte devono essere GRANDI e chiare perché vengono lette rapidamente.
- **Persistenza:** `localStorage` per salvare impostazioni preferite e statistiche storiche. (Nota: se sviluppato come artifact, usare stato in memoria; ma per un progetto Claude Code standalone `localStorage` va bene.)
- **Nessun backend, nessuna dipendenza di rete a runtime.**
- **Lingua UI:** Italiano.

---

## 4. Modello del mazzo

- Un mazzo = 52 carte (4 semi × 13 ranghi).
- L'utente può scegliere il **numero di mazzi** (1, 2, 4, 6, 8) per simulare le condizioni reali di uno "shoe". Default: **6 mazzi** (condizione da casinò tipica).
- Le carte vengono **mescolate** (Fisher–Yates shuffle) a inizio sessione.
- Ogni carta ha: `rank` (2–10, J, Q, K, A), `suit` (♠ ♥ ♦ ♣), e un `zenValue` derivato da `ZEN_VALUES`.
- I semi servono solo per il realismo visivo: **non influenzano il conteggio** (il colore/seme è irrilevante nello Zen).

---

## 5. Controllo della velocità (requisito centrale)

L'utente sceglie la velocità in base a quanto è bravo. La velocità è l'intervallo di tempo per cui ogni carta resta visibile.

- **Range:** da **2000 ms (2 secondi)** — la più lenta/facile — fino a un minimo di **300 ms** — la più veloce/difficile.
- **Controllo:** uno **slider** con valori discreti + una visualizzazione numerica del tempo corrente (es. "1.2 s").
- **Preset di difficoltà** rapidi (bottoni), che impostano lo slider:
  - **Principiante** → 2000 ms
  - **Facile** → 1500 ms
  - **Medio** → 1000 ms
  - **Difficile** → 600 ms
  - **Esperto** → 300 ms
- Step dello slider consigliato: **100 ms**.
- La velocità scelta viene salvata in `localStorage` e ripristinata alla riapertura.

> Nota di design: più basso è il tempo, più difficile è il conteggio. Rendere questa relazione visivamente chiara (etichetta "più lento = più facile" / "più veloce = più difficile").

---

## 6. Impostazioni della sessione

Schermata iniziale (prima di iniziare) con questi controlli:

1. **Velocità** (slider + preset) — come sopra.
2. **Numero di mazzi** (1 / 2 / 4 / 6 / 8).
3. **Numero di carte da mostrare** nella sessione:
   - Opzioni: 20, 52, 104, "mazzo intero", oppure un valore custom.
   - Alternativa: mostrare **tutte** le carte dello shoe scelto.
4. **Mostra valore Zen sotto ogni carta** (toggle ON/OFF) — utile in modalità apprendimento (ON) e da spegnere quando ci si allena sul serio (OFF).
5. **Mostra running count in tempo reale** (toggle ON/OFF) — di default **OFF** (altrimenti non ci si allena). Utile ON solo per i primissimi tentativi.

Le impostazioni vengono ricordate tra le sessioni.

---

## 7. Flusso dell'app (schermate)

### 7.1 Schermata Impostazioni / Home
- Titolo, breve descrizione.
- Tabella di riferimento dei valori Zen (collassabile).
- Tutti i controlli della sezione 6.
- Bottone grande **"Inizia allenamento"**.

### 7.2 Schermata Allenamento (la sessione)
- Al centro: **una carta grande**, ben leggibile (rango + seme).
- La carta cambia automaticamente ogni `intervallo` ms.
- Elementi opzionali (se attivati nelle impostazioni):
  - Valore Zen della carta corrente sotto di essa.
  - Running count corrente in un angolo.
- Indicatore di avanzamento: "Carta 12 / 52".
- Bottoni: **Pausa/Riprendi**, **Stop** (interrompe e va alla valutazione).
- La sessione termina automaticamente quando finiscono le carte.

### 7.3 Schermata Valutazione (fine sessione)
- Campo input: **"Qual è il tuo running count?"** (accetta numeri positivi/negativi, anche 0).
- Bottone **"Verifica"**.
- Risultato:
  - ✅ **Corretto** oppure ❌ **Sbagliato**.
  - Mostra il **running count reale**.
  - Mostra la **differenza** (di quanto ha sbagliato).
  - **Bonus true count:** mostra anche il *true count* = running count reale ÷ mazzi rimanenti (arrotondato), spiegando brevemente cos'è. Opzionalmente chiedere all'utente anche il true count stimato.
- Statistiche della sessione: velocità usata, numero di carte, tempo totale.
- Bottoni: **"Rivedi le carte"** (mostra la sequenza completa con i valori, per capire dove si è sbagliato), **"Nuova sessione"**, **"Torna alle impostazioni"**.

### 7.4 Schermata Statistiche (storico)
- Percentuale di sessioni corrette.
- Streak attuale e migliore.
- Grafico/elenco semplice degli ultimi risultati (data, velocità, esito, errore).
- Bottone per azzerare le statistiche.

---

## 8. Logica di conteggio (cuore dell'app)

- Mantenere internamente un **running count reale** aggiornato ad ogni carta mostrata (`runningCount += card.zenValue`).
- Questo valore reale **non è mostrato** all'utente durante la sessione (a meno del toggle di sezione 6).
- Alla valutazione, confrontare l'input dell'utente con il running count reale.
- **True count** = `runningCount / mazziRimanenti`, dove `mazziRimanenti = carteRimaste / 52`. Alla fine di una sessione che consuma l'intero shoe, i mazzi rimanenti tendono a essere pochi; calcolare il true count sul punto di stop.
- Tutti i calcoli devono essere deterministici e verificabili. Includere qualche **unit test** (anche minimale) sulla funzione di conteggio.

---

## 9. Modalità di allenamento (funzionalità)

Implementare almeno la **Modalità Standard** (obbligatoria). Le altre sono miglioramenti graditi:

1. **Standard (obbligatoria):** carte a scorrimento automatico → l'utente tiene il conteggio → valutazione finale. È il flusso descritto sopra.
2. **Modalità Apprendimento (consigliata):** velocità lenta, valore Zen e running count sempre visibili, per memorizzare i valori.
3. **Modalità Flash a coppie (opzionale):** mostra 2 carte insieme (come richiede a volte il gioco reale) per allenare la somma rapida di coppie.
4. **Allenamento di velocità progressiva (opzionale):** la velocità aumenta gradualmente durante la sessione (parte da 2s e accelera), per spingere i limiti dell'utente.

---

## 10. Struttura del progetto (indicativa)

```
zen-count-trainer/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── App.svelte
│   ├── lib/
│   │   ├── zen.js            # ZEN_VALUES, funzioni di conteggio, test di sanità
│   │   ├── deck.js           # creazione mazzo, shuffle, gestione shoe
│   │   └── storage.js        # wrapper localStorage per impostazioni e statistiche
│   ├── components/
│   │   ├── Settings.svelte   # schermata impostazioni/home
│   │   ├── Trainer.svelte    # schermata allenamento (loop delle carte)
│   │   ├── Card.svelte       # rendering singola carta
│   │   ├── Evaluation.svelte # schermata valutazione finale
│   │   └── Stats.svelte      # schermata statistiche
│   └── stores/
│       └── session.js        # store Svelte per stato sessione e impostazioni
└── README.md
```

---

## 11. Dettagli implementativi

- **Timer:** usare `setTimeout`/`setInterval` con pulizia corretta (`onDestroy`) per evitare leak. Alla pausa, fermare il timer; alla ripresa, riavviarlo con l'intervallo corrente.
- **Rendering carta:** rango grande al centro, semi ♠♥♦♣ con colori corretti (cuori/quadri rossi, picche/fiori neri). Carta ben leggibile anche a velocità alte.
- **Accessibilità:** contrasto elevato, font grande, l'app deve funzionare su desktop e mobile (responsive).
- **Input tastiera:** durante l'allenamento, spazio = pausa/riprendi. Nella valutazione, Invio = verifica.
- **Robustezza:** gestire l'input della valutazione (accettare numeri negativi, gestire input vuoto, no crash).
- **Reset pulito:** "Nuova sessione" deve rimescolare e azzerare correttamente lo stato.

---

## 11-bis. Requisiti mobile / responsive (prioritari)

L'app viene usata **principalmente da cellulare**. Il design deve essere **mobile-first**: progettare prima per schermi stretti (~360–430 px di larghezza) e poi espandere verso desktop, non il contrario.

- **Layout fluido:** usare unità relative (`%`, `rem`, `vw/vh`, `clamp()`) e Flexbox/Grid. Niente larghezze fisse in pixel che spezzano il layout su schermi piccoli.
- **Viewport:** includere `<meta name="viewport" content="width=device-width, initial-scale=1">` in `index.html`.
- **Carta ben visibile su piccolo schermo:** la carta centrale deve occupare gran parte dello spazio disponibile e restare leggibilissima anche a colpo d'occhio. Dimensionare il rango con `clamp()` (es. font che scala con la larghezza dello schermo). A velocità alte, la leggibilità istantanea su mobile è tutto.
- **Bottoni "thumb-friendly":** area toccabile di almeno **44×44 px**, ben distanziati, raggiungibili con il pollice (preferibilmente nella metà bassa dello schermo durante l'allenamento). Niente elementi cliccabili minuscoli o troppo vicini.
- **Controlli touch:**
  - Lo **slider velocità** deve essere comodo da trascinare col dito (thumb grande).
  - **Pausa/Riprendi** deve essere azionabile con un tap ampio; opzionalmente **tap sull'area della carta** = pausa/riprendi (comodo con una mano).
  - I preset di difficoltà sono bottoni grandi a griglia.
- **Input valutazione su mobile:** il campo "running count" deve aprire la **tastiera numerica** (`inputmode="numeric"` con supporto ai negativi, oppure bottoni +/− accanto al campo per evitare di digitare). Il bottone "Verifica" grande e a portata di pollice.
- **Orientamento:** funzionare bene in **verticale (portrait)**; in orizzontale (landscape) non deve rompersi. Non forzare un orientamento.
- **Niente hover-dipendenze:** nessuna funzione deve richiedere il passaggio del mouse (`:hover`); tutto deve funzionare al tocco. Usare stati `:active`/`:focus-visible` per il feedback.
- **Testo leggibile senza zoom:** dimensione base ≥ 16 px per evitare lo zoom automatico dei campi su iOS.
- **Performance:** il loop delle carte deve restare fluido anche su telefoni di fascia media; evitare re-render inutili e animazioni pesanti.
- **Safe areas:** rispettare le "safe area" dei telefoni con notch (usare `env(safe-area-inset-*)` dove serve, es. barra bottoni in basso).
- **PWA (opzionale, gradito):** aggiungere un `manifest.json` e icone così l'app è **installabile sulla home del telefono** e utilizzabile a schermo intero come un'app nativa.

**Verifica finale:** testare il layout a larghezze rappresentative — **360 px, 390 px, 430 px** (telefoni) e almeno un breakpoint tablet/desktop — assicurandosi che nulla vada in overflow, che i bottoni siano comodi e che la carta resti grande e leggibile.

---

## 12. Criteri di completamento (definition of done)

- [ ] I valori Zen sono corretti e il test di sanità (somma = 0 su 52 carte) passa.
- [ ] L'utente può scegliere la velocità da 2000 ms a 300 ms tramite slider + preset.
- [ ] Le carte scorrono automaticamente alla velocità scelta.
- [ ] Il running count reale è calcolato correttamente e nascosto durante la sessione.
- [ ] La valutazione finale confronta input utente vs count reale e mostra la differenza.
- [ ] Viene mostrato il true count.
- [ ] Impostazioni e statistiche persistono in `localStorage`.
- [ ] Pausa/Stop funzionano correttamente.
- [ ] L'app è **mobile-first e responsive**: testata a 360/390/430 px senza overflow, carta grande e leggibile, bottoni comodi al pollice.
- [ ] Il campo di valutazione apre la tastiera numerica su mobile e accetta valori negativi.
- [ ] Nessuna funzione dipende da `:hover`; tutto usabile al tocco.
- [ ] README con istruzioni per avviare (`npm install`, `npm run dev`).

---

## 13. Extra / miglioramenti futuri (opzionali)

- Suono/tick opzionale ad ogni carta per ritmare il conteggio.
- Modalità "penetrazione" configurabile (fermarsi al 75% dello shoe, come nei casinò reali).
- Suggerimento di strategia di puntata in base al true count (solo didattico).
- Esportazione delle statistiche in CSV.
- Tema chiaro/scuro.

---

### Nota per lo sviluppatore

Questa app è uno **strumento didattico** per allenare una competenza di calcolo mentale. Il focus deve essere sulla **precisione della logica di conteggio** e sulla **chiarezza visiva** a velocità elevate: sono i due fattori che determinano se l'allenamento è efficace.
