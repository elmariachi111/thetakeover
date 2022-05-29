import { CurrencyAmount } from "../types/Payment";

export type PaypalNameObject = {
  prefix?: string;
  given_name?: string;
  middle_name?: string;
  surname?: string;
  suffix?: string;
  full_name?: string;
};

export const paypalNameObjectToString = (nameObject: PaypalNameObject) => {
  return (
    nameObject.full_name ||
    ["prefix", "given_name", "middle_name", "surname", "suffix"]
      .map((k) => nameObject[k])
      .filter((c) => !!c)
      .join(" ")
  );
};

export const paypalAmountObjectToString = (amtObject: CurrencyAmount) => {
  return `${amtObject.value} ${amtObject.currency_code}`;
};
