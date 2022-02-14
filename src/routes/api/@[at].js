import { connect, disconnect, userRepo, postRepo } from "$lib/redis";

export const get = async ({ params, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const user = await userRepo.search().where("at").matchExact(params.at).returnFirst();
  if (!user) {
    await disconnect();
    return { body: { error: "Could not find user" } };
  }

  const me = await userRepo.fetch(locals.session.uid);
  const followers = await userRepo.search().where("following").contains(user.entityId).returnCount();
  await disconnect();

  return {
    body: {
      id: user.entityId,
      at: user.at,
      bio: user.bio,
      avatar: user.avatar || "/images/default.png",
      followers,
      following: me.following?.includes(user.entityId)
    },
  };
};

export const post = async ({ url, params, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const user = await userRepo.search().where("at").matchExact(params.at).returnFirst();
  if (!user) {
    await disconnect();
    return { body: { error: "Could not find user" } };
  }

  const me = await userRepo.fetch(locals.session.uid);
  if (url.searchParams.has("follow") && user.entityId != me.entityId) {
    if (me.following?.includes(user.entityId))
      me.following = me.following.filter((followed) => followed != user.entityId);
    else me.following = me.following ? [...me.following, user.entityId] : [user.entityId];
  }
  await userRepo.save(me);

  await disconnect();

  return { body: { following: me.following.includes(user.entityId) } };
};
