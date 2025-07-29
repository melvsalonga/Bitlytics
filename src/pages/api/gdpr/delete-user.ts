import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/client';

// Delete user data for GDPR compliance
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = session.user.id;

    // Delete all user data
    await prisma.session.deleteMany({ where: { userId }});
    await prisma.account.deleteMany({ where: { userId }});
    await prisma.shortUrl.deleteMany({ where: { createdBy: userId }});
    await prisma.user.delete({ where: { id: userId }});

    return res.status(200).json({ message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
