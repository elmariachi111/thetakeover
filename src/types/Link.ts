import { Link, Metadata, User } from "@prisma/client";

export type DisplayableLink = Link & {
  metadata: Metadata;
  creator: User;
  price: number;
};
