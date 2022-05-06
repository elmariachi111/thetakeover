import { Button, Flex, Text } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";

export default function LoginComponent() {
  const { data: session } = useSession();

  if (session) {
    //console.log(session.user);

    return (
      <Flex direction="column" align="center" p={2}>
        <Text fontSize="xs">You're logged in as</Text>
        <Text fontSize="sm" fontWeight="bold" isTruncated>
          {session.user?.email || session.user?.name || session.user?.id}
        </Text>
      </Flex>
    );
  }
  return (
    <Flex>
      <Button onClick={() => signIn()}>Sign in</Button>
    </Flex>
  );
}
