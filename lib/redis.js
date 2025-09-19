import Redis from 'ioredis'

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxLoadingTimeout: 1000,
  lazyConnect: true
})

// 添加连接事件监听
redis.on('connect', () => {
  console.log('Redis connected')
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message)
})

redis.on('close', () => {
  console.log('Redis connection closed')
})

const initialData = {
  "1702459181837": '{"title":"sunt aut","content":"quia et suscipit suscipit recusandae","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459182837": '{"title":"qui est","content":"est rerum tempore vitae sequi sint","updateTime":"2023-12-13T09:19:48.837Z"}',
  "1702459188837": '{"title":"ea molestias","content":"et iusto sed quo iure","updateTime":"2023-12-13T09:19:48.837Z"}'
}

// 检查 Redis 连接
export async function checkRedisConnection() {
  try {
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis connection failed:', error.message)
    return false
  }
}

export async function getAllNotes() {
  try {
    const data = await redis.hgetall("notes");
    if (Object.keys(data).length == 0) {
      await redis.hset("notes", initialData);
    }
    return await redis.hgetall("notes")
  } catch (error) {
    console.error('Error getting all notes:', error.message)
    throw new Error('Failed to connect to Redis. Please ensure Redis server is running.')
  }
}

export async function addNote(data) {
  const uuid = Date.now().toString();
  await redis.hset("notes", [uuid], data);
  return uuid
}

export async function updateNote(uuid, data) {
  await redis.hset("notes", [uuid], data);
}

export async function getNote(uuid) {
  return JSON.parse(await redis.hget("notes", uuid));
}

export async function delNote(uuid) {
  return redis.hdel("notes", uuid)
}

export default redis
