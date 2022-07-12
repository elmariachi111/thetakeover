import { Box, Button, Circle, Flex, forwardRef } from "@chakra-ui/react";
import Blockies from "react-blockies";

const Identicon = forwardRef((props, ref) => {
  const { account, ...rest } = props;
  return (
    <Flex ref={ref} p={0} {...rest}>
      <Circle size={8} overflow="hidden">
        <Blockies seed={account.toLowerCase()} size={8} scale={4} />
      </Circle>
    </Flex>
  );
});

export { Identicon };
