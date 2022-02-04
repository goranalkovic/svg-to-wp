<script>
  import { slide } from 'svelte/transition';
  import Icon from './Icon.svelte';

  export let label;
  export let description = null;
  export let checked;
  export let clickEvent = null;
  export let iconName = null;
  export let filledIconOnActive = true;

  const handleClick = (e) => {
    checked = !checked;

    clickEvent(e);
  };
</script>

<div
  class="toggle-switch"
  class:active={checked}
  transition:slide
  on:click|self={handleClick}
>
  {#if iconName}
    <Icon name={iconName} isFilled={filledIconOnActive && checked} />
  {/if}

  <div class="toggle-switch__text">
    <span class="toggle-switch__label">{@html label}</span>

    {#if description}
      <span class="toggle-switch__description">{@html description}</span>
    {/if}
  </div>

  <div class="toggle-switch__content">
    <slot />
  </div>
</div>

<style>
  .toggle-switch {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas: 'icon text content';
    align-items: center;
    column-gap: 0.5rem;
    width: 100%;
    cursor: pointer;
    position: relative;

    min-height: 3rem;
    border: 1px solid transparent;
    border-radius: 0.5rem;
    padding-left: 0.75rem;
    padding-right: 0.5rem;

    transition: 0.3s border-color ease-out;
  }

  :global(.toggle-switch svg) {
    color: var(--active-color);
  }

  .toggle-switch__text {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    flex-grow: 1;
    pointer-events: none;
    grid-area: text;
  }

  .toggle-switch__content {
    grid-area: content;
  }

  .toggle-switch::before {
    content: '';
    position: absolute;
    left: -0.125rem;
    top: 12.5%;
    height: 2rem;
    width: 0.25rem;
    border-radius: 0.25rem;
    background-color: var(--active-color);
    transition: 0.3s transform ease-out;
    transform: scaleY(0);
    transform-origin: center center;
  }

  .toggle-switch:hover {
    border-color: var(--dark-color);
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

  .toggle-switch.active {
    border-color: var(--muted-color);
  }
  :global(.toggle-switch.active::before) {
    transform: scaleY(1);
  }
</style>
