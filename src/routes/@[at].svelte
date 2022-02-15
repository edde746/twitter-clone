<script context="module">
  import { loadSelf, me } from "../stores/me";
  import { authors } from "../stores/authors";
  import { get } from "svelte/store";

  export const load = async ({ session, fetch, params }) => {
    if (!session && !Object.keys(get(me)).length) return { status: 302, redirect: "/login" };
    const user = await fetch(`/api/@${params.at}`).then((res) => res.json());
    if (user.error) return { status: 302, redirect: "/" };
    const feed = await fetch(`/api/posts?u=${user.id}`).then((res) => res.json());
    authors.set({ ...get(authors), ...feed.authors });
    return { props: { user, feed } };
  };
</script>

<script>
  import { CheckIconSolid, CloudUploadIconSolid, PencilIconSolid } from "@codewithshin/svelte-heroicons";
  import { toasts } from "svelte-toasts";
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";
  import { enhance } from "$lib/form";
  export let user, feed;
  let editingBio = false;
  let avatarUpload;
  let page = 0;
  let disablePostFetch = false;
</script>

<svelte:head>
  <title>@{user.at}</title>
</svelte:head>

<svelte:window
  on:scroll={(e) => {
    if (!disablePostFetch && window.innerHeight * 1.1 + window.scrollY >= document.body.offsetHeight) {
      disablePostFetch = true;
      fetch(`/api/posts?u=${user.id}&p=${++page}`)
        .then((res) => res.json())
        .then((res) => {
          disablePostFetch = res.posts.length == 0;
          feed.posts = [...feed.posts, ...res.posts];
        });
    }
  }}
/>

<input
  type="file"
  name="avatar"
  class="hidden"
  accept=".png,.jpg,.jpeg,.bmp,.tiff"
  bind:this={avatarUpload}
  on:change={(e) => {
    let body = new FormData();
    body.append("avatar", e.target.files[0]);
    fetch("/api/me?avatar", {
      method: "post",
      body,
    })
      .then((res) => res.json())
      .then((res) => {
        loadSelf(fetch, true);
        user.avatar = res.avatar;
      });
  }}
/>

<Interface>
  <div class="border-x border-slate-300 divide-y divide-slate-300 min-h-screen">
    <div>
      <div class="block bg-slate-200 h-32" />
      <div class="p-4 flex items-center gap-3 -mt-[2rem]">
        <div
          class="relative rounded-full overflow-hidden group"
          on:click={() => user.id == $me.id && avatarUpload.click()}
        >
          {#if user.id == $me.id}
            <div
              class="group-hover:bg-black block group-hover:bg-opacity-10 absolute inset-0 transition cursor-pointer"
            />
            <CloudUploadIconSolid
              className="absolute top-2/4 left-2/4 translate-x-[-50%] translate-y-[-50%] h-6 w-6 text-slate-200 opacity-0 group-hover:opacity-60 cursor-pointer"
            />
          {/if}
          <img src={user.avatar} alt="Avatar" class="w-24 aspect-square" />
        </div>
        <div>
          <h2 class="text-xl font-semibold">@{user.at}</h2>
          <div class="flex gap-2 items-center bio">
            <p>{user.followers} followers</p>
            &bullet;
            {#if editingBio}
              <form
                action="/api/me?bio"
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
                <input
                  type="text"
                  name="bio"
                  bind:value={user.bio}
                  placeholder="Bio"
                  class="bg-transparent"
                  maxlength="64"
                />
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
                .then((res) => {
                  if (user.following && !res.following) user.followers -= 1;
                  else if (!user.following && res.following) user.followers += 1;
                  user.following = res.following;
                })}
          >
            {user.following ? "Unfollow" : "Follow"}
          </button>
        {/if}
      </div>
    </div>

    {#each feed.posts as post}
      <Post {post} />
    {/each}
  </div>
</Interface>
