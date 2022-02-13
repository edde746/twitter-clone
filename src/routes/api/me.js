import { connect, disconnect, userRepo } from "$lib/redis";

export const get = async ({ request, locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  await disconnect();
  return { body: { id: user.entityId, at: user.at, email: user.email, avatar: user.avatar || "/images/default.png" } };
};
