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

export const formatTime = (utcTime: string) => {
  const d = new Date(utcTime);
  return d.toLocaleString();
};

export const replaceAll = (s: string, f: string, r: string) => {
  return s
    .split(",")
    .map((p) => p.replace(f, r))
    .join(",");
};

export const isHexNumber = (num: string) => {
  return num.match(/^0x([A-Fa-f\d])+$/);
};
