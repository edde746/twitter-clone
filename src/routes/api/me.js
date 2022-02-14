import { connect, disconnect, userRepo } from "$lib/redis";

export const get = async ({ request, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  await disconnect();
  return { body: { id: user.entityId, at: user.at, email: user.email, avatar: user.avatar || "/images/default.png" } };
};

export const post = async ({ request, locals }) => {
  const body = await request.formData();
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  user.bio = body.get("bio");
  userRepo.save(user);
  await disconnect();

  return { body: { success: true } };
};
