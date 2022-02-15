<script>
  import {
    BellIconSolid,
    ChevronRightIconSolid,
    CogIconSolid,
    DotsHorizontalIconSolid,
    HashtagIconSolid,
    HomeIconSolid,
  } from "@codewithshin/svelte-heroicons";
  import { me } from "../stores/me";
  import { trending } from "../stores/trending";
</script>

<div class="max-w-7xl mx-auto">
  <div
    class="grid grid-cols-[auto_minmax(0,1fr)_0] md:grid-cols-[18rem_minmax(0,1fr)_0] lg:grid-cols-[18rem_minmax(0,1fr)_18rem]"
  >
    <div class="flex flex-col gap-2 sticky top-0 p-4 h-screen">
      <a class="sidelink" href="/">
        <HomeIconSolid />
        <span>Home</span>
      </a>
      <a class="sidelink" href="/discover">
        <HashtagIconSolid />
        <span>Discover</span>
      </a>
      <a class="sidelink" href="/notifications">
        <BellIconSolid />
        <span>Notifications</span>
      </a>
      <a class="sidelink" href="/settings">
        <CogIconSolid />
        <span>Settings</span>
      </a>

      <a href={`/@${$me?.at}`} class="flex gap-2 items-center sidelink mt-auto">
        <img src={$me?.avatar} alt="Avatar" class="w-6 md:w-8 lg:w-10 aspect-square rounded-full" />
        <div class="hidden md:block">
          <p class="font-semibold">@{$me?.at}</p>
          <p class="text-sm">{$me?.email}</p>
        </div>
      </a>
    </div>
    <slot />
    <div class="p-4 hidden lg:block">
      <form method="get" action="/search" class="grid gap-3">
        <input type="text" name="q" class="field w-full border border-slate-300 rounded-[1rem]" placeholder="Search" />
        <div class="border border-slate-300 rounded-[1rem] p-4 bg-white grid gap-2">
          <h2 class="text-lg">Trending</h2>
          {#if $trending?.trending?.length}
            {#each $trending.trending as trend}
              <a class="text-sm flex justify-between items-center group" href={`/${trend[0]}`}>
                <div>
                  <p class="group-hover:underline">{trend[0]}</p>
                  <p class="text-slate-400">{trend[1]} posts</p>
                </div>
                <ChevronRightIconSolid />
              </a>
            {/each}
          {:else}
            <p class="text-slate-400">No active trends</p>
          {/if}
        </div>
        <div class="px-4 flex gap-2 text-xs">
          <p class="cursor-pointer text-slate-500 hover:underline">Terms of Service</p>
          <p class="cursor-pointer text-slate-500 hover:underline">Privacy Policy</p>
          <p class="cursor-pointer text-slate-500 hover:underline flex gap-1 items-center">
            More <DotsHorizontalIconSolid className="h-3 w-3" />
          </p>
        </div>
      </form>
    </div>
  </div>
</div>
