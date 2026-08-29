<script lang="ts">
  import { settings, run, screen } from '../stores/session';
  import { ZEN_VALUES, RANKS } from '../lib/zen';
  import type { NumCardsOption } from '../lib/storage';

  const SPEED_PRESETS = [
    { label: 'Principiante', ms: 2000 },
    { label: 'Facile', ms: 1500 },
    { label: 'Medio', ms: 1000 },
    { label: 'Difficile', ms: 600 },
    { label: 'Esperto', ms: 300 },
  ];

  const DECK_OPTIONS = [1, 2, 4, 6, 8] as const;
  const CARD_COUNT_OPTIONS: { label: string; value: NumCardsOption }[] = [
    { label: '20', value: 20 },
    { label: '52', value: 52 },
    { label: '104', value: 104 },
    { label: 'Mazzo intero', value: 'full' },
  ];

  let zenTableOpen = $state(false);

  let customCards = $state('');
  const isCustomSelected = $derived(
    !CARD_COUNT_OPTIONS.some((opt) => opt.value === $settings.numCards),
  );

  function setSpeed(ms: number) {
    settings.update((s) => ({ ...s, speedMs: ms }));
  }

  function setDecks(n: (typeof DECK_OPTIONS)[number]) {
    settings.update((s) => ({ ...s, numDecks: n }));
  }

  function setNumCards(value: NumCardsOption) {
    settings.update((s) => ({ ...s, numCards: value }));
  }

  function applyCustomCards() {
    const n = parseInt(customCards, 10);
    if (Number.isFinite(n) && n > 0) {
      setNumCards(n);
    }
  }

  function toggleZenValue() {
    settings.update((s) => ({ ...s, showZenValue: !s.showZenValue }));
  }

  function toggleRunningCount() {
    settings.update((s) => ({ ...s, showRunningCount: !s.showRunningCount }));
  }

  function startTraining() {
    run.start($settings);
    screen.set('trainer');
  }

  function goToStats() {
    screen.set('stats');
  }
</script>

<div class="settings">
  <h1>Zen Count Trainer</h1>
  <p class="subtitle">Allena il conteggio carte con il sistema Zen.</p>

  <section class="block">
    <button class="collapsible" onclick={() => (zenTableOpen = !zenTableOpen)} aria-expanded={zenTableOpen}>
      <span>Tabella valori Zen</span>
      <span class="chevron" class:open={zenTableOpen}>▾</span>
    </button>
    {#if zenTableOpen}
      <table class="zen-table">
        <thead>
          <tr><th>Carta</th><th>Valore</th></tr>
        </thead>
        <tbody>
          {#each RANKS as rank}
            <tr>
              <td>{rank}</td>
              <td>{ZEN_VALUES[rank] > 0 ? '+' : ''}{ZEN_VALUES[rank]}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <section class="block">
    <h2>Velocità</h2>
    <p class="hint">più lento = più facile · più veloce = più difficile</p>
    <div class="speed-value">{($settings.speedMs / 1000).toFixed(1)} s</div>
    <input
      type="range"
      min="300"
      max="2000"
      step="100"
      value={$settings.speedMs}
      oninput={(e) => setSpeed(Number((e.target as HTMLInputElement).value))}
      aria-label="Velocità in millisecondi"
    />
    <div class="preset-grid">
      {#each SPEED_PRESETS as preset}
        <button
          class="btn"
          class:btn-primary={$settings.speedMs === preset.ms}
          onclick={() => setSpeed(preset.ms)}
        >
          {preset.label}
        </button>
      {/each}
    </div>
  </section>

  <section class="block">
    <h2>Numero di mazzi</h2>
    <div class="option-grid">
      {#each DECK_OPTIONS as n}
        <button class="btn" class:btn-primary={$settings.numDecks === n} onclick={() => setDecks(n)}>
          {n}
        </button>
      {/each}
    </div>
  </section>

  <section class="block">
    <h2>Carte da mostrare</h2>
    <div class="option-grid">
      {#each CARD_COUNT_OPTIONS as opt}
        <button
          class="btn"
          class:btn-primary={$settings.numCards === opt.value}
          onclick={() => setNumCards(opt.value)}
        >
          {opt.label}
        </button>
      {/each}
    </div>
    <div class="custom-cards">
      <input
        type="number"
        inputmode="numeric"
        min="1"
        placeholder="Personalizzato"
        bind:value={customCards}
        class:active={isCustomSelected}
      />
      <button class="btn" onclick={applyCustomCards}>Usa</button>
    </div>
  </section>

  <section class="block toggles">
    <label class="toggle-row">
      <span>Mostra valore Zen sotto ogni carta</span>
      <input type="checkbox" checked={$settings.showZenValue} onchange={toggleZenValue} />
    </label>
    <label class="toggle-row">
      <span>Mostra running count in tempo reale</span>
      <input type="checkbox" checked={$settings.showRunningCount} onchange={toggleRunningCount} />
    </label>
  </section>

  <button class="btn btn-primary btn-start" onclick={startTraining}>Inizia allenamento</button>
  <button class="btn btn-stats" onclick={goToStats}>Statistiche</button>
</div>

<style>
  .settings {
    padding: 1.25rem 1rem 2rem;
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    color: var(--text-muted);
  }

  .block {
    margin-bottom: 1.5rem;
  }

  .block h2 {
    font-size: 1.1rem;
  }

  .hint {
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  .collapsible {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    min-height: 44px;
    font-weight: 600;
  }

  .chevron {
    transition: transform 0.15s;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .zen-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
    font-size: 0.95rem;
  }

  .zen-table th,
  .zen-table td {
    border-bottom: 1px solid var(--border);
    padding: 0.35rem 0.5rem;
    text-align: center;
  }

  .speed-value {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0.5rem 0;
  }

  input[type='range'] {
    width: 100%;
    height: 2.75rem;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    touch-action: manipulation;
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 0.5rem;
    border-radius: 999px;
    background: var(--border);
  }

  input[type='range']::-moz-range-track {
    height: 0.5rem;
    border-radius: 999px;
    background: var(--border);
  }

  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 2rem;
    height: 2rem;
    margin-top: -0.75rem;
    border-radius: 50%;
    background: var(--accent);
    border: 3px solid var(--bg);
    box-shadow: var(--shadow);
  }

  input[type='range']::-moz-range-thumb {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--bg);
    border-radius: 50%;
    background: var(--accent);
    box-shadow: var(--shadow);
  }

  input[type='range']:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
  }

  .preset-grid,
  .option-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .custom-cards {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .custom-cards input {
    flex: 1;
  }

  .custom-cards input.active {
    border-color: var(--accent);
  }

  .toggles {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    min-height: 44px;
  }

  .toggle-row input {
    width: 1.5rem;
    height: 1.5rem;
  }

  .btn-start {
    font-size: 1.15rem;
    padding: 1rem;
  }

  .btn-stats {
    margin-top: 0.75rem;
  }
</style>
