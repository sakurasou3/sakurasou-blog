import { IconButton, Stack } from "@chakra-ui/react";
import { BsCardText, BsListUl } from "react-icons/bs";

export type ListLayoutType = "list" | "card";

interface Props {
  layout: ListLayoutType;
  onChangeLayout: () => void;
}

export const SwitchLayoutButton = ({ layout, onChangeLayout }: Props) => {
  return (
    <Stack alignItems="flex-end">
      <IconButton
        variant="ghost"
        width="40px"
        alignItems="center"
        onClick={onChangeLayout}
      >
        {layout === "list" ? <BsCardText /> : <BsListUl />}
      </IconButton>
    </Stack>
  );
};
