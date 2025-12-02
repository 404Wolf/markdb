import { envsafe, str, url } from "envsafe";

export const env = envsafe({
  MONGODB_USERNAME: str({
    devDefault: "admin",
  }),
  MONGODB_PASSWORD: str({
    devDefault: "password",
  }),
  APP_NAME: str({
    devDefault: "markdb",
  }),
  REDIS_URL: url({
    devDefault: "redis://localhost:6379",
  }),
  MONGO_ROOT_URL: url({
    devDefault: "mongodb://localhost:27017",
  }),
  ADMIN_PASSWORD: str({
    devDefault: "admin123",
  }),
});

export const DATABASE_URL = `${env.MONGO_ROOT_URL.replace('mongodb://', `mongodb://${env.MONGODB_USERNAME}:${env.MONGODB_PASSWORD}@`)}/?appName=${env.APP_NAME}`;
