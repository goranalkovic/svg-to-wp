<script>
  import { slide } from 'svelte/transition';

  export let label;
  export let description;
  export let value;
  export let inputEvent;

  $: colorInvalid = value.match(/\#{1}([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/g) === null;
</script>

<label transition:slide class="color-input">
  <span class="color-input__label">{@html label}</span>

  {#if description}
    <span class="color-input__description">{@html description}</span>
  {/if}

  <input
    type="text"
    class="color-input__input"
    bind:value
    on:input={inputEvent}
    maxlength="7"
    minlength="7"
  />

  {#if colorInvalid}
    <small transition:slide class="color-input__error-text">
      Color should start with a <code>#</code>, followed by any combination of 3/6 letters
      <code>A-F</code>
      or numbers <code>0-9</code>
    </small>
  {/if}
</label>

<style>
  .color-input {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto;
    grid-template-areas: 'label input' 'description input';
    align-items: center;
    column-gap: 1rem;
    row-gap: 0.1rem;
    width: 100%;
  }

  .color-input__label,
  .color-input__description {
    user-select: none;
  }

  .color-input__label {
    grid-area: label;
  }

  .color-input__description,
  .color-input__error-text {
    grid-area: description;
    font-size: var(--small-font-size);
  }

  :global(.color-input__description code) {
    font-size: calc(var(--small-font-size) * 1.05);
    font-family: var(--code-font-family);
  }

  .color-input__input {
    grid-area: input;
    font-family: var(--code-font-family);
    width: 5.5rem;
    font-size: var(--large-font-size);
  }

  .color-input__error-text {
    color: var(--error-color);
  }
</style>
