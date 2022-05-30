import { NextApiRequest, NextApiResponse } from "next";
import canonicalUrl from "../../modules/api/canonicalUrl";
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).send({ canonicalUrl });
};

export default handler;
