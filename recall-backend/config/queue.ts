import { Queue } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

// Keep queue keys under their own prefix so they're easy to find (and
// flush) when the Redis instance is shared with other services.
export const QUEUE_PREFIX = process.env.QUEUE_PREFIX ?? "recall";

export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const contentQueue = new Queue("content-processing", {
  connection: redisConnection as any,
  prefix: QUEUE_PREFIX,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

console.log("[Queue] Content processing queue initialized");
