<script lang="ts">
  import { run, settings, screen } from '../stores/session';
  import { computeDecksRemaining, computeTrueCount } from '../lib/trueCount';
  import { appendHistory } from '../lib/storage';

  let userInput = $state('');
  let verified = $state(false);
  let userCount = $state(0);
  let error = $state('');
  let showReview = $state(false);

  const cardsShown = $derived($run.currentIndex + 1);
  const totalCardsInShoe = $derived($settings.numDecks * 52);
  const decksRemaining = $derived(computeDecksRemaining(totalCardsInShoe, cardsShown));
  const trueCount = $derived(computeTrueCount($run.runningCount, decksRemaining));
  const durationMs = $derived(($run.finishedAt ?? Date.now()) - ($run.startedAt ?? Date.now()));
  const diff = $derived(userCount - $run.runningCount);
  const isCorrect = $derived(userCount === $run.runningCount);

  function parseInput(): number | null {
    const trimmed = userInput.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
    return n;
  }

  function verify() {
    const n = parseInput();
    if (n === null) {
      error = 'Inserisci un numero intero valido (es. -3, 0, 5).';
      return;
    }
    error = '';
    userCount = n;
    verified = true;
    appendHistory({
      date: new Date().toISOString(),
      speedMs: $settings.speedMs,
      numCardsShown: cardsShown,
      correct: n === $run.runningCount,
      userCount: n,
      realCount: $run.runningCount,
      diff: n - $run.runningCount,
    });
  }

  function adjust(delta: number) {
    const current = parseInput() ?? 0;
    userInput = String(current + delta);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') verify();
  }

  function newSession() {
    run.start($settings);
    screen.set('trainer');
  }

  function backToSettings() {
    run.reset();
    screen.set('settings');
  }
</script>

<div class="evaluation">
  <h1>Valutazione</h1>

  {#if !verified}
    <label for="count-input">Qual è il tuo running count?</label>
    <div class="count-input-row">
      <button class="btn" onclick={() => adjust(-1)} aria-label="Diminuisci">−</button>
      <input
        id="count-input"
        type="text"
        inputmode="numeric"
        pattern="-?[0-9]*"
        bind:value={userInput}
        onkeydown={handleKeydown}
        placeholder="0"
      />
      <button class="btn" onclick={() => adjust(1)} aria-label="Aumenta">+</button>
    </div>
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <button class="btn btn-primary btn-verify" onclick={verify}>Verifica</button>
  {:else}
    <div class="result" class:ok={isCorrect} class:bad={!isCorrect}>
      {#if isCorrect}
        ✅ Corretto
      {:else}
        ❌ Sbagliato
      {/if}
    </div>
    <ul class="result-details">
      <li>Il tuo count: <strong>{userCount}</strong></li>
      <li>Running count reale: <strong>{$run.runningCount}</strong></li>
      <li>Differenza: <strong>{diff > 0 ? '+' : ''}{diff}</strong></li>
      <li>
        True count: <strong>{trueCount > 0 ? '+' : ''}{trueCount}</strong>
        <span class="hint">(running count ÷ mazzi rimanenti: indica quanto è favorevole il mazzo)</span>
      </li>
    </ul>

    <div class="session-stats">
      <h2>Statistiche sessione</h2>
      <p>Velocità: {($settings.speedMs / 1000).toFixed(1)} s per carta</p>
      <p>Carte mostrate: {cardsShown}</p>
      <p>Tempo totale: {(durationMs / 1000).toFixed(1)} s</p>
    </div>

    <button class="btn" onclick={() => (showReview = !showReview)}>
      {showReview ? 'Nascondi carte' : 'Rivedi le carte'}
    </button>

    {#if showReview}
      <ol class="review-list">
        {#each $run.shoe.slice(0, cardsShown) as card}
          <li>
            <span class="rank" class:red={card.suit === '♥' || card.suit === '♦'}>
              {card.rank}{card.suit}
            </span>
            <span class="value">{card.zenValue > 0 ? '+' : ''}{card.zenValue}</span>
          </li>
        {/each}
      </ol>
    {/if}

    <div class="actions">
      <button class="btn btn-primary" onclick={newSession}>Nuova sessione</button>
      <button class="btn" onclick={backToSettings}>Torna alle impostazioni</button>
    </div>
  {/if}
</div>

<style>
  .evaluation {
    padding: 1.25rem 1rem 2rem;
    display: flex;
    flex-direction: column;
  }

  label {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .count-input-row {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }

  .count-input-row input {
    flex: 1;
    text-align: center;
    font-size: 1.5rem;
  }

  .error {
    color: var(--danger);
    font-size: 0.9rem;
  }

  .btn-verify {
    margin-top: 1rem;
    font-size: 1.1rem;
    padding: 1rem;
  }

  .result {
    font-size: 1.5rem;
    font-weight: 800;
    text-align: center;
    margin: 0.5rem 0 1rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
  }

  .result.ok {
    background: var(--success-bg);
    color: var(--success);
  }

  .result.bad {
    background: var(--danger-bg);
    color: var(--danger);
  }

  .result-details {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hint {
    display: block;
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .session-stats {
    margin-bottom: 1.5rem;
  }

  .session-stats h2 {
    font-size: 1.1rem;
  }

  .session-stats p {
    margin: 0.15rem 0;
    color: var(--text-muted);
  }

  .review-list {
    list-style: none;
    padding: 0;
    margin: 1rem 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 0.5rem;
    max-height: 40svh;
    overflow-y: auto;
  }

  .review-list li {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.4rem;
    font-size: 0.9rem;
  }

  .review-list .rank.red {
    color: var(--red-suit);
  }

  .review-list .value {
    color: var(--text-muted);
    font-size: 0.8rem;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
</style>
