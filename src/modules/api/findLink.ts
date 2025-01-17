import { adapterClient } from "./adapter";

const select = {
  hash: true,
  price: true,
  creatorId: true,
  creator: true,
  originUri: true,
  metadata: true,
  saleStatus: true,
  files: {
    select: {
      password: true,
      files: true,
    },
  },
  bundles: {
    select: {
      hash: true,
      metadata: {
        select: {
          title: true,
          previewImage: true,
        },
      },
    },
  },
  chainConditions: true,
};

export const findLink = async (linkid: string) => {
  return adapterClient.link.findUnique({
    where: {
      hash: linkid,
    },
    select: select,
  });
};

export const findLinks = async (linkIds: string[]) => {
  return adapterClient.link.findMany({
    where: {
      hash: { in: linkIds },
    },
    select,
  });
};
