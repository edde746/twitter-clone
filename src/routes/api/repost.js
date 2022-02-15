import { connect, postRepo } from "$lib/redis";

export const post = async ({ request, locals }) => {
  const body = await request.json();
  const acceptsJson = request.headers.get("accept") == "application/json";
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };
  if (!body.hasOwnProperty("post")) return { status: 400, body: { error: "Invalid input" } };

  await connect();

  const post = await postRepo.fetch(body.post);
  if (!post) return { status: 400, body: { error: "Post not found" } };
  if (post.author == locals.session.uid) return { status: 400, body: { error: "You can not repost your own post" } };

  post.repost = post.author;
  post.author = locals.session.uid;
  post.timestamp = Math.round(Date.now() / 1000);

  const repost = await postRepo.save(postRepo.createEntity(post.entityData));

  return acceptsJson
    ? { body: { success: true, id: repost, post: post.entityData } }
    : { status: 302, headers: { Location: "/" } };
};
