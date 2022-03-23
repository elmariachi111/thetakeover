import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Portal,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React, { MutableRefObject, ReactElement } from "react";
import isUrl from "validator/lib/isURL";
import { LinkInput } from "../../types/LinkInput";

const NewLink = (props: {
  onLink: (p: LinkInput) => unknown;
  buttonRef: MutableRefObject<HTMLElement | null>;
}) => {
  const initialValues: LinkInput = { url: "", price: 0 };

  const onSubmit = (values) => {
    props.onLink(values);
    return;
  };

  const buttonRef = props.buttonRef;

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
      {({ errors, isValid }) => (
        <Form id="newlink-form">
          <Flex direction="column" gridGap={6}>
            <FormControl isInvalid={!!errors.url}>
              <FormLabel>an URI to protect</FormLabel>
              <Field
                name="url"
                type="text"
                as={Input}
                placeholder="https://some.link"
                validate={(v) =>
                  !isUrl(v, { require_protocol: true })
                    ? "not an url"
                    : undefined
                }
              />
              <FormErrorMessage>{errors.url}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <Flex direction="row" align="center">
                <FormLabel flex={2}>Price (EUR)</FormLabel>
                <Field name="price" type="text" as={Input} flex={6} />
              </Flex>
            </FormControl>
          </Flex>
          <Portal containerRef={buttonRef}>
            <Button
              type="submit"
              w="100%"
              form="newlink-form"
              disabled={!isValid}
            >
              go ahead
            </Button>
          </Portal>
        </Form>
      )}
    </Formik>
  );
};

export default NewLink;
