import { adapterClient } from "./adapter";

const select = {
  hash: true,
  price: true,
  creatorId: true,
  creator: true,
  originUri: true,
  metadata: true,
  saleStatus: true,
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
};

export const findLink = async (linkid: string) => {
  return adapterClient.link.findUnique({
    where: {
      hash: linkid,
    },
    select,
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
