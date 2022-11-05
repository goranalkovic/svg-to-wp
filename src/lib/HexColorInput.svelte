<script>
	import { slide } from 'svelte/transition';

	export let value;
	export let inputEvent = null;

	$: colorInvalid = value.match(/\#{1}[a-fA-F0-9]{6}/g) === null && value.match(/\#{1}[a-fA-F0-9]{3}/g) === null || (value?.length !== 4 && value?.length !== 7);
</script>

<label class="flex flex-col gap-2">
	<input type="text" class:border-red-400={colorInvalid} class:dark:border-red-200={colorInvalid} class="w-20 tracking-wider border bg-white dark:bg-primary-900/60 border-gray-400 dark:border-primary-900 rounded-md px-1.5 py-0.5 font-mono text-lg transition" bind:value on:input={inputEvent} maxlength="7" minlength="4" />

	{#if colorInvalid}
		<span transition:slide class="text-xs text-red-700 dark:text-red-300">
			Color should be in the hexadecimal format <br/> (e.g. <b class="font-medium">#ABC</b> or <b class="font-medium">#ABC123</b>, using 0-9, A-F)
		</span>
	{/if}
</label>
