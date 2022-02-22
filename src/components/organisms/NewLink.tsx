import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import React, { useEffect, useReducer } from "react";
import { LinkPayload } from "../../types/LinkPayload";

type StateAction = {
  type: string;
  payload: any;
};

function reducer(state: LinkPayload, action: StateAction): LinkPayload {
  const { payload } = action;
  switch (action.type) {
    case "setUrl":
      return { ...state, url: payload.url };
    case "setPrice":
      return { ...state, price: payload.price };
    default:
      throw new Error("unk action");
  }
}

const NewLink = (props: {
  onChange: (p: LinkPayload | undefined) => unknown;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    url: "",
    price: undefined,
  });

  useEffect(() => {
    if (state.price && state.url) {
      props.onChange(state);
    } else {
      props.onChange(undefined);
    }
  }, [state, props]);

  return (
    <Flex direction="column" gridGap={6}>
      <FormControl>
        <FormLabel>a URI to protect</FormLabel>
        <Input
          type="url"
          placeholder="https://"
          value={state.url}
          onChange={(e) => {
            e.preventDefault();
            dispatch({ type: "setUrl", payload: { url: e.target.value } });
          }}
        />
      </FormControl>

      <FormControl>
        <Flex direction="row" align="center">
          <FormLabel>Price</FormLabel>
          <Input
            type="number"
            placeholder="1.99"
            value={state.price}
            onChange={(e) => {
              e.preventDefault();
              dispatch({
                type: "setPrice",
                payload: { price: e.target.valueAsNumber },
              });
            }}
          />
        </Flex>
      </FormControl>
    </Flex>
  );
};

export default NewLink;
