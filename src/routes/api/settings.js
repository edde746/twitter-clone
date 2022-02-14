import { connect, disconnect, userRepo } from "$lib/redis";
import bcrypt from "bcrypt";

export const post = async ({ request, locals }) => {
  const body = await request.formData();
  const acceptsJson = request.headers.get("accept") == "application/json";
  if (!locals.session) return { status: 403, body: { error: "Not signed in" } };

  await connect();
  const user = await userRepo.fetch(locals.session.uid);
  user.email = body.get("email");
  if (body.get("password")?.length > 0) user.password = await bcrypt.hash(body.get("password"), 12);
  await userRepo.save(user);

  return acceptsJson ? { body: { success: true } } : { status: 302, headers: { Location: "/settings" } };
};
