import { Client, Entity, Schema, Repository } from "redis-om";

const client = new Client();

export const connect = async () => {
  if (client.isOpen()) return;
  await client.open(process.env["REDIS_CONNECTION"]);
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

connect().then(() => {
  // Rebuilding index
  userRepo.dropIndex().then(() => userRepo.createIndex());
  postRepo.dropIndex().then(() => postRepo.createIndex());
});
