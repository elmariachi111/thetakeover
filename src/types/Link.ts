import { Link, Metadata, User } from "@prisma/client";

export type XLink = Link & { metadata: Metadata; creator: User };

export type DisplayableLink = XLink & {
  price: number;
};
