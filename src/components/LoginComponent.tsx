import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginComponent() {
  const { data: session } = useSession();
  console.log(session);
  if (session) {
    return (
      <Flex direction="row" align="center" p={3} gridGap={3}>
        <Text fontSize="sm" isTruncated>
          {session?.user?.email}
        </Text>
        <Button size="sm" p={2} onClick={() => signOut()}>
          Sign out
        </Button>
        <Spacer />
      </Flex>
    );
  }
  return (
    <>
      <Button onClick={() => signIn()}>Sign in</Button>
    </>
  );
}
