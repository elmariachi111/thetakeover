import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { adapterClient } from "../../../modules/api/adapter";

import paypal from "../../../modules/api/paypal";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  if (!session?.user) {
    return res.status(401).send("Unauthorized");
  }
  const paymentId = req.query.paymentId;
  if (!paymentId || !(typeof paymentId === "string")) {
    return res.status(404).json({
      status: "error",
      message: `unknown payment ${paymentId}`,
    });
  }

  const payment = await adapterClient.payment.findUnique({
    where: {
      id: paymentId,
    },
    select: {
      paymentRef: true,
      link: {
        select: {
          creatorId: true,
        },
      },
    },
  });

  if (!payment) {
    return res.status(404).json({
      status: "error",
      message: `Couldnt find payment ${paymentId}`,
    });
  }
  if (payment.link.creatorId != session.user.id) {
    return res.status(401).json({
      status: "error",
      message: `You're not allowed to access payment ${paymentId}`,
    });
  }

  const order = await paypal.getOrderInfo(payment.paymentRef);

  if (!order) {
    return res.status(404).json({
      status: "error",
      message: `order ${req.query.orderId} not found`,
    });
  }
  return res.status(200).json(order);
};

export default handler;
