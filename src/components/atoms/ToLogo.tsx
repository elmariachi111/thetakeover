import React from "react";
import Image from "next/image";
import logo from "../../img/to_logo.svg";
import logo_black from "../../img/to_logo_black.svg";
import { default as NextLink } from "next/link";
import { Link, useColorMode } from "@chakra-ui/react";

export const ToLogo = (props: { width?: number }) => {
  const width = props.width || 60;
  const { colorMode } = useColorMode();
  return (
    <NextLink href="/" passHref>
      <Link href="/" >
        <Image src={colorMode === "dark" ? logo : logo_black} alt="logo" height={width} width={width}></Image>
      </Link>
    </NextLink>
  );
};
