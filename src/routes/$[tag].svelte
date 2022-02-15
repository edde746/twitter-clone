<script context="module">
  export const load = async ({ params, session, fetch }) => {
    if (!session) return { status: 302, redirect: "/login" };
    const feed = await fetch(`/api/posts?tag=${params.tag}`).then((res) => res.json());
    return { props: { feed, tag: params.tag } };
  };
</script>

<script>
  import Interface from "$lib/Interface.svelte";
  import Post from "$lib/Post.svelte";
  export let feed, tag;

  let page = 0;
  let disablePostFetch = false;
</script>

<svelte:head>
  <title>${tag}</title>
</svelte:head>

<svelte:window
  on:scroll={(e) => {
    if (!disablePostFetch && window.innerHeight * 1.1 + window.scrollY >= document.body.offsetHeight) {
      disablePostFetch = true;
      fetch(`/api/posts?tag=${tag}&p=${++page}`)
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
      <h1 class="text-2xl font-semibold">${tag}</h1>
      <p class="text-slate-500">All posts with the {tag} tag</p>
    </div>
    {#each feed.posts.map((post) => ({ ...post, author: feed.authors[post.author] })) as post}
      <Post {post} />
    {/each}
  </div>
</Interface>
