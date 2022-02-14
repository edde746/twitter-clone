<script context="module">
  import { me } from "../stores/me";

  export const load = async ({ session, params, fetch }) => {
    if (!session) return { status: 302, redirect: "/login" };
    const user = await fetch(`/api/@${params.at}`).then((res) => res.json());
    return { props: { user } };
  };
</script>

<script>
  import { CheckIconSolid, PencilIconSolid } from "@codewithshin/svelte-heroicons";
  import { toasts } from "svelte-toasts";
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";
  import { enhance } from "$lib/form";
  import { onMount } from "svelte";
  export let user;
  let editingBio = false;
  let bio;

  onMount(() => (bio = user.bio));
</script>

<Interface>
  <div class="border-x border-slate-300 divide-y divide-slate-300 min-h-screen">
    <div>
      <div class="block bg-slate-200 h-32" />
      <div class="p-4 flex items-center gap-3 -mt-[2rem]">
        <img src={user.avatar} alt="Avatar" class="rounded-full w-24 aspect-square" />
        <div>
          <h2 class="text-xl font-semibold">@{user.at}</h2>
          <div class="flex gap-2 items-center bio">
            <p>{user.followers} followers</p>
            &bullet;
            {#if editingBio}
              <form
                action="/api/me"
                method="post"
                class="flex gap-2 items-center"
                use:enhance={{
                  callback: async (res) => {
                    const body = await res.json();
                    if (body.success) {
                      toasts.success({
                        title: "Success",
                        description: "Your bio has been updated",
                      });
                      user.bio = bio;
                      editingBio = false;
                    } else {
                      toasts.error({
                        title: "Error",
                        description: body.error,
                      });
                    }
                  },
                }}
              >
                <input type="text" name="bio" bind:value={bio} placeholder="Bio" class="bg-transparent" />
                <button type="submit"> <CheckIconSolid className="h-5 w-5 cursor-pointer" /> </button>
              </form>
            {:else}
              {#if user.bio}
                <p>{user.bio}</p>
              {:else}
                <p class="text-slate-400">No bio provided</p>
              {/if}
              {#if user.id == $me.id}
                <div class="edit" on:click={() => (editingBio = true)}>
                  <PencilIconSolid className="h-5 w-5 cursor-pointer" />
                </div>
              {/if}
            {/if}
          </div>
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
