import { paypalNameObjectToString } from "./strings";

describe("Home", () => {
  it("can handle simple names", () => {
    const name = paypalNameObjectToString({
      surname: "Norris",
      given_name: "Chuck",
    });
    expect(name).toBe("Chuck Norris");
  });

  it("can handle complex names", () => {
    const name = paypalNameObjectToString({
      prefix: "Dr.",
      surname: "Norris",
      given_name: "Chuck",
      middle_name: "T.",
      suffix: "Jr",
    });
    expect(name).toBe("Dr. Chuck T. Norris Jr");
  });

  it("can falls back to given full name", () => {
    const name = paypalNameObjectToString({
      prefix: "Dr.",
      surname: "Norris",
      given_name: "Chuck",
      middle_name: "T.",
      suffix: "Jr",
      full_name: "Bud Spencer",
    });
    expect(name).toBe("Bud Spencer");
  });
});
