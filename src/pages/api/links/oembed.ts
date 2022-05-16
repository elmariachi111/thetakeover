import type { NextApiRequest, NextApiResponse } from "next";
import { extract, OembedData } from "oembed-parser";
import { parse } from "node-html-parser";
import axios from "axios";

const scraperOptions = {
  headers: {
    "user-agent":
      "Mozilla/5.0 (X11; Linux i686; rv:100.0) Gecko/20100101 Firefox/100.0",
  },
};

const extractOembedUrlFromWebsite = async (url: string) => {
  const res = await axios.get(url, scraperOptions);
  const html = parse(res.data);
  const $el = html.querySelector('link[type="application/json+oembed"]');
  if (!$el) return null;
  return $el.getAttribute("href") || null;
};

const fetchOembedData = async (oembedUri: string): Promise<OembedData> => {
  const oembedRes = await axios.get(oembedUri, scraperOptions);
  return oembedRes.data;
};

export const extractOembedFromUrl = async (
  url: string
): Promise<OembedData> => {
  const href = await extractOembedUrlFromWebsite(url);
  if (href === null) {
    //fallback to oembed library...
    const oembed = await extract(url);
    if (!oembed) throw Error("url doesnt contain oembed data");
    return oembed;
  }
  return fetchOembedData(href);
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uri }: { uri: string } = req.body;
  try {
    const oembed = await extractOembedFromUrl(uri);
    res.status(200).send(oembed);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({
      err: e.message,
    });
  }
};

export default handler;
