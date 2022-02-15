import { connect, postRepo, userRepo } from "$lib/redis";
import { formatPosts } from "$lib/utils";
import sanitize from "sanitize-html";

export const get = async ({ url, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);

  // Select posts from only these authors
  let authors;
  if (url.searchParams.has("u")) authors = [url.searchParams.get("u")];
  else authors = (user.following ? [...user.following, user.entityId] : [user.entityId]).filter((followed) => followed);

  let posts = [];
  const offset = (url.searchParams.get("p") || 0) * 20;
  if (url.searchParams.has("discover")) {
    posts = formatPosts(await postRepo.search().sortBy("timestamp", "DESC").page(offset, 20), locals.session.uid);
  } else if (url.searchParams.has("tag")) {
    posts = formatPosts(
      await postRepo
        .search()
        .where("hashtags")
        .contain(`\$${url.searchParams.get("tag")}`)
        .sortBy("timestamp", "DESC")
        .page(offset, 20),
      locals.session.uid
    );
  } else {
    posts = formatPosts(
      await postRepo.search().where("author").in(authors).sortBy("timestamp", "DESC").page(offset, 20),
      locals.session.uid,
      !url.searchParams.has("u")
    );
  }

  return { body: await posts };
};

export const post = async ({ request, locals }) => {
  const body = await request.formData();
  const acceptsJson = request.headers.get("accept") == "application/json";
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };
  if (!body.has("content") || body.get("content").length > 256)
    return { status: 400, body: { error: "Invalid input" } };

  const content = sanitize(body.get("content"), {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "recursiveEscape",
  });
  if (content.length <= 0) return { status: 400, body: { error: "Invalid input" } };

  await connect();
  // Filter mentions at correct users
  const mentions = (
    await Promise.all(
      [...content.matchAll(/@[A-Za-z0-9]+/g)].map(async (mentioned) => ({
        exists: await userRepo.search().where("at").match(mentioned[0].substr(1)).returnCount(),
        at: mentioned[0],
      }))
    )
  )
    .filter((user) => user.exists)
    .map((mention) => mention.at);

  // Get hashtags
  const hashtags = [...content.matchAll(/\$[A-Za-z0-9]+/g)].map((tag) => tag[0]);

  const post = await postRepo.save(
    postRepo.createEntity({
      author: locals.session.uid,
      content,
      mentions,
      hashtags,
      timestamp: Math.round(Date.now() / 1000),
      likes: [],
    })
  );

  return acceptsJson
    ? { body: { success: true, post, content, mentions } }
    : { status: 302, headers: { Location: "/" } };
};

export const patch = async ({ request, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };
  const body = await request.json();

  await connect();
  const post = await postRepo.fetch(body.post);

  if (post.likes.includes(locals.session.uid)) post.likes = post.likes.filter((liker) => liker != locals.session.uid);
  else post.likes = [...post.likes, locals.session.uid];

  await postRepo.save(post);

  return { body: { liked: post.likes.includes(locals.session.uid), likes: post.likes.length - 1 } };
};
