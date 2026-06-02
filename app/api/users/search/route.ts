import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    // Search for users matching the query, excluding ourselves
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.user.id } },
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("User search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}