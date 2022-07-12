import { extractNFTFromMarketPlace } from "./extractNFTFromMarketplace";

describe("extract NFTs from Marketplace", () => {
  it("can extract opensea links", () => {
    const props = extractNFTFromMarketPlace(
      "https://opensea.io/assets/ethereum/0xb8da418ffc2cb675b8b3d73dca0e3f10811fbbdd/4789"
    );
    expect(props.chain).toBe("ethereum");
    expect(props.collection).toBe("0xb8da418ffc2cb675b8b3d73dca0e3f10811fbbdd");
    expect(props.tokenId).toBe("4789");
  });

  it("can handle old opensea links", () => {
    const props = extractNFTFromMarketPlace(
      "https://opensea.io/assets/0x8c5029957bf42c61d19a29075dc4e00b626e5022/4949"
    );
    expect(props.chain).toBe("ethereum");
    expect(props.collection).toBe("0x8c5029957bf42c61d19a29075dc4e00b626e5022");
    expect(props.tokenId).toBe("4949");
  });

  it("can handle polygon opensea links", () => {
    const props = extractNFTFromMarketPlace(
      "https://opensea.io/assets/matic/0x7c885c4bfd179fb59f1056fbea319d579a278075/15652988878363169319315231941861337730066"
    );
    expect(props.chain).toBe("polygon");
    expect(props.collection).toBe("0x7c885c4bfd179fb59f1056fbea319d579a278075");
    expect(props.tokenId).toBe("15652988878363169319315231941861337730066");
  });

  it("can handle looksrare links", () => {
    const props = extractNFTFromMarketPlace(
      "https://looksrare.org/collections/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D/6298"
    );
    expect(props.chain).toBe("ethereum");
    expect(props.collection).toBe("0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D");
    expect(props.tokenId).toBe("6298");
  });

  it("returns nothing when the link doesn't seem right", () => {
    expect(
      extractNFTFromMarketPlace("https://scamSite.xyz/some/link?auweia")
    ).toBeNull();

    expect(
      extractNFTFromMarketPlace(
        "https://opensea.io/assets/0x8c5029957bf42c61d19a29075dc4e00b626e5022"
      )
    ).toBeNull();

    expect(
      extractNFTFromMarketPlace(
        "https://opensea.io/assets/8c5029957bf42c61d19a29075dc4e00b626e5022/1234"
      )
    ).toBeNull();

    expect(
      extractNFTFromMarketPlace("https://opensea.io/collection/we-are-kloud")
    ).toBeNull();
  });
});
