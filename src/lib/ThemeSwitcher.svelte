<script>
	import { preferences, ThemeMode, prefersColorSchemeDark } from '../stores';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	import { Menu, MenuButton, MenuItems, MenuItem, Transition } from '@rgossiaux/svelte-headlessui';
	import WeatherMoon from '@svicons/fluentui-system-regular/weather-moon.svelte';
	import WeatherSunny from '@svicons/fluentui-system-regular/weather-sunny.svelte';
	import ArrowSync from '@svicons/fluentui-system-regular/arrow-sync.svelte';

	let htmlElement;

	onMount(() => {
		htmlElement = document.documentElement;
	});

	$: {
		if (htmlElement) {
			const shouldBeDark = ($preferences.theme === ThemeMode.AUTO && $prefersColorSchemeDark) || $preferences.theme === ThemeMode.DARK;

			if (shouldBeDark) {
				htmlElement?.classList?.add('dark');
				$preferences.scrollbarTheme = 'os-theme-light';
			} else {
				htmlElement?.classList?.remove('dark');
				$preferences.scrollbarTheme = 'os-theme-dark';
			}
		}
	}

	const setThemeMode = (mode) => {
		preferences.set({ ...$preferences, theme: mode });

		audio.src = '/sounds/click-2.mp3';
		audio?.play();
	};

	$: isLight = $preferences.theme === ThemeMode.LIGHT;
	$: isAuto = $preferences.theme === ThemeMode.AUTO;
	$: isDark = !isLight && !isAuto;

	$: metaAccent = isDark || (isAuto && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#151521' : '#f0f0f6';

	/**
	 * @param {(string | false | null | undefined)[]} classes
	 */
	function classnames(...classes) {
		return classes.filter(Boolean).join(' ');
	}

	/**
	 * @param {{ active: boolean; disabled: boolean }} props
	 */
	function resolveClass({ active, disabled }) {
		return classnames(
			'flex gap-1.5 w-full px-2 py-2 text-sm leading-5 text-left has-animated-font-props',
			active ? 'text-gray-900 dark:text-primary-300 bg-gradient-to-r from-primary-300/0 to-primary-300/40 dark:from-primary-600/0 dark:to-primary-600/60' : 'text-gray-700 dark:text-white',
			disabled && 'cursor-default theme-is-active text-primary-500 dark:text-primary-200',
			!disabled && 'theme-is-inactive'
		);
	}

	let audio;
	let open = false;

	const toggleOpen = () => {
		open = !open;

		if (!audio) {
			return;
		}

		audio.src = open ? '/sounds/click-1.mp3' : '/sounds/click-4.mp3';
		audio?.play();
	};	
</script>

<svelte:head>
	<meta name="theme-color" content={metaAccent} />
</svelte:head>

<div class="relative inline-block text-left">
	<Menu>
		<span class="rounded-md shadow-sm">
			<MenuButton
				class="min-h-[2.125rem] inline-flex gap-1 justify-center items-center px-2 py-1 text-sm bg-primary-50 dark:bg-primary-900  text-primary-800 dark:text-white transition duration-150 ease-in-out  border border-primary-500 dark:border-primary-700 rounded-md hover:text-primary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50 active:bg-primary-100 dark:active:bg-primary-800"
			>
				{#if isAuto}
					<div in:slide>
						<ArrowSync class="w-4" />
					</div>
				{:else if isLight}
					<div in:slide>
						<WeatherSunny class="w-4" />
					</div>
				{:else}
					<div in:slide>
						<WeatherMoon class="w-4" />
					</div>
				{/if}
				<span class="menu-button-text"> Theme </span>
			</MenuButton>
		</span>

		<Transition
			enter="transition duration-500 ease-out"
			enterFrom="transform scale-95 opacity-0"
			enterTo="transform scale-100 opacity-100"
			leave="transition duration-500 ease-out"
			leaveFrom="transform scale-100 opacity-100"
			leaveTo="transform scale-95 opacity-0"
			on:beforeEnter={() => toggleOpen()}
			on:afterLeave={() => toggleOpen()}
		>
			<MenuItems
				class="absolute right-0 w-44 mt-2 origin-top-right bg-white dark:bg-primary-800 border border-gray-200 dark:border-primary-700 divide-y divide-gray-100 dark:divide-primary-700 rounded-md shadow-lg dark:shadow-primary-800/40 outline-none overflow-hidden"
			>
				<MenuItem as="button" disabled={isAuto} class={resolveClass} on:click={() => setThemeMode(ThemeMode.AUTO)}><ArrowSync class="w-5" /> Follow system</MenuItem>
				<MenuItem as="button" disabled={isLight} class={resolveClass} on:click={() => setThemeMode(ThemeMode.LIGHT)}><WeatherSunny class="w-5" /> Light</MenuItem>
				<MenuItem as="button" disabled={isDark} class={resolveClass} on:click={() => setThemeMode(ThemeMode.DARK)}><WeatherMoon class="w-5" /> Dark</MenuItem>
			</MenuItems>
		</Transition>
	</Menu>
</div>

<style>
	.menu-button-text {
		font-stretch: 85%;
		font-variation-settings: 'GRAD' 43, 'slnt' 0, 'XTRA' 468, 'XOPQ' 96, 'YOPQ' 79, 'YTLC' 800, 'YTUC' 1000, 'YTAS' 750, 'YTDE' -203, 'YTFI' 738;
	}

	:global(.theme-is-inactive) {
		font-stretch: 45%;
		font-style: oblique 0deg;
		font-variation-settings: 'GRAD' -100, 'slnt' 0;
	}

	:global(.theme-is-active) {
		font-stretch: 151%;
		font-style: oblique -4deg;
		font-variation-settings: 'GRAD' 150, 'slnt' -4;
	}

	:global(.has-animated-font-props) {
		transition-property: font-weight, font-stretch, font-variation-settings;
		transition-duration: 0.5s;
		transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
	}
</style>

<audio src="/sounds/click-1.mp3" bind:this={audio} preload="metadata"></audio>