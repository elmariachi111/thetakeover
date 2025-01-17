import { Flex, FormControl, FormLabel, Switch } from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

export function FormikChakraSwitch(props: {
  name: string;
  label: string;
  options?: { on: string; off: string };
}) {
  const { name, label, options } = props;
  const [, meta, helpers] = useField(props.name);
  const { value } = meta;
  const { setValue } = helpers;

  return (
    <FormControl mb={8}>
      <Flex direction="row" justify="space-between">
        <FormLabel htmlFor={name}>{label}</FormLabel>
        <Switch
          id={name}
          size="lg"
          isChecked={options ? value === options.on : !!value}
          colorScheme="brand"
          onChange={() =>
            setValue(
              options
                ? value === options.on
                  ? options.off
                  : options.on
                : !value
            )
          }
        />
      </Flex>
    </FormControl>
  );
}
