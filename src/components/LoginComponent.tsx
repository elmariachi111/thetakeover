import { Button, Flex, Link } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { default as NextLink } from "next/link";

export default function LoginComponent() {
  const { data: session } = useSession();

  if (session) {
    //console.log(session.user);

    return (
      <Flex direction="column" align="center" p={2}>
        <NextLink href="/profile" passHref>
          <Link fontSize="sm" fontWeight="bold" isTruncated>
            {session.user?.name || session.user?.email || session.user?.id}
          </Link>
        </NextLink>

      </Flex>
    );
  }
  return (
    <Flex>
      <Button onClick={() => signIn()}>Sign in</Button>
    </Flex>
  );
}
