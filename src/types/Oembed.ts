import { OembedData } from "oembed-parser";

export interface XOembedData extends OembedData {
  description?: string;
  html?: string;
}
