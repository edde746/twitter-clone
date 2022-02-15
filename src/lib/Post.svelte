<script>
  import { HeartIconOutline, HeartIconSolid, RefreshIconOutline } from "@codewithshin/svelte-heroicons";
  import { authors } from "../stores/authors";
  import { DateTime } from "luxon";
  import { toasts } from "svelte-toasts";
  import { me } from "../stores/me";
  export let post, pushFront;
  let author = $authors[post.repost || post.author];

  const addLinks = (content, mentions) => {
    mentions?.forEach((mention) => {
      content = content.replace(mention, `<a class="mention" href="/${mention}">${mention}</a>`);
    });
    content = content.replace(/\$[A-Za-z0-9]+/g, (tag) => `<a class="tag" href="/${tag}">${tag}</a>`);
    return content;
  };
</script>

<div class="p-4">
  <div class="flex gap-2">
    <div class="relative">
      {#if post.repost}
        <img src={$authors[post.repost]?.avatar} alt="OP" class="h-6 w-6 rounded-full mr-2 mb-2" />
        <img
          src={$authors[post.author]?.avatar || $me?.avatar}
          alt="Reposter"
          class="h-6 w-6 rounded-full absolute left-2 top-2"
        />
      {:else}
        <img src={$authors[post.author]?.avatar || $me?.avatar} alt="Avatar" class="h-8 w-8 rounded-full" />
      {/if}
    </div>
    <div class="flex-1">
      <div class="flex justify-between items-center">
        <p class="font-semibold text-sm">
          <a href={`/@${$authors[post.author]?.at || $me?.at}`}>@{$authors[post.author]?.at || $me?.at}</a>
          {#if post.repost}
            <span class="font-normal">reposted from</span>
            <a href={`/@${$authors[post.repost]?.at}`}>@{$authors[post.repost]?.at}</a>
          {/if}
        </p>
        <span class="text-slate-400 text-sm">{DateTime.fromSeconds(post.timestamp).toRelative()}</span>
      </div>
      <p>{@html addLinks(post.content, post.mentions)}</p>
      <div class="grid grid-cols-4">
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
            <HeartIconOutline className="h-5 w-5 hover:text-red-500 transition" />
          {/if}
          <span class="text-sm">{post.likes || 0}</span>
        </div>
        <div
          class="cursor-pointer"
          on:click={() => {
            if (post.repost) toasts.error({ title: "Failed", description: "You can not repost a repost" });
            fetch("/api/repost", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ post: post.id }),
            })
              .then((res) => res.json())
              .then((res) => {
                if (res.success) {
                  toasts.success({ title: "Reposted", description: "Successfully reposted" });
                  if (pushFront) pushFront({ ...res.post, id: res.id });
                } else {
                  toasts.error({ title: "Error", description: res.error });
                }
              });
          }}
        >
          <RefreshIconOutline className="h-5 w-5 hover:text-slate-600 transition" />
        </div>
      </div>
    </div>
  </div>
</div>
