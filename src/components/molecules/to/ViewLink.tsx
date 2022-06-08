import { XLink } from "../../../types/Link";
import { ViewExternal } from "./ViewExternal";
import { ViewEmbed } from "./ViewEmbed";
import { ViewFiles } from "./ViewFiles";

export const ViewLink = ({
  link,
  showChrome,
}: {
  link: XLink;
  showChrome: boolean;
}) => {
  if (link.metadata.oembed?.html) {
    return <ViewEmbed link={link} showChrome={showChrome} />;
  } else if (link.files) {
    return <ViewFiles link={link} />;
  } else {
    return <ViewExternal link={link} />;
  }
};
