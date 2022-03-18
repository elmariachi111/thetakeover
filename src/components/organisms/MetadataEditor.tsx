import {
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { Metadata } from "@prisma/client";
import React, { useEffect, useReducer } from "react";

type StateAction = {
  type: string;
  payload: any;
};

function reducer(state: Metadata, action: StateAction): Metadata {
  const { payload } = action;

  switch (action.type) {
    case "setTitle":
      return { ...state, title: payload.title };
    case "setDescription":
      return { ...state, description: payload.description };
    case "setPreviewImage":
      return { ...state, previewImage: payload.previewImage };
    default:
      throw new Error("unk action");
  }
}

const MetadataEditor = (props: {
  metadata: Metadata;
  onChange: (m: Metadata | undefined) => unknown;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    ...props.metadata,
  });

  useEffect(() => {
    if (state.title && state.description) {
      props.onChange(state);
    }
  }, [state, props]);

  return (
    <Flex direction="column" gridGap={6} w="100%">
      <FormControl>
        <FormLabel>title</FormLabel>
        <Input
          type="text"
          placeholder="https://"
          value={state.title}
          onChange={(e) => {
            e.preventDefault();
            dispatch({ type: "setTitle", payload: { title: e.target.value } });
          }}
        />
      </FormControl>

      <FormControl>
        <Flex direction="column">
          <FormLabel>description</FormLabel>
          <Textarea
            value={state.description}
            onChange={(e) => {
              e.preventDefault();
              dispatch({
                type: "setDescription",
                payload: { description: e.target.value },
              });
            }}
          />
        </Flex>
      </FormControl>

      <FormControl>
        <Flex direction="row" gap={2}>
          <Flex direction="column" flex={3}>
            <FormLabel>preview</FormLabel>
            <Input type="text" value={state.previewImage} disabled />
          </Flex>
          <Flex flex={1}>
            <Image src={state.previewImage} />
          </Flex>
        </Flex>
      </FormControl>
    </Flex>
  );
};

export default MetadataEditor;
