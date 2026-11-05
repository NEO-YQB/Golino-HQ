import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const hasDatabaseUrl = !!process.env.DATABASE_URL;

export const prisma =
  globalThis.prismaGlobal ??
  (hasDatabaseUrl
    ? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : (null as unknown as PrismaClient));

if (process.env.NODE_ENV !== 'production' && hasDatabaseUrl) {
  globalThis.prismaGlobal = prisma;
}

export function isDbConnected(): boolean {
  return hasDatabaseUrl && !!prisma;
}
