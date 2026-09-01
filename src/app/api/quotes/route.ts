import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ quotes: [] }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);
  const since = searchParams.get('since');

  const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  if (role === 'BUYER') {
    const quotes = await prisma.quote.findMany({
      where: {
        inquiry: { buyerId: userId },
        createdAt: { gt: sinceDate },
      },
      include: { inquiry: { include: { fabric: true } }, supplier: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return NextResponse.json({ quotes });
  }
  // supplier: no realtime needed, return empty
  return NextResponse.json({ quotes: [] });
}
