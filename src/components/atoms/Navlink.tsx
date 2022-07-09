import { Link } from "@chakra-ui/react";
import { default as NextLink } from "next/link";
import React from "react";

const Navlink = (props: {
  href: string;
  children: string | React.ReactNode;
  onClose?: () => void;
}) => {
  const { onClose, href, children } = props;
  return (
    <NextLink href={href} passHref>
      <Link
        onClick={onClose}
        _hover={{ background: "gray.600", color: "white" }}
        d="flex"
        w="full"
        fontWeight="bold"
        p={3}
      >
        {children}
      </Link>
    </NextLink>
  );
};

export { Navlink };
