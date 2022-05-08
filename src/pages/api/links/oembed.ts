import type { NextApiRequest, NextApiResponse } from "next";
import { extract } from "oembed-parser";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uri }: { uri: string } = req.body;
  const oembed = await extract(uri);
  //console.log(oembed);

  res.status(200).json(oembed);
};

export default handler;
