<script context="module">
  import { loadSelf } from "../stores/me";

  export const load = async ({ session, fetch }) => {
    if (!session) return { status: 302, redirect: "/login" };
    const posts = await fetch("/api/posts").then((res) => res.json());
    await loadSelf(fetch);
    return { props: { posts } };
  };
</script>

<script>
  import { toasts } from "svelte-toasts";
  import { enhance } from "$lib/form";
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";

  export let posts;
  let postForm, postMessage;

  const updatePosts = () =>
    fetch("/api/posts")
      .then((res) => res.json())
      .then((updated) => (posts = updated));
</script>

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

    {#each posts.posts.map((post) => ({ ...post, author: posts.authors[post.author] })) as post}
      <Post {post} />
    {/each}

    <h2 class="text-center p-4">End of feed</h2>
  </div>
</Interface>
