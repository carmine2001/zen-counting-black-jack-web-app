<script lang="ts">
  import { assertZenValuesSanity } from './lib/zen';
  import { screen } from './stores/session';
  import Settings from './components/Settings.svelte';
  import Trainer from './components/Trainer.svelte';
  import Evaluation from './components/Evaluation.svelte';
  import Stats from './components/Stats.svelte';

  assertZenValuesSanity();
</script>

{#if $screen === 'settings'}
  <Settings />
{:else if $screen === 'trainer'}
  <Trainer />
{:else if $screen === 'evaluation'}
  <Evaluation />
{:else if $screen === 'stats'}
  <Stats />
{/if}
