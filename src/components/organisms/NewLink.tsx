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
import { useSession } from "next-auth/react";
import { MutableRefObject } from "react";
import { LinkInput, NewTakeoverInput } from "../../types/TakeoverInput";
import { LinkSchema, MetadataEditor } from "../molecules/MetadataEditor";
import TakeoverUploadForm from "../molecules/TakeoverUploadForm";
import { UploadedFiles } from "../molecules/UploadedFiles";

type NewLinkSubmitOptions = {
  afterSubmission?: () => void;
  password?: Uint8Array;
};
const NewLink = (props: {
  onSubmit: (input: NewTakeoverInput, options: NewLinkSubmitOptions) => unknown;
  buttonRef: MutableRefObject<HTMLElement | null>;
  initialLink?: LinkInput;
}) => {
  const { onSubmit } = props;
  const { status } = useSession();
  const buttonRef = props.buttonRef;

  const initialValues: NewTakeoverInput = {
    url: undefined,
    files: [],
    price: 0,
    title: "",
    previewImage: "",
    description: "",
    password: undefined,
    ...props.initialLink,
  };

  return (
    <Formik
      enableReinitialize
      validateOnMount={props.initialLink !== undefined}
      initialValues={initialValues}
      validationSchema={LinkSchema}
      onSubmit={async (values, { resetForm }) => {
        onSubmit(values, {
          afterSubmission: resetForm,
        });
      }}
    >
      {({ errors, touched, values, setFieldValue }) => {
        const showMetadata =
          (!!values.url && !errors.url) ||
          (values.files && values.files.length > 0);

        const submittable =
          Object.values(errors).length == 0 &&
          ((values.url && values.url.length > 5) ||
            (values.files && values.files.length > 0));

        return (
          <Form id="newlink-form">
            <Flex direction="column" gridGap={6}>
              <FormControl
                isInvalid={!!errors.url}
                isDisabled={values.files && values.files?.length > 0}
              >
                <FormLabel>Paste a link to protect:</FormLabel>
                <Field
                  name="url"
                  type="text"
                  as={Input}
                  placeholder="https://some.link"
                />
                {errors.url && touched.url && (
                  <FormErrorMessage>{errors.url}</FormErrorMessage>
                )}
              </FormControl>
              {status === "authenticated" && !values.url && (
                <Flex direction="column">
                  <TakeoverUploadForm
                    onFilesUploaded={(files, password) => {
                      setFieldValue("password", password);
                      setFieldValue("files", [
                        ...(values.files || []),
                        ...files,
                      ]);
                    }}
                  />
                  <UploadedFiles
                    files={values.files || []}
                    password={values.password}
                  />
                </Flex>
              )}

              {showMetadata && (
                <MetadataEditor
                  initialValues={
                    values.description?.length > 10 ? initialValues : undefined
                  }
                />
              )}

              <FormControl mb={8} isInvalid={!!errors.price}>
                <Flex direction="row" align="center">
                  <FormLabel flex={2}>Price (EUR)</FormLabel>
                  <Field name="price" type="text" as={Input} flex={6} />
                </Flex>
                <FormErrorMessage>{errors.price}</FormErrorMessage>
              </FormControl>
            </Flex>
            <Portal containerRef={buttonRef}>
              <Button
                type="submit"
                w="100%"
                form="newlink-form"
                disabled={!submittable}
              >
                {status === "authenticated"
                  ? "Create Takeover"
                  : "Login and create Takeover"}
              </Button>
            </Portal>
          </Form>
        );
      }}
    </Formik>
  );
};

export default NewLink;
