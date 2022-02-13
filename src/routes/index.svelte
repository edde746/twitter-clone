<script context="module">
  export const load = async ({ session, fetch }) => {
    if (!session) return { status: 302, redirect: "/login" };
    const me = await fetch("/api/me").then((res) => res.json());
    const posts = await fetch("/api/posts").then((res) => res.json());
    return { props: { me, posts } };
  };
</script>

<script>
  import {
    BellIconSolid,
    CogIconSolid,
    HashtagIconSolid,
    HeartIconOutline,
    HeartIconSolid,
    HomeIconSolid,
  } from "@codewithshin/svelte-heroicons";
  import { toasts } from "svelte-toasts";
  import { enhance } from "$lib/form";

  export let me, posts;
  let postForm, postMessage;

  const updatePosts = () =>
    fetch("/api/posts")
      .then((res) => res.json())
      .then((updated) => (posts = updated));
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

      <a href={`/@${me.at}`} class="flex gap-2 items-center sidelink mt-auto">
        <img src={me.avatar} alt="Avatar" class="w-6 md:w-8 lg:w-10 aspect-square rounded-full" />
        <div class="hidden md:block">
          <p class="font-semibold">@{me.at}</p>
          <p class="text-sm">{me.email}</p>
        </div>
      </a>
    </div>
    <div class="border-x border-slate-300 divide-y divide-slate-300 min-h-screen">
      <form
        bind:this={postForm}
        action="/api/posts"
        method="post"
        class="bg-slate-100 bg-opacity-50 p-4 space-y-2"
        use:enhance={{
          callback: async (res) => {
            const body = await res.json();
            if (body.success) {
              toasts.success({
                title: "Success",
                description: "Your post has been published",
              });
              postForm.reset();
              postMessage = "";
              updatePosts();
            } else {
              toasts.error({
                title: "Error",
                description: body.error,
              });
            }
          },
        }}
      >
        <textarea
          class="w-full resize-none bg-transparent"
          placeholder="Write a message..."
          name="content"
          maxlength="256"
          bind:value={postMessage}
        />
        <div class="flex justify-between items-center">
          <p class="text-sm font-semibold text-slate-500">{postMessage?.length || 0}/256</p>
          <button class="btn sky" type="submit">Post</button>
        </div>
      </form>

      {#each posts as post}
        <div class="flex gap-2 p-4">
          <img src={post.author.avatar} alt="Avatar" class="h-6 w-6 rounded-full" />
          <div class="flex-1">
            <div class="flex justify-between items-center">
              <a class="font-semibold text-sm" href={`/@${post.author.at}`}>@{post.author.at}</a>
              <span class="text-slate-400 text-sm">{new Date(post.timestamp * 1000).toLocaleString()}</span>
            </div>
            <p>{post.content}</p>
            <div class="flex justify-between">
              <div
                class="cursor-pointer flex gap-2 items-center"
                on:click={() =>
                  fetch("/api/posts", {
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    method: "PATCH",
                    body: JSON.stringify({ post: post.id }),
                  })
                    .then((res) => res.json())
                    .then((res) => (post = { ...post, ...res }))}
              >
                {#if post.liked}
                  <HeartIconSolid className="h-5 w-5 text-red-500" />
                {:else}
                  <HeartIconOutline className="h-5 w-5 hover:text-red-500" />
                {/if}
                <span class="text-sm">{post.likes}</span>
              </div>
            </div>
          </div>
        </div>
      {/each}

      <h2 class="text-center p-4">End of feed</h2>
    </div>
    <div class="p-4 hidden lg:block">
      <input type="text" class="field w-full" placeholder="Search" />
    </div>
  </div>
</div>
