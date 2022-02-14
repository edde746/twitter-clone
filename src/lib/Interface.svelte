<script>
  import { BellIconSolid, CogIconSolid, HashtagIconSolid, HomeIconSolid } from "@codewithshin/svelte-heroicons";
  import { me } from "../stores/me";
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

      <a href={`/@${$me.at}`} class="flex gap-2 items-center sidelink mt-auto">
        <img src={$me.avatar} alt="Avatar" class="w-6 md:w-8 lg:w-10 aspect-square rounded-full" />
        <div class="hidden md:block">
          <p class="font-semibold">@{$me.at}</p>
          <p class="text-sm">{$me.email}</p>
        </div>
      </a>
    </div>
    <slot />
    <div class="p-4 hidden lg:block">
      <form method="get" action="/search">
        <input type="text" name="q" class="field w-full" placeholder="Search" />
      </form>
    </div>
  </div>
</div>
