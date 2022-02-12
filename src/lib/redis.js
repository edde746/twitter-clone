import { Client, Entity, Schema, Repository } from "redis-om";

export const client = new Client();

export const connect = async () => {
  if (client.isOpen()) return;
  await client.open(process.env["REDIS_CONNECTION"]);
};

export const disconnect = async () => {
  try {
    if (!client.isOpen()) return;
    await client.close();
  } catch (ex) {}
};

// User schema
class User extends Entity {}
const userSchema = new Schema(User, {
  at: { type: "string" },
  email: { type: "string" },
  password: { type: "string" },
  following: { type: "array" },
});

export const userRepo = new Repository(userSchema, client);

// Post schema
class Post extends Entity {}
const postSchema = new Schema(Post, {
  author: { type: "string" },
  content: { type: "string" },
  timestamp: { type: "number" },
  likes: { type: "array" },
});

export const postRepo = new Repository(postSchema, client);

// connect().then(async () => {
//   // Rebuilding index
//   const rebuildIndex = (repo) =>
//     repo
//       .dropIndex()
//       .then(() => repo.createIndex())
//       .catch(() => repo.createIndex());
// 
//   await rebuildIndex(userRepo);
//   await rebuildIndex(postRepo);
// });
