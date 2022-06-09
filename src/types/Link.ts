import { File, FileBundle, Link, Metadata, User } from "@prisma/client";
import { RichTypeData, VideoTypeData } from "oembed-parser";
import { UploadedFile } from "./TakeoverInput";

type XMetadata = Metadata & {
  oembed: VideoTypeData | RichTypeData | null;
};

type XFileBundle = FileBundle & {
  password: {
    type: "Buffer";
    data: number[];
  };
};

export type XLink = Link & {
  metadata: XMetadata;
  creator: User;
  bundles?: any[];
  files?: XFileBundle & {
    files: UploadedFile[];
  };
};

export type DisplayableLink = XLink & {
  price: number;
};
