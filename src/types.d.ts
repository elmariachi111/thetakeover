import type { DefaultUser } from "next-auth";

declare module "truncatise";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      id: string;
      eth?: string;
    };
  }
}

declare module "next-auth/jwt/types" {
  interface JWT {
    uid: string;
    eth?: string;
  }
}

declare module "*.html" {
  const value: string;
  export default value;
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: any,
        callback: (err: any, result: any) => unknown
      ) => unknown;
    };
  }
}
