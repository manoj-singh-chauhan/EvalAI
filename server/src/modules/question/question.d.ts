import "@clerk/clerk-sdk-node";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        sessionId: string;
        orgId?: string | null;
      };
    }
  }
}
