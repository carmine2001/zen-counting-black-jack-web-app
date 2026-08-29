<script lang="ts">
  import { screen } from '../stores/session';
  import { loadHistory, resetHistory, type SessionResult } from '../lib/storage';

  let history = $state<SessionResult[]>(loadHistory());

  const total = $derived(history.length);
  const correctCount = $derived(history.filter((h) => h.correct).length);
  const percentage = $derived(total > 0 ? Math.round((correctCount / total) * 100) : 0);

  const currentStreak = $derived.by(() => {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].correct) streak++;
      else break;
    }
    return streak;
  });

  const bestStreak = $derived.by(() => {
    let best = 0;
    let running = 0;
    for (const h of history) {
      if (h.correct) {
        running++;
        best = Math.max(best, running);
      } else {
        running = 0;
      }
    }
    return best;
  });

  const recent = $derived([...history].reverse().slice(0, 20));

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
      ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  function handleReset() {
    resetHistory();
    history = [];
  }

  function backToSettings() {
    screen.set('settings');
  }
</script>

<div class="stats">
  <h1>Statistiche</h1>

  {#if total === 0}
    <p class="empty">Nessuna sessione registrata ancora. Completa un allenamento per vedere le statistiche.</p>
  {:else}
    <div class="summary-grid">
      <div class="summary-card">
        <div class="value">{percentage}%</div>
        <div class="label">Sessioni corrette</div>
      </div>
      <div class="summary-card">
        <div class="value">{currentStreak}</div>
        <div class="label">Streak attuale</div>
      </div>
      <div class="summary-card">
        <div class="value">{bestStreak}</div>
        <div class="label">Streak migliore</div>
      </div>
      <div class="summary-card">
        <div class="value">{total}</div>
        <div class="label">Sessioni totali</div>
      </div>
    </div>

    <h2>Ultimi risultati</h2>
    <ul class="history-list">
      {#each recent as h}
        <li class:ok={h.correct} class:bad={!h.correct}>
          <div class="row-main">
            <span class="date">{formatDate(h.date)}</span>
            <span class="outcome">{h.correct ? '✅' : '❌'}</span>
          </div>
          <div class="row-details">
            <span>{(h.speedMs / 1000).toFixed(1)} s/carta</span>
            <span>{h.numCardsShown} carte</span>
            <span>errore: {h.diff > 0 ? '+' : ''}{h.diff}</span>
          </div>
        </li>
      {/each}
    </ul>

    <button class="btn btn-reset" onclick={handleReset}>Azzera statistiche</button>
  {/if}

  <button class="btn btn-primary" onclick={backToSettings}>Torna alle impostazioni</button>
</div>

<style>
  .stats {
    padding: 1.25rem 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty {
    color: var(--text-muted);
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .summary-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
    text-align: center;
  }

  .summary-card .value {
    font-size: 1.75rem;
    font-weight: 800;
  }

  .summary-card .label {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .history-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 40svh;
    overflow-y: auto;
  }

  .history-list li {
    border: 1px solid var(--border);
    border-left-width: 4px;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
  }

  .history-list li.ok {
    border-left-color: var(--success);
  }

  .history-list li.bad {
    border-left-color: var(--danger);
  }

  .row-main {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
  }

  .row-details {
    display: flex;
    gap: 0.75rem;
    color: var(--text-muted);
    font-size: 0.85rem;
    flex-wrap: wrap;
  }

  .btn-reset {
    color: var(--danger);
  }
</style>
