import { extractNFTFromMarketPlace } from "./extractNFTFromMarketplace";

//https://nft.coinbase.com/collection/ethereum/0x103c167386dbc3d73c208e3e89ef0c79e7a44f60
//https://nft.coinbase.com/nft/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/4249

//https://testnets.opensea.io/collection/doodles-testnet
//https://opensea.io/assets/0x8c5029957bf42c61d19a29075dc4e00b626e5022/4949
//https://opensea.io/assets/matic/0x2953399124f0cbb46d2cbacd8a89cf0599974963/98741587097989921687893828781193964939994014648499800863986050163665176363009
//https://opensea.io/assets/ethereum/0x2acab3dea77832c09420663b0e1cb386031ba17b/9571
//https://testnets.opensea.io/assets/rinkeby/0xd56c266c640f406db3b02c7054d2848252bee664/15

//https://rinkeby.looksrare.org/collections/0xd56c266c640F406db3B02C7054d2848252beE664
//https://rinkeby.looksrare.org/collections/0xd56c266c640F406db3B02C7054d2848252beE664/2
//https://looksrare.org/collections/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D
//https://looksrare.org/collections/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D/9646

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

  it("can handle looksrare asset links", () => {
    const props = extractNFTFromMarketPlace(
      "https://looksrare.org/collections/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D/6298"
    );
    expect(props.chain).toBe("ethereum");
    expect(props.collection).toBe("0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D");
    expect(props.tokenId).toBe("6298");
  });

  it("can handle looksrare collection links", () => {
    const props = extractNFTFromMarketPlace(
      "https://rinkeby.looksrare.org/collections/0xd56c266c640F406db3B02C7054d2848252beE664"
    );
    expect(props.chain).toBe("rinkeby");
    expect(props.collection).toBe("0xd56c266c640F406db3B02C7054d2848252beE664");
    expect(props.tokenId).toBeUndefined;
  });

  it("can handle looksrare testnet links", () => {
    const props = extractNFTFromMarketPlace(
      "https://rinkeby.looksrare.org/collections/0xd56c266c640F406db3B02C7054d2848252beE664/2"
    );
    expect(props.chain).toBe("rinkeby");
    expect(props.collection).toBe("0xd56c266c640F406db3B02C7054d2848252beE664");
    expect(props.tokenId).toBe("2");
  });

  it("can handle Coinbase collection links", () => {
    const props = extractNFTFromMarketPlace(
      "https://nft.coinbase.com/collection/ethereum/0x103c167386dbc3d73c208e3e89ef0c79e7a44f60"
    );
    expect(props.chain).toBe("ethereum");
    expect(props.collection).toBe("0x103c167386dbc3d73c208e3e89ef0c79e7a44f60");
    expect(props.tokenId).toBeUndefined;
  });

  it("can handle Coinbase nft links", () => {
    const props = extractNFTFromMarketPlace(
      "https://nft.coinbase.com/nft/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/4249"
    );
    expect(props.chain).toBe("ethereum");
    expect(props.collection).toBe("0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d");
    expect(props.tokenId).toBe("4249");
  });

  it("throws when the link doesn't seem right", () => {
    expect(() =>
      extractNFTFromMarketPlace(
        "https://opensea.io/assets/8c5029957bf42c61d19a29075dc4e00b626e5022/1234"
      )
    ).toThrow("no extractable information");

    expect(() =>
      extractNFTFromMarketPlace(
        "https://scamSite.xyz/some-collection/0x1234?auweia"
      )
    ).toThrow("collection not an address");

    // expect(() =>
    //   extractNFTFromMarketPlace(
    //     "https://opensea.io/assets/0x8c5029957bf42c61d19a29075dc4e00b626e5022"
    //   )
    // ).toThrow("foobar");

    expect(() =>
      extractNFTFromMarketPlace("https://opensea.io/collection/we-are-kloud")
    ).toThrow("no extractable information");
  });
});
