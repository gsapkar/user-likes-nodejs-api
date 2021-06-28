import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// exporting singleton prisma client
export default prisma;
