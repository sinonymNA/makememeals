import { createClerkClient } from '@clerk/clerk-sdk-node';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.slice(7);
    const payload = await clerk.verifyToken(token);
    req.userId = payload.sub; // Clerk user ID
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
