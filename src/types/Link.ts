import { Link, Metadata, User } from "@prisma/client";
import { RichTypeData, VideoTypeData } from "oembed-parser";

type XMetadata = Metadata & {
  oembed: VideoTypeData | RichTypeData | null;
};

export type XLink = Link & { metadata: XMetadata; creator: User };

export type DisplayableLink = XLink & {
  price: number;
};
