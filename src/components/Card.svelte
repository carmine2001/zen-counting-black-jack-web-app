<script lang="ts">
  import type { Card } from '../lib/deck';

  let {
    card,
    showZenValue = false,
  }: {
    card: Card;
    showZenValue?: boolean;
  } = $props();

  const isRed = $derived(card.suit === '♥' || card.suit === '♦');
  const zenLabel = $derived(card.zenValue > 0 ? `+${card.zenValue}` : `${card.zenValue}`);
</script>

<div class="card" class:red={isRed} class:black={!isRed}>
  <div class="rank">{card.rank}</div>
  <div class="suit">{card.suit}</div>
  {#if showZenValue}
    <div class="zen-value">{zenLabel}</div>
  {/if}
</div>

<style>
  .card {
    width: 100%;
    aspect-ratio: 3 / 4;
    max-height: 60svh;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 1.25rem;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    overflow: hidden;
    user-select: none;
  }

  .rank {
    font-weight: 800;
    line-height: 1;
    font-size: clamp(4rem, min(22vw, 22svh), 9rem);
  }

  .suit {
    font-size: clamp(2rem, min(10vw, 10svh), 4rem);
    line-height: 1;
  }

  .zen-value {
    margin-top: 0.5rem;
    font-size: clamp(1rem, min(5vw, 5svh), 1.5rem);
    font-weight: 700;
    color: var(--text-muted);
  }

  .red {
    color: var(--red-suit);
  }

  .black {
    color: var(--black-suit);
  }
</style>
