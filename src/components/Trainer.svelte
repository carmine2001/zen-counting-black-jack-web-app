<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { run, settings, screen } from '../stores/session';
  import Card from './Card.svelte';

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function clearTimer() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function scheduleNext() {
    clearTimer();
    const state = get(run);
    if (state.isFinished || state.isPaused) return;
    const speedMs = get(settings).speedMs;
    timeoutId = setTimeout(() => {
      run.advance();
      const next = get(run);
      if (next.isFinished) {
        screen.set('evaluation');
        return;
      }
      scheduleNext();
    }, speedMs);
  }

  function togglePause() {
    run.togglePause();
    const state = get(run);
    if (!state.isPaused && !state.isFinished) {
      scheduleNext();
    } else {
      clearTimer();
    }
  }

  function stop() {
    clearTimer();
    run.stop();
    screen.set('evaluation');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePause();
    }
  }

  onMount(() => {
    scheduleNext();
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    clearTimer();
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="trainer">
  {#if $run.shoe.length > 0 && $run.currentIndex >= 0 && $run.currentIndex < $run.shoe.length}
    <div class="progress">Carta {$run.currentIndex + 1} / {$run.shoe.length}</div>

    <button
      type="button"
      class="card-tap"
      onclick={togglePause}
      aria-label="Tocca la carta per mettere in pausa o riprendere"
    >
      <Card card={$run.shoe[$run.currentIndex]} showZenValue={$settings.showZenValue} />
    </button>

    {#if $settings.showRunningCount}
      <div class="running-count">Running count: {$run.runningCount}</div>
    {/if}

    {#if $run.isPaused}
      <div class="paused-label">In pausa</div>
    {/if}

    <div class="controls">
      <button class="btn" onclick={togglePause}>{$run.isPaused ? 'Riprendi' : 'Pausa'}</button>
      <button class="btn btn-danger" onclick={stop}>Stop</button>
    </div>
  {/if}
</div>

<style>
  .trainer {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
  }

  .progress {
    color: var(--text-muted);
    font-weight: 600;
  }

  .card-tap {
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    width: min(80vw, 320px);
    cursor: pointer;
  }

  .running-count {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .paused-label {
    color: var(--accent);
    font-weight: 700;
  }

  .controls {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    max-width: 320px;
    margin-top: 1rem;
  }

  .controls .btn {
    flex: 1;
  }

  .btn-danger {
    background: var(--danger-bg);
    color: var(--danger);
    border-color: transparent;
  }
</style>
