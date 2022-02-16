import { Button, Flex, Spacer } from "@chakra-ui/react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginComponent() {
  const { data: session } = useSession();
  console.log(session);
  if (session) {
    return (
      <Flex direction="column" align="center" >
        <Flex p={6}>{session?.user?.email}</Flex>
        <Button onClick={() => signOut()}>Sign out</Button>
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
