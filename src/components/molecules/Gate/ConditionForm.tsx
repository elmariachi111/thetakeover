import {
  Button,
  Flex,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import React from "react";
import {
  ChainCondition,
  ChainName,
  ConditionType,
} from "../../../types/ChainConditions";

const ConditionForm = (props: {
  initialConditions: ChainCondition | undefined;
  chainsAllowed: ChainName[];
  onUnifiedAccessControlConditionsSelected: (
    condition: ChainCondition[]
  ) => void;
}) => {
  const initialValues: ChainCondition = props.initialConditions || {
    conditionType: "evmBasic",
    contractAddress: "",
    standardContractType: "ERC721",
    chain: "ethereum",
    method: "balanceOf",
    parameters: [":userAddress"],
    returnValueTest: {
      comparator: ">",
      value: "0",
    },
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values, { resetForm }) => {
        props.onUnifiedAccessControlConditionsSelected([values]);
      }}
    >
      {(formikProps) => {
        const { errors, values, setFieldValue } = formikProps;

        return (
          <Form id="condition-form">
            <Flex direction="column" w="100%" gap={6}>
              <Flex direction="column">
                <FormLabel>chain</FormLabel>
                <Field name="chain" type="text" as={Select} variant="filled">
                  {props.chainsAllowed.map((ch) => (
                    <option value={ch} key={`optch-${ch}`}>
                      {ch}
                    </option>
                  ))}
                </Field>
                <FormErrorMessage>{errors.contractAddress}</FormErrorMessage>
              </Flex>
              <Flex direction="column">
                <FormLabel>contractType</FormLabel>
                <Field
                  name="standardContractType"
                  type="select"
                  as={Select}
                  variant="filled"
                >
                  <option value="ERC721">ERC721</option>
                  {/* <option value="ERC1155">ERC1155</option>
                  <option value="POAP">POAP</option> */}
                </Field>
                <FormErrorMessage>
                  {errors.standardContractType}
                </FormErrorMessage>
              </Flex>
              <Flex direction="column">
                <FormLabel>contractAddress</FormLabel>
                <Field name="contractAddress" type="text" as={Input} />
                <FormErrorMessage>{errors.contractAddress}</FormErrorMessage>
              </Flex>
              <Button type="submit">submit</Button>
            </Flex>
          </Form>
        );
      }}
    </Formik>
  );
};

export { ConditionForm };
