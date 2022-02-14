<script>
  import Interface from "$lib/Interface.svelte";
  import { ChevronRightIconSolid } from "@codewithshin/svelte-heroicons";
  export let results;
</script>

<svelte:head>
  <title>Search</title>
</svelte:head>

<Interface>
  <div class="border-x border-slate-300 divide-y divide-slate-300 min-h-screen">
    {#each results as result}
      <a href={`/@${result.at}`} class="p-4 flex gap-3 items-center hover:bg-slate-100 transition">
        <img src={result.avatar} alt="Avatar" class="h-8 w-8 rounded-full" />
        <div>
          <p>@{result.at}</p>
          <p>{result.followers} followers</p>
        </div>
        <ChevronRightIconSolid className="ml-auto h-5 w-5" />
      </a>
    {/each}
  </div>
</Interface>
