<script context="module">
  import { loadSelf, me } from "../stores/me";

  export const load = async ({ session, params, fetch }) => {
    if (!session) return { status: 302, redirect: "/login" };
    const user = await fetch(`/api/@${params.at}`).then((res) => res.json());
    await loadSelf(fetch);
    return { props: { user } };
  };
</script>

<script>
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";
  export let user;
</script>

<Interface>
  <div class="border-x border-slate-300 divide-y divide-slate-300 min-h-screen">
    <div>
      <div class="block bg-slate-200 h-32" />
      <div class="p-4 flex items-center gap-3 -mt-[2rem]">
        <img src={user.avatar} alt="Avatar" class="rounded-full w-24 aspect-square" />
        <div>
          <h2 class="text-xl font-semibold">@{user.at}</h2>
          {#if user.bio}
            <p>{user.bio}</p>
          {:else}
            <p class="text-slate-400">No bio provided</p>
          {/if}
        </div>
        {#if user.id != $me.id}
          <button
            class="ml-auto btn sky"
            on:click={() =>
              fetch(`/api/@${user.at}?follow`, { method: "POST" })
                .then((res) => res.json())
                .then((res) => (user.following = res.following))}
          >
            {user.following ? "Unfollow" : "Follow"}
          </button>
        {/if}
      </div>
    </div>

    {#each user.posts.map((post) => ({ ...post, author: user })) as post}
      <Post {post} />
    {/each}
  </div>
</Interface>
