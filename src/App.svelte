<script>
  import throttle from 'just-throttle';
  import Dropzone from 'svelte-file-dropzone';
  import toast, { Toaster } from 'svelte-french-toast';
  import { Pane, Splitpanes } from 'svelte-splitpanes';
  import { onMount } from 'svelte';

  import { svgOptimize } from './svg-optimize';
  import { slide } from 'svelte/transition';
  import ToggleSwitch from './components/ToggleSwitch.svelte';
  import HexColorInput from './components/HexColorInput.svelte';
  import ThemeSwitcher from './components/ThemeSwitcher.svelte';

  import { preferences, ThemeMode, prefersColorSchemeDark } from './stores';

  $: isDay = $preferences.theme === ThemeMode.LIGHT;
  $: isAuto = $preferences.theme === ThemeMode.AUTO;
  $: isNight = !isDay && !isAuto;

  let htmlElement;

  onMount(() => {
    htmlElement = document.documentElement;
  });

  $: {
    if (htmlElement) {
      const shouldBeDark =
        ($preferences.theme === ThemeMode.AUTO && $prefersColorSchemeDark) ||
        $preferences.theme === ThemeMode.DARK;

      if (shouldBeDark) {
        htmlElement?.classList?.add('dark');
      } else {
        htmlElement?.classList?.remove('dark');
      }
    }
  }

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
    useFilenames: true,
    inputMode: 'file',
  };

  $: colorInvalid =
    options.colorToReplace.match(/\#{1}[a-fA-F0-9]{6}/g) === null &&
    options.colorToReplace.match(/\#{1}[a-fA-F0-9]{3}/g) === null;

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
      splitString.forEach((itemToProcess, i) => {
        const optimized = svgOptimize(itemToProcess, passedOptions);

        const newName = uploadedImages[i]?.name?.replace('.svg', '');

        if (options.useFilenames) {
          finalOutput += options.jsxifyAttributes
            ? `${newName}: ${optimized},\n`
            : `"${newName}" : "${optimized}",\n`;
        } else {
          finalOutput += options.jsxifyAttributes
            ? `: ${optimized},\n`
            : `"" : "${optimized}",\n`;
        }
      });
    } else {
      finalOutput = svgOptimize(currentSvgString, passedOptions);
    }

    inputInvalid = finalOutput === '';
  };

  const convertOnType = throttle(() => optimizeSvg(), 500);

  const copyToClipboard = () => {
    if (!navigator?.clipboard) {
      toast.success('Error copying to clipboard', {
        position: 'bottom-center',
      });
      return;
    }

    navigator.clipboard.writeText(finalOutput);

    toast.success('Copied to clipboard!', {
      position: 'bottom-center',
    });

    if (options.clearAfterCopyToClipboard) {
      clearData();
    }
  };

  let files = {
    accepted: [],
    rejected: [],
  };

  function handleFilesSelect(e) {
    const { acceptedFiles, fileRejections } = e.detail;
    files.accepted = [...files.accepted, ...acceptedFiles];
    files.rejected = [...files.rejected, ...fileRejections];
  }

  function readImage(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsText(file);
    });
  }

  let uploadedImages = [];

  function removeFile(index) {
    files.accepted = files.accepted.filter((_, i) => i !== index);
    uploadedImages = uploadedImages.filter((_, i) => i !== index);
    updateUploadedContent();
  }

  function updateUploadedContent() {
    currentSvgString = uploadedImages
      .map(({ content }) => content)
      .join(';')
      .trim();
    options.batch = (uploadedImages?.length ?? 0) > 1;
    optimizeSvg();
  }

  $: {
    files.accepted.forEach((file, i) => {
      uploadedImages[i] = {
        name: file.name,
      };

      readImage(file).then((content) => {
        uploadedImages[i].content = content;
        updateUploadedContent();
      });
    });
  }

  function clearData() {
    uploadedImages = [];
    files.accepted = [];
    files.rejected = [];
    currentSvgString = '';
    optimizeSvg();
  }

  optimizeSvg();
</script>

