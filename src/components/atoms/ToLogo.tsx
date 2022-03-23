import React from "react";
import Image from "next/image";
import logo from "../../img/to_logo.svg";
import { default as NextLink } from "next/link";
import { Link } from "@chakra-ui/react";

export const ToLogo = () => (
  <NextLink href="/" passHref>
    <Link href="/">
      <Image src={logo} alt="logo" height={60} width={60}></Image>
    </Link>
  </NextLink>
);
