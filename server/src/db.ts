import { PrismaClient } from "@prisma/client";

// One shared database client for the whole API.
export const prisma = new PrismaClient();
