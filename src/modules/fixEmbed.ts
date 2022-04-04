export const extractEmbedUrl = (code: string | null | undefined) => {
  const IFRAME_SRC_REGEX = new RegExp(`src\s*=\s*['"](.*?)['"]`, "gi");
  if (!code) return null;

  const matches = IFRAME_SRC_REGEX.exec(code);
  if (matches) {
    return matches[1];
  }
  return null;
};

//<iframe width="200" height="113" src="https://www.youtube.com/embed/qBh-wbPpmqA?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
