import React from "react";
import Image from "next/image";
import logo from "../../img/to_logo.svg";
import { default as NextLink } from "next/link";
import { Link } from "@chakra-ui/react";

export const ToLogo = (props: { width?: number }) => {
  const width = props.width || 60;
  return (
    <NextLink href="/" passHref>
      <Link href="/" sx={{ _hover: { transform: "scale(0.9)" } }}>
        <Image src={logo} alt="logo" height={width} width={width}></Image>
      </Link>
    </NextLink>
  );
};
