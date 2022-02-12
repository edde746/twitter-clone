<script>
  import { XCircleIconSolid, InformationCircleIconSolid, CheckCircleIconSolid } from "@codewithshin/svelte-heroicons";
  import { onMount } from "svelte";

  export let data;
  let colorClass;
  onMount(() => {
    switch (data.type) {
      case "info":
        colorClass = "text-sky-500";
        break;
      case "error":
        colorClass = "text-red-500";
        break;
      case "success":
        colorClass = "text-green-500";
        break;
    }
  });
</script>

<div class="bg-zinc-50 w-full rounded-md shadow-md text-zinc-600 px-4 py-2 flex gap-3">
  {#if data.type == "error"}
    <XCircleIconSolid className="{colorClass} h-6 w-6" />
  {:else if data.type == "info"}
    <InformationCircleIconSolid className="{colorClass} h-6 w-6" />
  {:else if data.type == "success"}
    <CheckCircleIconSolid className="{colorClass} h-6 w-6" />
  {/if}
  <div>
    <p class="text-sm font-semibold {colorClass}">{data.title}</p>
    <p class="text-zinc-400">{data.description}</p>
  </div>
</div>
