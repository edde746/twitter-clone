import { connect, disconnect, userRepo } from "$lib/redis";

export const get = async ({ url, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const results = await Promise.all(
    (
      await userRepo
        .search()
        .where("at")
        .match(url.searchParams.get("q"))
        .returnPage(0, 12)
    ).map(async (user) => ({
      at: user.at,
      avatar: user.avatar || "/images/default.png",
      followers: await userRepo.search().where("following").contains(user.entityId).returnCount(),
    }))
  );
  await disconnect();

  return {
    body: { results },
  };
};
