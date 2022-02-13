<script>
  import { HeartIconOutline, HeartIconSolid } from "@codewithshin/svelte-heroicons";
  export let post;
</script>

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
