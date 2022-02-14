import { connect, disconnect, userRepo } from "$lib/redis";

export const get = async ({ locals }) => {
  if (!locals.session) return { status: 403, body: { error: "Not authorized" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  await disconnect();
  return { body: { id: user.entityId, at: user.at, email: user.email, avatar: user.avatar || "/images/default.png" } };
};

export const post = async ({ request, locals }) => {
  const body = await request.formData();
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };
  if (body.has("bio") && body.get("bio").length > 64) return { status: 400, body: { error: "Invalid input" } };
  
  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  if (body.has("bio")) user.bio = body.get("bio");
  userRepo.save(user);
  await disconnect();

  return { body: { success: true } };
};
