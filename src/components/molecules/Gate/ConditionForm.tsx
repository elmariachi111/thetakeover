import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Portal,
  Select,
  Spacer,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Field, Form, Formik, useField, useFormikContext } from "formik";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { extractNFTFromMarketPlace } from "../../../modules/gate/extractNFTFromMarketplace";
import {
  getContractMetadata,
  getContractType,
} from "../../../modules/gate/extractNFTMetadata";

import { getInfuraProvider } from "../../../modules/infura";
import { isHexNumber } from "../../../modules/strings";
import { ChainCondition, ChainName } from "../../../types/ChainConditions";

const ContractTypeField = () => {
  const [field, meta] = useField("standardContractType");
  return (
    <Flex direction="column">
      <FormLabel>contract type</FormLabel>
      <Select variant="filled" {...field}>
        <option value="ERC721">ERC721</option>
        <option value="ERC1155">ERC1155</option>
        {/* <option value="POAP">POAP</option> */}
      </Select>
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </Flex>
  );
};

const ParametersField = () => {
  const { values, setFieldValue, errors } = useFormikContext<ChainCondition>();

  useEffect(() => {
    if (values.standardContractType === "ERC721") {
      setFieldValue("parameters", [":userAddress"]);
      setFieldValue("method", "balanceOf");
    } else if (values.standardContractType === "ERC1155") {
      setFieldValue("method", "balanceOfBatch");
    }
  }, [values.standardContractType, setFieldValue]);
  return (
    <FormControl
      flexDirection="column"
      display={values.standardContractType === "ERC1155" ? "flex" : "none"}
    >
      <FormLabel>
        {values.parameters.length == 2
          ? values.parameters[1].split(",").length
          : "0"}{" "}
        token ids
      </FormLabel>
      <Input
        name="parameters"
        type="text"
        variant="filled"
        value={values.parameters[1]}
        onChange={(e: any) => {
          if (e.target.value.length == 0) {
            setFieldValue("parameters", []);
          } else {
            setFieldValue("parameters", [
              [...Array(e.target.value.split(",").length)]
                .map((a) => ":userAddress")
                .join(","),
              e.target.value,
            ]);
          }
        }}
      />
      <FormHelperText>comma separated (1,2,3)</FormHelperText>
      <FormErrorMessage>{errors.parameters}</FormErrorMessage>
    </FormControl>
  );
};

const MarketplaceLinkExtractor = () => {
  const { values, setFieldValue, setFieldError, errors } =
    useFormikContext<ChainCondition>();

  const toast = useToast();

  const updateByMarketplaceLink = useCallback(
    async (
      url: string,
      values: ChainCondition,
      setFieldValue: (
        field: string,
        value: any,
        shouldValidate?: boolean
      ) => void
    ) => {
      try {
        const collectionDetails = extractNFTFromMarketPlace(url);

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
          }
          if (type === "ERC721") {
            setFieldValue("parameters", [":userAddress"]);
          } else if (type === "ERC1155" && collectionDetails.tokenId) {
            let newVal: Array<string>;
            if (values.parameters.length === 2) {
              const tokenIds = values.parameters[1].split(",");
              tokenIds.push(collectionDetails.tokenId);
              newVal = [
                [...Array(tokenIds.length)]
                  .map((a) => ":userAddress")
                  .join(","),
                tokenIds.join(","),
              ];
            } else {
              newVal = [":userAddress", collectionDetails.tokenId];
            }

            setFieldValue("parameters", newVal);
          }
        }
      } catch (e: any) {
        console.error(e);
        toast({
          title: "couldn't extract NFT information from your link",
          description: e.message || e,
        });
      } finally {
      }
    },
    [toast]
  );

  return (
    <FormControl>
      <FormLabel>paste a marketplace link here</FormLabel>
      <Input
        p={5}
        size="sm"
        type="text"
        variant="filled"
        onChange={(e: any) => {
          updateByMarketplaceLink(e.target.value, values, setFieldValue);
          setTimeout(() => {
            e.target.value = "";
          }, 800);
        }}
      />
      <FormHelperText>to extract NFT details automatically</FormHelperText>
    </FormControl>
  );
};

const ContractAddressField = () => {
  const { values, errors } = useFormikContext<ChainCondition>();
  const [field, meta, helpers] = useField({
    name: "contractAddress",
    validate: async (val) => {
      if (!isHexNumber(val) || val.length !== 42) {
        return "not a valid address";
      }
    },
  });

  const [contractName, setContractName] = useState<string>();
  useEffect(() => {
    if (!!errors.contractAddress || !!errors.chain) return;
    if (
      !isHexNumber(values.contractAddress) ||
      values.contractAddress.length !== 42
    )
      return;
    const provider = getInfuraProvider(values.chain);
    if (!provider) return;

    console.log("checkong", values.contractAddress, values.chain);
    (async () => {
      try {
        const name = await getContractMetadata(
          provider,
          values.contractAddress
        );
        setContractName(name);
      } catch (e: any) {
        console.error(e);
        helpers.setError(
          "couldn't extract contract name. Check chain, address and type."
        );
        setContractName(undefined);
      }
    })();
  }, [values.chain, values.contractAddress, errors]);

  return (
    <FormControl isInvalid={!!meta.error}>
      <Flex>
        <FormLabel>contract address</FormLabel>
        <Spacer />
        <Text fontSize="xs">{contractName}</Text>
      </Flex>
      <Input placeholder="0x1a2b3c4d..." {...field} />
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
};

const SubmitButton = (props) => {
  const { values, errors, isValid, dirty } = useFormikContext<ChainCondition>();
  const submittable = useMemo(() => {
    if (!isValid) return false;
    if (values.standardContractType === "ERC1155") {
      if (values.parameters.length != 2) return false;
      if (values.parameters[1].length === 0) return false;
    }
    return true;
  }, [values, isValid]);
  return (
    <Button
      type="submit"
      form="condition-form"
      disabled={!isValid || !submittable}
    >
      submit
    </Button>
  );
};
const ConditionForm = (props: {
  buttonRef: MutableRefObject<HTMLElement | null>;
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
      isInitialValid={false}
      initialValues={initialValues}
      onSubmit={async (values, { resetForm }) => {
        props.onUnifiedAccessControlConditionsSelected([values]);
      }}
    >
      {(formikProps) => {
        const { errors, values } = formikProps;

        return (
          <Form id="condition-form">
            <Flex direction="column" w="100%" gap={6}>
              <MarketplaceLinkExtractor />

              <Flex direction="column">
                <FormLabel>chain</FormLabel>
                <Field name="chain" type="text" as={Select} variant="filled">
                  {props.chainsAllowed.map((ch) => (
                    <option value={ch} key={`optch-${ch}`}>
                      {ch}
                    </option>
                  ))}
                </Field>
                <FormErrorMessage>{errors.chain}</FormErrorMessage>
              </Flex>

              <ContractTypeField />

              <ParametersField />

              <ContractAddressField />
            </Flex>
            <Portal containerRef={props.buttonRef}>
              <SubmitButton />
            </Portal>
          </Form>
        );
      }}
    </Formik>
  );
};

export { ConditionForm };
