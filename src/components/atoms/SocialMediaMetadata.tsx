import Head from "next/head";
import canonicalUrl from "../../modules/api/canonicalUrl";
import { XLink } from "../../types/Link";
import truncatise from "truncatise";

const SocialMediaMetadata = ({ link }: { link: XLink }) => {
  const shortDescription = truncatise(link.metadata.description, {
    TruncateBy: "words",
    TruncateLength: 50,
    StripHTML: true,
    Strict: false,
    Suffix: "...",
  });
  const title = `${link.metadata.title} by ${link.creator.name}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={shortDescription} />
      <meta property="og:url" content={`${canonicalUrl}/to/${link.hash}`} />
      <meta property="og:title" content={title} key="title" />
      <meta property="og:description" content={shortDescription} />
      <meta property="og:image" content={link.metadata.previewImage} />
      <meta property="og:type" content="product" />

      <meta property="product:retailer_item_id" content={link.hash} />
      <meta property="product:price:amount" content={"" + link.price} />
      <meta property="product:price:currency" content="EUR" />

      <meta property="twitter:site" content="@thetakeoverdao" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:domain" content="The Takeover" />
      <meta property="twitter:description" content={shortDescription} />
      <meta
        property="twitter:creator"
        content={
          link.creator.twitterHandle || link.creator.name || link.creatorId
        }
      />
      <meta property="twitter:image" content={link.metadata.previewImage} />
    </Head>
  );
};

export { SocialMediaMetadata };
