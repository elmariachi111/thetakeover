import {
  Button,
  Flex,
  Icon,
  useColorModeValue,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { checkChainConditions } from "../../../modules/gate/checkChainConditions";
import { XLink } from "../../../types/Link";
import { SpeakCondition } from "../../molecules/Gate/SpeakCondition";
import { default as NextLink } from "next/link";
import { FaCheckCircle } from "react-icons/fa";
import { RiEmotionSadLine } from "react-icons/ri";
import { SiweButton } from "../../atoms/SiweButton";

export const ConditionAllowanceDialog = (props: { link: XLink }) => {
  const { link } = props;

  const { status: sessionStatus, data: sessionData } = useSession();
  const panelBg = useColorModeValue("gray.200", "gray.800");
  const [matchesConditions, setMatchesConditions] = useState<
    undefined | boolean
  >();

  useEffect(() => {
    if (!sessionData?.user) return;
    if (!sessionData.user.eth) return;
    if (!link.chainConditions) return;

    (async () => {
      try {
        const matches = await checkChainConditions(link.chainConditions, {
          user: sessionData.user!,
        });
        setMatchesConditions(matches);
      } catch (e: any) {
        console.error("checking conditions failed", e);
        setMatchesConditions(false);
      }
    })();
  }, [sessionData, link.chainConditions]);

  return (
    <Flex
      my={6}
      align="center"
      bg={panelBg}
      p={4}
      gap={4}
      direction={["column", "row"]}
    >
      <SpeakCondition conditions={link.chainConditions} />
      {sessionData?.user?.eth ? (
        matchesConditions ? (
          <NextLink href={`/to/${link.hash}`} passHref>
            <Button as={ChakraLink} leftIcon={<FaCheckCircle />}>
              proceed
            </Button>
          </NextLink>
        ) : matchesConditions === false ? (
          <Icon
            mx={4}
            as={RiEmotionSadLine}
            width="12"
            height="12"
            title="you're not matching the requirements"
          />
        ) : (
          ""
        )
      ) : (
        <SiweButton>connect</SiweButton>
      )}
    </Flex>
  );
};
