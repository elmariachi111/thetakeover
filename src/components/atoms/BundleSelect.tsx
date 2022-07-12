import { IconButton } from "@chakra-ui/react";
import { FiCheckSquare, FiSquare } from "react-icons/fi";

export const BundleSelect = (props: {
  id: string;
  isSelected: boolean;
  select: (hash: string) => void;
}) => {
  const { id, isSelected, select } = props;
  return (
    <IconButton
      aria-label="visit"
      icon={isSelected ? <FiCheckSquare /> : <FiSquare />}
      onClick={() => select(id)}
      variant="unstyled"
    />
  );
};
