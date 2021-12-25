import { Button } from "@chakra-ui/react"
import { useSession, signIn, signOut } from "next-auth/react"

export default function LoginComponent() {
    const { data: session } = useSession()
    console.log(session);
    if (session) {
        return (
            <>
                Signed in as {session.user.email} <br />
                <Button onClick={() => signOut()}>Sign out</Button>
            </>
        )
    }
    return (
        <>
            Not signed in <br />
            <Button onClick={() => signIn()}>Sign in</Button>
        </>
    )
}