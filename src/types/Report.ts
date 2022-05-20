import { UserReportReason } from "@prisma/client";

export type Report = {
  linkHash: string;
  reason: UserReportReason;
  message: string;
};
