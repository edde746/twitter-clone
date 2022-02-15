<script context="module">
  import { me } from "../stores/me";
  import { authors } from "../stores/authors";
  import { get } from "svelte/store";

  export const load = async ({ session, fetch }) => {
    if (!session && !Object.keys(get(me)).length) return { status: 302, redirect: "/login" };
    const feed = await fetch("/api/posts?discover").then((res) => res.json());
    authors.set({ ...get(authors), ...feed.authors });
    return { props: { feed } };
  };
</script>

<script>
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";
  export let feed;

  let page = 0;
  let disablePostFetch = false;
</script>

<svelte:head>
  <title>Discover</title>
</svelte:head>

<svelte:window
  on:scroll={(e) => {
    if (!disablePostFetch && window.innerHeight * 1.1 + window.scrollY >= document.body.offsetHeight) {
      disablePostFetch = true;
      fetch(`/api/posts?discover&p=${++page}`)
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
    <div class="px-4 py-8">
      <h1 class="text-2xl font-semibold">Discover</h1>
      <p class="text-slate-500">All posts, from everyone</p>
    </div>
    {#each feed.posts as post}
      <Post {post} pushFront={(newPost) => (feed.posts = [newPost, ...feed.posts])} />
    {/each}
  </div>
</Interface>
