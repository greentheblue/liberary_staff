import { PrismaClient as entityPrismaClient } from "../../prisma/generated/Entity";

const entityPrismaClientSingleton = () => {
  return new entityPrismaClient();
};



// Declare global types to avoid multiple instances during development
/* eslint-disable no-var */
declare global {
  var entityPrisma: undefined | ReturnType<typeof entityPrismaClientSingleton>;
}
/* eslint-enable no-var */

export const entityPrisma =
  globalThis.entityPrisma ?? entityPrismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.entityPrisma = entityPrisma;
}