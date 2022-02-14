import { connect, disconnect, postRepo, userRepo } from "$lib/redis";
import { formatPosts } from "$lib/utils";

export const get = async ({ url, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  // Temporary duplicate check since you are able to follow yourself
  const following = [...new Set(user.following ? [...user.following, user.entityId] : [user.entityId])].filter(
    (followed) => followed
  );

  const posts = await formatPosts(
    await postRepo
      .search()
      .where("author")
      .in(following)
      .sortBy("timestamp", "DESC")
      .page((url.searchParams.get("p") || 0) * 10, 10),
    locals.session.uid
  );

  await disconnect();
  return { body: await posts };
};

export const post = async ({ request, locals }) => {
  const body = await request.formData();
  const acceptsJson = request.headers.get("accept") == "application/json";
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };
  if (!body.has("content") || body.get("content").length > 256)
    return { status: 400, body: { error: "Invalid input" } };

  await connect();
  const post = await postRepo.save(
    postRepo.createEntity({
      author: locals.session.uid,
      content: body.get("content"),
      timestamp: Math.round(Date.now() / 1000),
      likes: [],
    })
  );

  await disconnect();
  return acceptsJson ? { body: { success: true, post } } : { status: 302, headers: { Location: "/" } };
};

export const patch = async ({ request, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };
  const body = await request.json();

  await connect();
  const post = await postRepo.fetch(body.post);

  if (post.likes.includes(locals.session.uid)) post.likes = post.likes.filter((liker) => liker != locals.session.uid);
  else post.likes = [...post.likes, locals.session.uid];

  await postRepo.save(post);

  await disconnect();
  return { body: { liked: post.likes.includes(locals.session.uid), likes: post.likes.length - 1 } };
};
