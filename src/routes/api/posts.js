import { connect, postRepo, userRepo } from "$lib/redis";

export const get = async ({ locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  const following = user.following ? [...user.following, user.entityId] : [user.entityId];

  const posts = (await postRepo.search().where("author").in(following).sortBy("timestamp", "DESC").page(0, 30)).map(
    async (post) => {
      const author = await userRepo.fetch(post.author);
      return {
        content: post.content,
        timestamp: post.timestamp,
        likes: post.likes.length,
        author: {
          at: author.at,
          avatar: author.avatar || "/images/default.png",
        },
      };
    }
  );

  return { body: await Promise.all(posts) };
};

export const post = async ({ request, locals }) => {
  const body = await request.formData();
  const acceptsJson = request.headers.get("accept") == "application/json";
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };

  await connect();
  const post = await postRepo.save(
    postRepo.createEntity({
      author: locals.session.uid,
      content: body.get("content"),
      timestamp: Math.round(Date.now() / 1000),
      likes: [],
    })
  );

  return acceptsJson ? { body: { success: true } } : { status: 302, headers: { Location: "/" } };
};
