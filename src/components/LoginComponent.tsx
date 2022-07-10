import { Button, Flex, Icon, Link } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { default as NextLink } from "next/link";
import { FaRegUserCircle } from "react-icons/fa";

export default function LoginComponent(props: { onClose?: () => void }) {
  const { data: session } = useSession();

  if (session) {
    //console.log(session.user);

    return (
      <Flex direction="row" align="center" gap={2}>
        <Icon as={FaRegUserCircle} />
        <NextLink href="/profile" passHref>
          <Link onClick={props.onClose} fontSize="sm" fontWeight="bold">
            {session.user?.name || session.user?.email || session.user?.id}
          </Link>
        </NextLink>
      </Flex>
    );
  }
  return (
    <Button onClick={() => signIn()} w={3 / 5}>
      Sign in
    </Button>
  );
}
