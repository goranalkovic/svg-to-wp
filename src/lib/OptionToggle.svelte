<script>
	import { Switch, SwitchGroup, SwitchLabel } from '@rgossiaux/svelte-headlessui';

	/**
	 * @param {(string | false | null | undefined)[]} classes
	 */
	function classnames(...classes) {
		return classes.filter(Boolean).join(' ');
	}

	export let checked = false;
	export let label;
	export let description = null;
	export let clickEvent = null;

	let audio;
</script>

<SwitchGroup as="div" class="flex items-center gap-3 justify-between pt-4">
	<SwitchLabel class="select-none flex flex-col grow">
		<span class="text-[0.8125rem] tracking-wide">{@html label}</span>

		{#if description}
			<span class="text-[0.6875rem] tracking-wide text-gray-500 dark:text-gray-400">{@html description}</span>
		{/if}
	</SwitchLabel>

	<Switch
		as="button"
		{checked}
		on:change={(event) => {
			checked = event.detail;
			
			if (clickEvent) {
				audio.src = checked ? '/sounds/click-3.mp3' : '/sounds/click-2.mp3';
				audio?.play();
				clickEvent(event);
			}
		}}
		class={({ checked }) =>
			classnames(
				'relative inline-flex flex-shrink-0 h-6 border-2 border-transparent rounded-full cursor-pointer w-[2.625rem] focus:outline-none focus:shadow-outline transition ease-in-out duration-200 focus-visible:outline-none focus-visible:ring-4',
				checked ? 'bg-primary-400 focus-visible:ring-primary-200 dark:focus-visible:ring-white/80' : 'bg-gray-500 dark:bg-primary-950 focus-visible:ring-primary-200/90 dark:focus-visible:ring-primary-500'
			)}
		let:checked
	>
		<span
			class={classnames(
				'inline-block w-4 h-4 bg-white rounded-full transform transition ease-in-out duration-200 translate-y-0.5 shadow-sm',
				checked ? 'translate-x-5 dark:bg-primary-50' : 'translate-x-0.5 dark:bg-primary-600'
			)}
		/>
	</Switch>
</SwitchGroup>

<audio src="/sounds/click-2.mp3" bind:this={audio} preload="metadata"></audio>