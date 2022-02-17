<script context="module">
  import { me } from "../stores/me";
  import { authors } from "../stores/authors";
  import { get } from "svelte/store";

  export const load = async ({ session, fetch }) => {
    if (!session && !Object.keys(get(me)).length) return { status: 302, redirect: "/login" };
    const feed = await fetch("/api/posts").then((res) => res.json());
    authors.set({ ...get(authors), ...feed.authors });
    return { props: { feed } };
  };
</script>

<script>
  import { toasts } from "svelte-toasts";
  import { enhance } from "$lib/form";
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";
  import { PhotographIconSolid } from "@codewithshin/svelte-heroicons";

  export let feed;
  let postForm, postMessage, attachment;
  let page = 0;
  let disablePostFetch = false;
</script>

<svelte:head>
  <title>twitter-clone</title>
</svelte:head>

<svelte:window
  on:scroll={(e) => {
    if (!disablePostFetch && window.innerHeight * 1.1 + window.scrollY >= document.body.offsetHeight) {
      disablePostFetch = true;
      fetch(`/api/posts?p=${++page}`)
        .then((res) => res.json())
        .then((res) => {
          disablePostFetch = res.posts?.length == 0;
          feed.posts = [...feed.posts, ...res.posts];
          feed.authors = { ...feed.authors, ...res.authors };
        });
    }
  }}
/>

<Interface>
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

            // Add post to pool
            feed.posts = [body.post, ...feed.posts];
            // Make sure we are one of the authors
            let currentAuthors = get(authors);
            currentAuthors[$me.id] = $me;
            authors.set(currentAuthors);

            // Reset input
            postForm.reset();
            postMessage = "";
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
        <div>
          <div class="text-sky-500 hover:text-sky-400 transition cursor-pointer" on:click={() => attachment.click()}>
            <PhotographIconSolid className="h-5 w-5" />
            <input
              type="file"
              name="attachment"
              class="hidden"
              accept=".png,.jpg,.jpeg,.bmp,.tiff"
              bind:this={attachment}
            />
          </div>
        </div>
        <div class="flex gap-4 items-center">
          <p class="text-xs font-semibold text-slate-500">{postMessage?.length || 0}/256</p>
          <button class="btn sky" type="submit">Post</button>
        </div>
      </div>
    </form>

    {#if feed?.posts?.length}
      {#each feed.posts as post}
        <Post {post} pushFront={(newPost) => (feed.posts = [newPost, ...feed.posts])} />
      {/each}
    {/if}

    <h2 class="text-center p-4">{feed.posts?.length ? "End of feed" : "No posts in feed"}</h2>
  </div>
</Interface>
