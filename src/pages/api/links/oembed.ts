import type { NextApiRequest, NextApiResponse } from "next";
import { extract as extractOembedFromApi, OembedData } from "oembed-parser";
import { parse } from "node-html-parser";
import axios from "axios";

const scraperOptions = {
  headers: {
    "user-agent":
      "Mozilla/5.0 (X11; Linux i686; rv:100.0) Gecko/20100101 Firefox/100.0",
  },
};

const getOembedUrlFromWebsite = async (url: string) => {
  const res = await axios.get(url, scraperOptions);
  const html = parse(res.data);
  const $el = html.querySelector('link[type="application/json+oembed"]');
  if (!$el) return null;
  return $el.getAttribute("href") || null;
};

const extractOembedFromUrl = async (
  url: string
): Promise<OembedData | null> => {
  const href = await getOembedUrlFromWebsite(url);
  if (!href) return null;
  return (await axios.get(href, scraperOptions)).data;
};

export const extractOembed = async (uri: string): Promise<OembedData> => {
  let oembed;
  oembed = await extractOembedFromApi(uri);

  console.debug(
    "[OEMBED] extracting via api from %s %s",
    uri,
    oembed != null ? "succeeded" : "failed"
  );

  if (oembed == null) {
    oembed = await extractOembedFromUrl(uri);
    console.debug(
      "[OEMBED] fallback oembed from website %s %s",
      uri,
      oembed != null ? "succeeded" : "failed"
    );
  }
  return oembed;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uri }: { uri: string } = req.body;
  try {
    const oembed = await extractOembed(uri);
    res.status(200).send(oembed);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({
      err: e.message,
    });
  }
};

export default handler;
