import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

export async function requireRole(role: 'BUYER' | 'SUPPLIER') {
  const session = await requireAuth();
  if ((session.user as any).role !== role) throw new Error('Forbidden');
  return session;
}
