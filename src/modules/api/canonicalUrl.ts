export default process.env.CANONICAL_URL
  ? (process.env.CANONICAL_URL as string)
  : `https://${process.env.VERCEL_URL}`;
