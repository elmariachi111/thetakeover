import {
  Button,
  Flex,
  FormErrorMessage,
  FormLabel,
  Input,
  Portal,
  Select,
  Spacer,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik } from "formik";
import { MutableRefObject, useEffect, useState } from "react";
import { extractNFTFromMarketPlace } from "../../../modules/gate/extractNFTFromMarketplace";
import {
  getContractMetadata,
  getContractType,
} from "../../../modules/gate/extractNFTMetadata";

import { getInfuraProvider } from "../../../modules/infura";
import { ChainCondition, ChainName } from "../../../types/ChainConditions";

const ConditionForm = (props: {
  buttonRef: MutableRefObject<HTMLElement | null>;
  initialConditions: ChainCondition | undefined;
  chainsAllowed: ChainName[];
  onUnifiedAccessControlConditionsSelected: (
    condition: ChainCondition[]
  ) => void;
}) => {
  const toast = useToast();
  const [contractName, setContractName] = useState<string>();

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

        const updateByMarketplaceLink = async (e: any) => {
          try {
            const collectionDetails = extractNFTFromMarketPlace(e.target.value);

            if (collectionDetails) {
              setFieldValue("chain", collectionDetails.chain);
              setFieldValue("contractAddress", collectionDetails.collection);
              const provider = getInfuraProvider(collectionDetails.chain);
              const type = await getContractType(
                provider,
                collectionDetails.collection
              );
              if (type) {
                setFieldValue("standardContractType", type);
                const name = await getContractMetadata(
                  provider,
                  collectionDetails.collection
                );
                setContractName(name);
              }
            }
          } catch (e: any) {
            console.error(e);
            toast({
              title: "couldn't extract NFT information from your link",
              description: e.message || e,
            });
          } finally {
            setTimeout(() => {
              e.target.value = "";
            }, 800);
          }
        };

        return (
          <Form id="condition-form">
            <Flex direction="column" w="100%" gap={6}>
              <Flex direction="column">
                <FormLabel>paste a marketplace link here</FormLabel>
                <Input
                  size="sm"
                  type="text"
                  variant="filled"
                  onChange={updateByMarketplaceLink}
                ></Input>
              </Flex>
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
                  <option value="ERC1155">ERC1155</option>
                  {/* <option value="POAP">POAP</option> */}
                </Field>
                <FormErrorMessage>
                  {errors.standardContractType}
                </FormErrorMessage>
              </Flex>
              <Flex direction="column">
                <Flex>
                  <FormLabel>contractAddress</FormLabel>
                  <Spacer />
                  <Text>{contractName}</Text>
                </Flex>
                <Field name="contractAddress" type="text" as={Input} />
                <FormErrorMessage>{errors.contractAddress}</FormErrorMessage>
              </Flex>
            </Flex>
            <Portal containerRef={props.buttonRef}>
              <Button type="submit" form="condition-form">
                submit
              </Button>
            </Portal>
          </Form>
        );
      }}
    </Formik>
  );
};

export { ConditionForm };
