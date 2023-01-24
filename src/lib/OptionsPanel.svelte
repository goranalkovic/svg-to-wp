<script>
	import { Popover, PopoverButton, PopoverOverlay, PopoverPanel, Transition } from '@rgossiaux/svelte-headlessui';
	import Settings from '@svicons/fluentui-system-regular/settings.svelte';

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

<Popover as="div" class="xs:relative">
	<Transition enter="ease-out duration-300 fixed z-20" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-300 fixed z-20" leaveFrom="opacity-100" leaveTo="opacity-0"
	on:beforeEnter={() => toggleOpen()}
	on:afterLeave={() => toggleOpen()}
	>
		<PopoverOverlay class="bg-white/25 dark:bg-primary-950/30 transition-colors fixed inset-0 z-20 transform" />
	</Transition>

	<PopoverButton
		class="min-h-[2.125rem] inline-flex gap-1 justify-center items-center px-2 py-1 text-sm bg-primary-50 dark:bg-primary-900  text-primary-800 dark:text-white transition duration-150 ease-in-out  border border-primary-500 dark:border-primary-700 rounded-md hover:text-primary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50 active:bg-primary-100 dark:active:bg-primary-800 z-30"
	>
		<Settings class="w-4" />
		Options
	</PopoverButton>

	<Transition
		enter="transition duration-200 ease-out"
		enterFrom="transform scale-95 opacity-0"
		enterTo="transform scale-100 opacity-100"
		leave="transition duration-200 ease-out"
		leaveFrom="transform scale-100 opacity-100"
		leaveTo="transform scale-95 opacity-0"
	>
		<PopoverPanel
			class="flex flex-col gap-2 absolute left-4 right-4 xs:left-auto xs:right-0 xs:w-96 max-w-sm p-4 mt-2 origin-top-right bg-white dark:bg-primary-800 border border-gray-200 dark:border-primary-700  rounded-md shadow-lg dark:shadow-primary-800/40 outline-none overflow-hidden z-30"
		>
			<h2 class="text-xl">Options</h2>

			<div>
				<slot />
			</div>
		</PopoverPanel>
	</Transition>
</Popover>

<audio src="/sounds/click-1.mp3" bind:this={audio} preload="metadata"></audio>
