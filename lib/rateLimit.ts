import { prisma } from "@/lib/prisma";

export async function isRateLimited(ip: string, limit: number = 5, windowMs: number = 60000): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMs);

  const requestCount = await prisma.otpToken.count({
    where: {
      ipAddress: ip,
      createdAt: { gte: cutoff }
    }
  });

  return requestCount >= limit;
}