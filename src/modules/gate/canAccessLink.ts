import { Link, Prisma } from "@prisma/client";
import { DefaultUser } from "next-auth";
import { ChainCondition } from "../../types/ChainConditions";
import { findSettledPayment } from "../api/findPayment";
import logtail from "../api/logging";
import { checkChainConditions } from "./checkChainConditions";

export const canAccessLink = async (
  user: DefaultUser & {
    id: string;
    eth?: string;
  },
  link: Omit<Link, "createdAt">
) => {
  if (user.id === link.creatorId) {
    return true;
  }

  const payment = await findSettledPayment(link.hash, user.id);
  if (payment) {
    return true;
  }

  if (
    link.chainConditions !== null &&
    typeof link.chainConditions == "object"
  ) {
    const conditions =
      link.chainConditions as Prisma.JsonArray as unknown as ChainCondition[];

    const conditionsMatched = await checkChainConditions(conditions, {
      user,
    });
    if (conditionsMatched) {
      logtail.info("nftgate", {
        user: user.id,
        creator: link.creatorId,
        link: link.hash,
        chain: conditions[0].chain,
        type: conditions[0].standardContractType,
        contract: conditions[0].contractAddress,
      });
    }
    return conditionsMatched;
  }

  return false;
};
