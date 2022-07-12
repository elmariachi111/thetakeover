import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { Field, FormikProps } from "formik";
import { useSession } from "next-auth/react";
import { NewTakeoverInput } from "../../../types/TakeoverInput";

import {
  UploadableFiles,
  UploadedFiles,
  UploadForm,
  useUpload,
} from "../FileUploads";

import { MetadataEditor } from "./MetadataEditor";
import { LinkInputForm } from "./LinkInputForm";
import { ConditionModal } from "../../organisms/Gate/ConditionModal";

const NewLinkForm = (props: FormikProps<NewTakeoverInput>) => {
  const { errors, values, touched, initialValues, setFieldValue } = props;
  const { status } = useSession();
  const { filesToUpload, uploadProgress } = useUpload();

  const showMetadata =
    (!!values.url && !errors.url) ||
    Object.keys(uploadProgress).length > 0 ||
    (values.files && values.files.length > 0);

  const formStarted =
    !!values.url ||
    (values.files && values.files?.length > 0) ||
    filesToUpload.length > 0;

  return (
    <Flex direction="column" gap={6}>
      <Flex
        direction={["column", "row"]}
        gap={6}
        align="center"
        justify="space-between"
      >
        <LinkInputForm values={values} errors={errors} touched={touched} />
        {!formStarted && status === "authenticated" && <Text pt={6}>OR</Text>}
        {status === "authenticated" && !values.url && (
          <Flex direction="column" w="100%">
            <UploadForm />
            {filesToUpload.length > 0 && <UploadableFiles />}
            {values.files && values.files?.length > 0 && (
              <Flex my={6}>
                <UploadedFiles
                  files={values.files || []}
                  password={values.password}
                />
              </Flex>
            )}
          </Flex>
        )}
      </Flex>

      {showMetadata && (
        <>
          <MetadataEditor
            initialValues={
              values.description && values.description?.length > 10
                ? initialValues
                : undefined
            }
          />
          <Flex direction="row" justify="space-between" align="center">
            <FormLabel>on chain conditions</FormLabel>
            <ConditionModal
              initialConditions={
                values.chainConditions ? values.chainConditions[0] : undefined
              }
              onConditionsUpdated={(conditions) => {
                setFieldValue("chainConditions", conditions);
              }}
              variant="ghost"
            />
          </Flex>
        </>
      )}

      <FormControl mb={8} isInvalid={!!errors.price}>
        <Flex direction="row" align="center">
          <FormLabel flex={1}>Price (EUR)</FormLabel>
          <Flex direction="column" flex={6}>
            <Field name="price" type="text" as={Input} />
            <FormErrorMessage>{errors.price}</FormErrorMessage>
          </Flex>
        </Flex>
      </FormControl>
    </Flex>
  );
};

export { NewLinkForm };
