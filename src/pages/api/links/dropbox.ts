import { NextApiRequest, NextApiResponse } from "next";
import { Dropbox, Error, sharing } from "dropbox"; // eslint-disable-line no-unused-vars

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { uri }: { uri: string } = req.body;
  const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
  console.log(uri);
  try {
    url: uri;

    //sharingGetSharedLinkMetadata
    const sharedLinkMetadata = await dbx.sharingGetSharedLinkMetadata({
      url: uri,
    });

    const folderId = sharedLinkMetadata.result.id;
    console.log(sharedLinkMetadata);
    const mountRes = await dbx.sharingMountFolder({
      shared_folder_id: folderId!,
    });

    console.log("mounted:", JSON.stringify(mountRes, null, 2));
    // const items = await dbx.filesListFolder({
    //   path: "/4dl2dz5gnviwqls/AAAgnigO3acUazEmO-i1w0OJa",
    // });

    res.status(200).json(mountRes);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({
      err: e.message,
    });
  }
};

export default handler;
