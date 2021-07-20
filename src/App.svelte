<script>
  import throttle from 'just-throttle';
  import { svgOptimize } from './svg-optimize';
  import { slide } from 'svelte/transition';

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
        finalOutput += `"${optimized}",\n`;
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

    setTimeout(() => {
      showCopiedToast = false;
    }, 1000);
  };

  optimizeSvg();
</script>

<main>
  <h1>SVG2WP</h1>

  <section class="spaced">
    <h3>Input</h3>
    <textarea
      bind:value={currentSvgString}
      on:input={convertOnType}
      cols="80"
      rows="6"
      spellcheck="false"
    />
    {#if currentSvgString?.length && inputInvalid}
      <small class="error-text" transition:slide
        >Something's not right, check your input.</small
      >
    {/if}
    <button on:click={() => (currentSvgString = '')}>Clear</button>
  </section>

  <section class="spaced">
    <h3>Options</h3>
    <label>
      <input
        type="checkbox"
        bind:checked={options.jsxifyAttributes}
        on:click={() => setTimeout(optimizeSvg, 250)}
      />
      <div>
        JSX-compatible attributes <br />
        <small>Converts attributes to camelCase</small>
      </div>
    </label>

    <label>
      <input
        type="checkbox"
        bind:checked={options.doubleToSingleQuotes}
        on:click={() => setTimeout(optimizeSvg, 250)}
      />
      <div>
        Convert quotes <br />
        <small>Converts double (") to single quotes (')</small>
      </div>
    </label>
    
    <label>
      <input
        type="checkbox"
        bind:checked={options.addMissingFillNone}
        on:click={() => setTimeout(optimizeSvg, 250)}
      />
      <div>
        Add missing fills <br />
        <small>Adds <code>fill='none'</code> to elements which don't have it set.</small>
      </div>
    </label>

    <label>
      <input
        type="checkbox"
        bind:checked={options.batch}
        on:click={() => setTimeout(optimizeSvg, 250)}
      />
      <div>
        Batch-optimize and prepare for JSON. <br />
        <small>Separate items with a semicolon <code>;</code></small>
      </div>
    </label>
    <label>
      <input
        type="checkbox"
        bind:checked={options.replaceColor}
        on:click={() => setTimeout(optimizeSvg, 250)}
      />
      <div>
        Replace color <br />
        <small>Replaces selected color with <code>currentColor</code></small>
      </div>
    </label>
    {#if options.replaceColor}
      <label transition:slide class="text-label">
        Color to replace
        <br />
        <input
          type="text"
          bind:value={options.colorToReplace}
          on:input={convertOnType}
          class:error={colorInvalid}
          maxlength="7"
          minlength="7"
        />
        {#if colorInvalid}
          <small transition:slide class="error-text">
            Color should start with a <code>#</code>, followed by any 6 letters
            <code>A-F</code>
            or numbers <code>0-9</code>
          </small>
        {/if}
      </label>
    {/if}
  </section>

  <section>
    {#if finalOutput?.length}
      <h3>Output</h3>
      <small><i>Click to copy</i></small>
      <code class="output" on:click={copyToClipboard}>{finalOutput}</code>
      {#if showCopiedToast}
        <p transition:slide>Copied to clipboard!</p>
      {/if}
    {/if}
  </section>
</main>

<style>
  * {
    box-sizing: border-box;
  }
  .error {
    border-color: red;
    outline-color: red;
  }

  .error-text {
    color: red;
  }

  .output {
    margin-top: 0.5rem;
    display: block;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.6rem;
    border: 1px solid grey;
    width: 100%;
    transition: 0.3s background-color ease-out;
  }

  .output:hover {
    background-color: honeydew;
  }

  .output,
  textarea {
    font-size: 0.85rem;
    font-family: monospace;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .text-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  input[type='checkbox'] {
    scale: 1.25;
    margin: 0;
    padding: 0;
  }

  .spaced {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  code {
    font-size: 0.8rem;
  }

  h3 {
    margin-bottom: 0;
  }
</style>
