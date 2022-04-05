import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";

export default function LoginComponent() {
  const { data: session } = useSession();

  if (session) {
    return (
      <Flex direction="column" align="center" p={2}>
        <Text fontSize="xs">You're logged in as</Text>
        <Text fontSize="sm" fontWeight="bold" isTruncated>
          {session.user?.email}
        </Text>
      </Flex>
    );
  }
  return <Button onClick={() => signIn()}>Sign in</Button>;
}
