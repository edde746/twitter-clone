import { connect, postRepo } from "$lib/redis";

export const get = async ({ locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  // This is inefficient
  let trendingTags = {};
  (
    await postRepo
      .search()
      .where("timestamp")
      .greaterThan(new Date() / 1000 - 24 * 60 * 60)
      .returnAll()
  ).forEach((post) =>
    post?.hashtags
      ?.filter((e) => e)
      .forEach((tag) => (trendingTags[tag] = trendingTags.hasOwnProperty(tag) ? trendingTags[tag] + 1 : 1))
  );
  trendingTags = Object.entries(trendingTags);

  return { body: { trending: trendingTags.sort((a, b) => b[1] - a[1]).slice(0, 3) } };
};
