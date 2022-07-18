import { Logtail } from "@logtail/node";

const logtail = process.env.LOGTAIL_SOURCE_TOKEN
  ? new Logtail(process.env.LOGTAIL_SOURCE_TOKEN)
  : console;

export default logtail;
