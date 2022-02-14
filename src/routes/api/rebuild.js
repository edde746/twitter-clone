import { connect, disconnect, userRepo, postRepo } from "$lib/redis";

// Temporary solution, gotta be a better way to do this
export const get = async () => {
  await connect();

  const rebuildIndex = (repo) =>
    repo
      .dropIndex()
      .then(() => repo.createIndex())
      .catch(() => repo.createIndex());

  await rebuildIndex(userRepo);
  await rebuildIndex(postRepo);

  return { body: "Rebuilt index" };
};
