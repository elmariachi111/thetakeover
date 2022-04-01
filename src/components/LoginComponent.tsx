import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";

export default function LoginComponent() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Flex direction="row" align="center" p={3} gridGap={3}>
        <Text fontSize="sm" isTruncated>
          {session.user?.email}
        </Text>
        <Spacer />
      </Flex>
    );
  }
  return <Button onClick={() => signIn()}>Sign in</Button>;
}
