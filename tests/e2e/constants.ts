export const baseURL = "http://localhost:3101";
export const databaseUrl =
  process.env.DATABASE_URL_E2E ||
  "mongodb://127.0.0.1:27018/blog_e2e?replicaSet=rs0&directConnection=true";
