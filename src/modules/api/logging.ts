import { Logtail } from "@logtail/node";

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN as string);
export default logtail;
