<script context="module">
  export const load = async ({ session, fetch }) => {
    if (!session) return { status: 302, redirect: "/login" };
    const feed = await fetch("/api/posts").then((res) => res.json());
    return { props: { feed } };
  };
</script>

<script>
  import { toasts } from "svelte-toasts";
  import { enhance } from "$lib/form";
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";
  import { me } from "../stores/me";

  export let feed;
  let postForm, postMessage;
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
          disablePostFetch = res.posts.length == 0;
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
            feed.posts = [
              {
                id: body.post,
                author: $me.id,
                content: body.content,
                timestamp: new Date() / 1000,
                likes: 0,
                liked: false,
              },
              ...feed.posts,
            ];
            // Make sure we are one of the authors
            feed.authors[$me.id] = $me;

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
        <p class="text-sm font-semibold text-slate-500">{postMessage?.length || 0}/256</p>
        <button class="btn sky" type="submit">Post</button>
      </div>
    </form>

    {#each feed.posts.map((post) => ({ ...post, author: feed.authors[post.author] })) as post}
      <Post {post} />
    {/each}

    <h2 class="text-center p-4">{feed.posts?.length ? "End of feed" : "No posts in feed"}</h2>
  </div>
</Interface>
