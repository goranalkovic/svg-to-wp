<script>
	// @ts-nocheck
	import throttle from 'just-throttle';
	import Dropzone from 'svelte-file-dropzone';
	import toast, { Toaster } from 'svelte-french-toast';

	import { slide, fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	import Delete from '@svicons/fluentui-system-regular/delete.svelte';

	import HexColorInput from './lib/HexColorInput.svelte';
	import Logo from './lib/Logo.svelte';
	import OptionsPanel from './lib/OptionsPanel.svelte';
	import OptionToggle from './lib/OptionToggle.svelte';
	import ThemeSwitcher from './lib/ThemeSwitcher.svelte';

	import { preferences } from './stores';

	import { scrollbar } from './scrollbars';
	import { svgOptimize } from './svg-optimize';
  import { camelize } from './helpers';

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

	$: colorInvalid = options.colorToReplace.match(/\#{1}[a-fA-F0-9]{6}/g) === null && options.colorToReplace.match(/\#{1}[a-fA-F0-9]{3}/g) === null;

	// Methods.
	const optimizeSvg = () => {
		const passedOptions = {
			...options,
			colorToReplace: options.colorToReplace.slice(0, 7),
		};

		if (colorInvalid) {
			passedOptions.replaceColor = false;
		}

		if (options.batch && currentSvgString.includes('|')) {
			const splitString = currentSvgString.split('|');

			finalOutput = '';
			splitString.forEach((itemToProcess, i) => {
				const optimized = svgOptimize(itemToProcess, passedOptions);

				const newName = camelize(uploadedImages[i]?.name?.replace('.svg', '') ?? 'name');

				if (options.useFilenames) {
					finalOutput += options.jsxifyAttributes ? `${newName}: ${optimized},\n` : `"${newName}" : "${optimized}",\n`;
				} else {
					finalOutput += options.jsxifyAttributes ? `: ${optimized},\n` : `"" : "${optimized}",\n`;
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
			.join('|')
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

	$: previewScrollbarOptions = {
		className: $preferences.scrollbarTheme,
	};

	$: textareaScrollbarOptions = {
		className: $preferences.scrollbarTheme,
		resize: 'vertical',
	};

	optimizeSvg();
</script>

<main class="min-h-screen grid grid-cols-1 grid-rows-[auto_1fr_auto] gap-y-2 items-center">
	<section class="flex flex-col xs:flex-row items-center justify-between gap-4 p-4 sticky top-0 z-[9] bg-primary-50/95 dark:bg-primary-900/90 backdrop-blur-lg">
		<Logo />

		<div class="flex items-center gap-2">
			{#if finalOutput?.length > 0}
				<button
					class="min-h-[2.125rem] inline-flex gap-1 justify-center items-center px-2 py-1 text-sm bg-primary-50 dark:bg-primary-900  text-primary-800 dark:text-white transition duration-150 ease-in-out  border border-primary-500 dark:border-primary-700 rounded-md hover:text-primary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50 active:bg-primary-100 dark:active:bg-primary-800"
					on:click={clearData}
					transition:slide
				>
					<Delete class="w-4" />
					Clear
				</button>
			{/if}

			<ThemeSwitcher />

			<OptionsPanel>
				<OptionToggle clickEvent={() => optimizeSvg()} bind:checked={options.jsxifyAttributes} label="camelCase attributes" description="Useful for icons as React components (JSX)" />
				<OptionToggle clickEvent={() => optimizeSvg()} bind:checked={options.doubleToSingleQuotes} label="Convert double to single quotes" />
				<OptionToggle clickEvent={() => optimizeSvg()} bind:checked={options.addMissingFillNone} label="Add missing fills" description="Useful if WordPress adds weird fills to your icons" />

				{#if options.inputMode === 'file'}
					<OptionToggle clickEvent={() => optimizeSvg()} bind:checked={options.useFilenames} label="Use filenames as object keys" />
				{:else}
					<OptionToggle clickEvent={() => optimizeSvg()} bind:checked={options.batch} label="Process multiple icons at once" description="Separate items with <code>|</code> (<i>pipe</i>)" />
				{/if}

				<hr class="mt-4 border-gray-100 dark:border-primary-700" />

				<OptionToggle clickEvent={() => optimizeSvg()} bind:checked={options.replaceColor} label="Replace a color with currentColor" />

				{#if options.replaceColor}
					<div class="pt-1.5">
						<HexColorInput bind:value={options.colorToReplace} />
					</div>
				{/if}

				<hr class="mt-4 border-gray-100 dark:border-primary-700" />

				<OptionToggle clickEvent={() => optimizeSvg()} bind:checked={options.clearAfterCopyToClipboard} label="Auto-clear after copying output" />

				<hr class="mt-4 border-gray-100 dark:border-primary-700" />

				<p class="text-xs mt-4 text-primary-600 dark:text-primary-400 font-extralight tracking-wider">
					SVG2WP v3.0.3 <br />
					<a href="https://goranalkovic.com">&copy; Goran Alković, 2022</a>
				</p>
			</OptionsPanel>
		</div>
	</section>

	<section id="input" class="text-center w-full px-4 mx-auto max-w-4xl">
		{#if options.inputMode === 'file'}
			<div
				class="cursor-pointer dark:bg-primary-900 bg-gradient-to-br from-primary-500/0 to-primary-500/5 dark:from-primary-800/0 dark:to-primary-800/20 border border-dashed border-primary-200 dark:border-primary-700 rounded-md focus-within:border-solid focus-within:ring-4 focus-within:ring-primary-500/50 focus-within:border-primary-500 dark:focus-within:border-primary-700 transition"
				in:slide
			>
				<Dropzone on:drop={handleFilesSelect} accept=".svg" containerClasses="file-dropzone">
					<p class="text-md text-primary-800 dark:text-primary-200 pointer-events-none select-none">Click or drag SVGs here</p>
				</Dropzone>
			</div>
			<button
				class="mt-8 px-1.5 py-1 rounded transition border border-primary-100 dark:border-primary-800 text-sm text-primary-600 dark:text-primary-500 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50 focus-visible:border-primary-500 dark:focus-visible:border-primary-700"
				on:click|preventDefault|stopPropagation={() => (options.inputMode = 'text')}>Enter SVG code instead</button
			>
		{:else}
			<div in:slide>
				<textarea
					class=" bg-white dark:bg-primary-950 dark:text-white transition rounded-md p-2 text-sm text-left font-mono border border-primary-100 dark:border-primary-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50"
					class:focus-visible:ring-red-100={currentSvgString?.length && inputInvalid}
					class:border-red-700={currentSvgString?.length && inputInvalid}
					class:dark:border-red-300={currentSvgString?.length && inputInvalid}
					bind:value={currentSvgString}
					on:input={convertOnType}
					rows="16"
					spellcheck="false"
					use:scrollbar={textareaScrollbarOptions}
				/>

				{#if currentSvgString?.length && inputInvalid}
					<p class="mt-2 text-sm text-red-700 dark:text-red-300" transition:slide>Something's not right, check your input.</p>
				{/if}

				<button
					on:click={() => {
						options.inputMode = 'file';
						clearData();
					}}
					class="mx-auto mt-8 px-1.5 py-1 rounded transition border border-primary-100 dark:border-primary-800 text-sm text-primary-600 dark:text-primary-500 select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50 focus-visible:border-primary-500 dark:focus-visible:border-primary-700"
				>
					Upload files instead
				</button>
			</div>
		{/if}
	</section>
	{#if finalOutput?.length > 0}
		<section id="output" class="my-10 text-center w-full px-4 mx-auto max-w-4xl" transition:slide>
			{#if currentSvgString?.length && !inputInvalid}
				<h2 class="text-2xl font-medium text-primary-500 dark:text-primary-200 mt-8">Added SVGs</h2>
				<div use:scrollbar={previewScrollbarOptions} class="overflow-x-auto mt-4">
					<div class="flex items-center mx-auto flex-nowrap gap-3 overflow-hidden w-max pb-3">
						{#if options.inputMode === 'file'}
							{#each uploadedImages as item, i (item.name)}
								<div animate:flip={{ duration: 400 }} class="flex flex-col items-center gap-1" in:fade out:fly={{ y: 20, duration: 250 }}>
									<span class="text-gray-400 dark:text-primary-500 inline-block w-20 line-clamp-1 text-[0.6rem]">{item.name}</span>

									<div class="shrink-0 w-16 aspect-square p-2 border border-primary-200 dark:border-primary-600 rounded">
										<div class="item-preview">
											{@html item?.content ?? ''}
										</div>
									</div>

									<button class="inline-block mx-auto mb-1 text-primary-400 hover:text-red-500 dark:text-primary-700 dark:hover:text-red-400 transition" on:click={() => removeFile(i)}>
										<Delete class="w-5" />
									</button>
								</div>
							{/each}
						{:else}
							{#each currentSvgString.split('|') as item}
								<div class="shrink-0 w-20 aspect-square p-2 border border-primary-200 dark:border-primary-600 rounded">
									<div class="item-preview">
										{@html item}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			{/if}

			<h2 class="text-2xl font-medium text-primary-500 dark:text-primary-200 mt-8">Output</h2>
			<button class="relative mt-4 w-full" on:click={copyToClipboard}>
				<code class="w-full inline-block text-left text-xs h-48 overflow-hidden select-none masked-output-preview text-primary-700 dark:text-primary-100">{finalOutput}</code>
				<p
					class="inline-block text-sm p-2 rounded-lg border border-primary-600 bg-primary-500 text-white shadow shadow-primary-600/50 dark:shadow-primary-700/50 w-28 mx-auto absolute bottom-6 left-0 right-0"
				>
					Click to copy
				</p>
			</button>
		</section>
	{/if}
</main>

<Toaster />
