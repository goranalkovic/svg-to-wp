<script>
  import { slide } from 'svelte/transition';

  export let value;
  export let inputEvent = null;

  $: colorInvalid = value.match(/\#{1}[a-fA-F0-9]{6}/g) === null && value.match(/\#{1}[a-fA-F0-9]{3}/g) === null;
</script>

<label transition:slide class="color-input">
  <input
    type="text"
    class="color-input__input"
    bind:value
    on:input={inputEvent}
    maxlength="7"
    minlength="4"
  />

  {#if colorInvalid}
    <small transition:slide class="color-input__error-text">
      Color should be in format <code>#ABC</code> / <code><div id="ABC123"></div></code> (0-9, A-F)
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
    width: 5.25rem;
    font-size: calc(var(--base-font-size) * 1.25);
    font-stretch: 98%;
    font-weight: 420;
  }

  .color-input__error-text {
    color: var(--error-color);
  }
</style>
