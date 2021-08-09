<script>
  import throttle from 'just-throttle';
  import { svgOptimize } from './svg-optimize';
  import { slide } from 'svelte/transition';
  import ToggleSwitch from './components/ToggleSwitch.svelte';
  import Separator from './components/Separator.svelte';
  import HexColorInput from './components/HexColorInput.svelte';

  // Dynamic variables.
  let currentSvgString = '';
  let finalOutput = '';
  let inputInvalid = false;

  let options = {
    colorToReplace: '#0D3636',
    replaceColor: true,
    jsxifyAttributes: false,
    doubleToSingleQuotes: true,
    batch: false,
    addMissingFillNone: true,
    clearAfterCopyToClipboard: false,
    assignRandomIds: true,
  };

  let showCopiedToast = false;

  $: colorInvalid =
    options.colorToReplace.match(/\#{1}[a-fA-F0-9]{6}/g) === null;

  // Methods.
  const optimizeSvg = () => {
    const passedOptions = {
      ...options,
      colorToReplace: options.colorToReplace.slice(0, 7),
    };

    if (colorInvalid) {
      passedOptions.replaceColor = false;
    }

    if (options.batch && currentSvgString.includes(';')) {
      const splitString = currentSvgString.split(';');

      finalOutput = '';
      for (const itemToProcess of splitString) {
        const optimized = svgOptimize(itemToProcess, passedOptions);
        finalOutput += options.jsxifyAttributes ? `: ${optimized},\n` : `"" : "${optimized}",\n`;
      }
    } else {
      finalOutput = svgOptimize(currentSvgString, passedOptions);
    }

    inputInvalid = finalOutput === '';
  };

  const convertOnType = throttle(() => optimizeSvg(), 500);

  const copyToClipboard = () => {
    if (!navigator?.clipboard) {
      showCopiedToast = false;
      return;
    }

    navigator.clipboard.writeText(finalOutput);

    showCopiedToast = true;

    if (options.clearAfterCopyToClipboard) {
      currentSvgString = '';
    }

    setTimeout(() => {
      showCopiedToast = false;
    }, 1500);
  };

  optimizeSvg();
</script>

<main>
  <h1>SVG2WP</h1>

  <section id="input">
    <div class="flex-between">
      <h3>Input</h3>
      <button on:click={() => (currentSvgString = '')}>Clear</button>
    </div>

    <textarea
      bind:value={currentSvgString}
      on:input={convertOnType}
      rows="6"
      spellcheck="false"
    />
    {#if currentSvgString?.length && inputInvalid}
      <p class="error-text" transition:slide>
        Something's not right, check your input.
      </p>
    {/if}

    {#if currentSvgString?.length && !inputInvalid}
      <p class="svg-preview-title">Preview</p>
      <div class="svg-preview">
        {#each currentSvgString.split(';') as item}
          <div transition:slide class="svg-preview-item">{@html item}</div>
        {/each}
      </div>
    {/if}
  </section>

  <section id="options">
    <h3>Options</h3>

    <ToggleSwitch
      label="JSX-compatible attributes"
      description="Converts attributes to <code>camelCase</code>"
      bind:checked={options.jsxifyAttributes}
      clickEvent={() => setTimeout(optimizeSvg, 250)}
    />

    <ToggleSwitch
      label="Convert quotes"
      description="Converts double to single quotes"
      bind:checked={options.doubleToSingleQuotes}
      clickEvent={() => setTimeout(optimizeSvg, 250)}
    />

    <ToggleSwitch
      label="Add missing fills"
      description="Adds <code>fill='none'</code> to elements which don't have it set."
      bind:checked={options.addMissingFillNone}
      clickEvent={() => setTimeout(optimizeSvg, 250)}
    />

    <ToggleSwitch
      label="Batch-optimize and prepare for JSON"
      description="Separate items with a semicolon."
      bind:checked={options.batch}
      clickEvent={() => setTimeout(optimizeSvg, 250)}
    />

    <ToggleSwitch
      label="Randomize IDs"
      description="Replaces every ID with a random GUID."
      bind:checked={options.assignRandomIds}
      clickEvent={() => setTimeout(optimizeSvg, 250)}
    />

    <Separator />

    <ToggleSwitch
      label="Replace color"
      description="Replaces selected color with <code>currentColor</code>."
      bind:checked={options.replaceColor}
      clickEvent={() => setTimeout(optimizeSvg, 250)}
    />

    {#if options.replaceColor}
      <HexColorInput
        label="Color to replace"
        bind:value={options.colorToReplace}
        on:input={convertOnType}
      />
    {/if}

    <Separator />

    <ToggleSwitch
      label="Clear input after copying to clipboard"
      bind:checked={options.clearAfterCopyToClipboard}
    />
  </section>

  <section id="output">
    <h3>Output</h3>
    <p class="text-small">Click to copy</p>
    <code class="output" on:click={copyToClipboard}>{finalOutput}</code>
    {#if showCopiedToast}
      <p class="text-small text-active" transition:slide>
        Copied to clipboard!
      </p>
    {/if}
  </section>
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 1.5fr 30rem;
    grid-template-rows: auto 1fr 1fr;
    grid-template-areas: 'title title' 'input options' 'output output';
    padding: 3rem;
    row-gap: 1rem;
    column-gap: 2rem;
    height: 100%;
    width: 100%;
  }

  @media (max-width: 56em) {
    main {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr 1fr auto;
      grid-template-areas: 'title' 'input' 'output' 'options';
    }
  }

  h1 {
    grid-area: title;
  }
  #input {
    grid-area: input;
  }
  #output {
    grid-area: output;
  }

  #options {
    grid-area: options;
  }

  .output {
    margin: 0.5rem 0;
    display: block;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.4rem;
    border: 1px solid var(--muted-color);
    width: 100%;
    transition: 0.3s border-color ease-out, 0.3s box-shadow ease-out;
    box-shadow: inset 0 1px 20px -10px transparent;
  }

  .output:hover {
    border-color: var(--active-color);
    box-shadow: inset 0 1px 20px -10px var(--active-color);
  }

  .output,
  textarea {
    font-size: 0.85rem;
    font-family: monospace;
    width: 100%;
    display: block;
  }

  .error-text {
    display: block;
    color: var(--error-color);
    font-size: var(--small-font-size);
    margin-top: 0.5rem;
  }

  .svg-preview {
    display: flex;
    gap: 1rem;
  }

  .svg-preview-item {
    width: 4rem;
    height: 4rem;
    padding: 0.1rem;
    border: 1px solid var(--muted-color);
    border-radius: 0.4rem;
  }

  .svg-preview-title {
    margin: 0.5rem 0;
  }
</style>