<main>
  <h1>SVG2WP</h1>

  <div class="theme-switcher">
    <ThemeSwitcher />
  </div>

  <div class="content">
    <Splitpanes dblClickSplitter={false}>
      <Pane minSize={25}>
        <Splitpanes
          horizontal={finalOutput?.length > 0}
          dblClickSplitter={false}
          pushOtherPanes
        >
          <Pane minSize={40} size={60}>
            <section id="input">
              <div class="flex-between">
                <h3>Input</h3>
                <button on:click={clearData}>Clear</button>
              </div>

              {#if options.inputMode === 'file'}
                <div transition:slide>
                  <Dropzone
                    on:drop={handleFilesSelect}
                    accept=".svg"
                    containerClasses="file-upload"
                  >
                    <p>Click or drag SVG files onto here to upload them</p>
                    <br />

                    <button
                      on:click|preventDefault|stopPropagation={() =>
                        (options.inputMode = 'text')}
                    >
                      Or manually enter SVG code instead
                    </button>
                  </Dropzone>
                </div>

                <br />
                <div class="svg-preview">
                  {#each uploadedImages as item, i (i)}
                    <div transition:slide class="svg-preview-item">
                      <span>{item.name}</span>
                      <button on:click={() => removeFile(i)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <path
                            d="M10 1.25C11.4346 1.25 12.6126 2.34848 12.7388 3.75019L17 3.75C17.4142 3.75 17.75 4.08579 17.75 4.5C17.75 4.8797 17.4678 5.19349 17.1018 5.24315L17 5.25H16.417L15.1499 16.2292C15.0335 17.2384 14.179 18 13.1631 18H6.83688C5.821 18 4.9665 17.2384 4.85006 16.2292L3.582 5.25H3C2.6203 5.25 2.30651 4.96785 2.25685 4.60177L2.25 4.5C2.25 4.1203 2.53215 3.80651 2.89823 3.75685L3 3.75L7.26119 3.75019C7.38741 2.34848 8.56542 1.25 10 1.25ZM8.5 7.5C8.25454 7.5 8.05039 7.65477 8.00806 7.85886L8 7.9375V14.0625L8.00806 14.1411C8.05039 14.3452 8.25454 14.5 8.5 14.5C8.74546 14.5 8.94961 14.3452 8.99194 14.1411L9 14.0625V7.9375L8.99194 7.85886C8.94961 7.65477 8.74546 7.5 8.5 7.5ZM11.5 7.5C11.2545 7.5 11.0504 7.65477 11.0081 7.85886L11 7.9375V14.0625L11.0081 14.1411C11.0504 14.3452 11.2545 14.5 11.5 14.5C11.7455 14.5 11.9496 14.3452 11.9919 14.1411L12 14.0625V7.9375L11.9919 7.85886C11.9496 7.65477 11.7455 7.5 11.5 7.5ZM10 2.75C9.39524 2.75 8.89079 3.17947 8.77499 3.75005H11.225C11.1092 3.17947 10.6048 2.75 10 2.75Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      {@html item?.content ?? ''}
                    </div>
                  {/each}
                </div>
              {:else}
                <textarea
                  bind:value={currentSvgString}
                  on:input={convertOnType}
                  rows="6"
                  spellcheck="false"
                  transition:slide
                />

                {#if currentSvgString?.length && inputInvalid}
                  <p class="error-text" transition:slide>
                    Something's not right, check your input.
                  </p>
                {/if}

                <br />
                <button
                  transition:slide
                  on:click={() => {
                    options.inputMode = 'file';
                    clearData();
                  }}
                >
                  Upload files instead
                </button>

                {#if currentSvgString?.length && !inputInvalid}
                  <div class="svg-preview">
                    {#each currentSvgString.split(';') as item}
                      <div transition:slide class="svg-preview-item">
                        {@html item}
                      </div>
                    {/each}
                  </div>
                {/if}
              {/if}
            </section>
          </Pane>
          <Pane
            minSize={finalOutput?.length > 0 ? 40 : 15}
            maxSize={finalOutput?.length > 0 ? 40 : 25}
            size={finalOutput?.length > 0 ? 40 : 25}
          >
            <section id="options">
              <h3>Options</h3>

              <ToggleSwitch
                label="Make attributes JSX-compatible (convert to <code>camelCase</code>)"
                bind:checked={options.jsxifyAttributes}
                clickEvent={() => setTimeout(optimizeSvg, 250)}
                iconName="camelCase"
              />

              <ToggleSwitch
                label="Convert double to single quotes"
                bind:checked={options.doubleToSingleQuotes}
                clickEvent={() => setTimeout(optimizeSvg, 250)}
                iconName="quote"
              />

              <ToggleSwitch
                label="Add <code>fill='none'</code> to elements which don't have it set."
                bind:checked={options.addMissingFillNone}
                clickEvent={() => setTimeout(optimizeSvg, 250)}
                iconName="shapeFill"
              />

              {#if options.inputMode === 'text'}
                <ToggleSwitch
                  label="Batch-optimize and prepare for JSON"
                  description="Separate items with a semicolon."
                  bind:checked={options.batch}
                  clickEvent={() => setTimeout(optimizeSvg, 250)}
                  iconName="jsonify"
                />
              {/if}

              {#if options.inputMode === 'file'}
                <ToggleSwitch
                  label="Use filenames as object keys"
                  bind:checked={options.useFilenames}
                  clickEvent={() => setTimeout(optimizeSvg, 250)}
                  iconName="documentFilename"
                />
              {/if}

              <ToggleSwitch
                label="Randomize IDs"
                bind:checked={options.assignRandomIds}
                clickEvent={() => setTimeout(optimizeSvg, 250)}
                iconName="hashtag"
              />

              <ToggleSwitch
                label="Replace color with <code>currentColor</code>"
                bind:checked={options.replaceColor}
                clickEvent={() => setTimeout(optimizeSvg, 250)}
                iconName="color"
              >
                {#if options.replaceColor}
                  <HexColorInput
                    bind:value={options.colorToReplace}
                    on:input={convertOnType}
                  />
                {/if}
              </ToggleSwitch>

              <ToggleSwitch
                label="Clear input after copying to clipboard"
                bind:checked={options.clearAfterCopyToClipboard}
                iconName="textDismiss"
              />
            </section>
          </Pane>
        </Splitpanes>
      </Pane>
      {#if finalOutput?.length > 0}
        <Pane minSize={20} size={60}>
          <section id="output">
            <h3>Output</h3>
            <p class="text-small">Click to copy</p>
            <code class="output" on:click={copyToClipboard}>{finalOutput}</code>
          </section>
        </Pane>
      {/if}
    </Splitpanes>
  </div>
</main>

<Toaster />

<style>
  main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas: 'title mode-switch' 'content content';
    padding: 3rem;
    row-gap: 1rem;
    column-gap: 2rem;
    height: 100vh;
    width: 100%;
  }

  #input {
    padding-inline-end: 1.5rem;
    padding-block-end: 1.5rem;
  }

  :global(.splitpanes--vertical #options) {
    padding-inline-start: 1.5rem;
    padding-block-end: 1.5rem;
  }

  :global(.splitpanes--horizontal #options) {
    padding-inline-end: 1.5rem;
    padding-block-start: 1.5rem;
  }

  #output {
    padding-inline-start: 1.5rem;
    padding-block-end: 1.5rem;
  }

  @media (max-width: 56em) {
    main {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto 1fr;
      grid-template-areas: 'title mode-switch' 'content';
    }
  }

  .content {
    grid-area: content;
  }

  .theme-switcher {
    grid-area: mode-switch;
    justify-self: flex-end;
  }

  h1 {
    grid-area: title;
    color: var(--active-color);
  }

  #options {
    display: grid;
    grid-auto-flow: row;
    gap: 0.5rem;
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
    height: 100%;
    overflow-y: auto;
    max-height: 70vh;
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
    line-height: 1.5;
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
    margin: 0.5rem 0;
  }

  .svg-preview-item {
    width: 5rem;
    height: 5rem;
    padding: 0.1rem;
    border: 1px solid var(--muted-color);
    border-radius: 0.4rem;
    position: relative;
  }
  :global(.svg-preview-item svg) {
    width: 100%;
    height: 100%;
  }

  :global(.svg-preview-item span) {
    position: absolute;
    bottom: 0.1rem;
    left: 0.1rem;
    padding: 0.05rem 0.2rem;

    font-size: 0.6rem;
    max-width: calc(100% - 0.2rem);

    background: var(--white);
    backdrop-filter: blur(20px);
    border-radius: 0.2rem;
    user-select: none;
  }

  :global(.svg-preview-item button) {
    opacity: 0;
    position: absolute;
    top: 0.1rem;
    right: 0.1rem;

    padding: 0;
    margin: 0;
    width: 1.4rem;
    height: 1.4rem;

    background: var(--white);
    backdrop-filter: blur(20px);

    border-color: transparent;

    transition: 0.3s opacity ease-out, 0.3s color ease-out;
  }

  :global(.svg-preview-item:hover button) {
    opacity: 1;
  }

  :global(.svg-preview-item button svg) {
    height: 1.25rem;
    width: 1.25rem;
  }

  :global(.svg-preview-item button:hover) {
    color: rgb(185 34 34);
  }

  :global(.file-upload) {
    background-color: transparent !important;
    border-radius: 0.4rem !important;

    border: 1px solid var(--muted-color) !important;

    transition: 0.3s border-color ease-out, 0.3s box-shadow ease-out !important;
    box-shadow: inset 0 1px 20px -10px transparent;

    cursor: pointer;
  }

  :global(.file-upload:hover) {
    border-color: var(--active-color) !important;
    box-shadow: inset 0 1px 20px -10px var(--active-color);
  }

  #options h3 {
    margin-bottom: 0.75rem;
  }
</style>
