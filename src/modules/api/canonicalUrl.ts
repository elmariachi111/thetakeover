export default process.env.VERCEL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.CANONICAL_URL as string);
