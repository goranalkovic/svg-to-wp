<script>
  import { slide } from 'svelte/transition';

  export let label;
  export let description = null;
  export let checked;
  export let clickEvent = null;
</script>

<label class="toggle-switch" transition:slide>
  <span class="toggle-switch__label">{@html label}</span>

  {#if description}
    <span class="toggle-switch__description">{@html description}</span>
  {/if}

  <div class="toggle-switch__switch" class:is-active={checked}>
    <div class="toggle-switch__switch-thumb" />
  </div>

  <input
    class="toggle-switch__input"
    type="checkbox"
    bind:checked
    on:click={clickEvent}
  />
</label>

<style>
  .toggle-switch {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas: 'label toggle' 'description toggle';
    align-items: center;
    column-gap: 1rem;
    row-gap: 0.1rem;
    width: 100%;
  }

  .toggle-switch__label,
  .toggle-switch__description {
    user-select: none;
  }

  .toggle-switch__label {
    grid-area: label;
  }

  .toggle-switch__description {
    grid-area: description;
    font-size: var(--small-font-size);
    opacity: 0.6;
  }

  :global(.toggle-switch__description code) {
    font-size: calc(var(--small-font-size) * 1.05);
    font-family: var(--code-font-family);
  }

  .toggle-switch__input {
    appearance: none;
  }

  .toggle-switch__switch {
    grid-area: toggle;
    width: 2.75rem;
    height: 1.5rem;
    background-color: transparent;
    border-radius: 4rem;
    padding: 0.25rem 0.2rem;
    box-shadow: 0 0 0 1px var(--inactive-color);
    transition: 0.3s background-color ease-out, 0.3s box-shadow ease-out;
    cursor: pointer;
  }

  .toggle-switch__switch-thumb {
    height: 1rem;
    width: 1rem;
    background-color: var(--inactive-color);
    border-radius: 10rem;
    transition: 0.3s transform ease-out, 0.3s background-color ease-out;
  }

  .toggle-switch__switch.is-active {
    background-color: var(--active-color);
    box-shadow: 0 0 0 1px var(--active-color-dark);
  }

  .toggle-switch__switch.is-active .toggle-switch__switch-thumb {
    transform: translateX(1.35rem);
    background-color: var(--white);
  }
</style>
