import {
  Pagination as ChakraPagination,
  IconButton,
  PaginationRootProps,
  Stack,
} from "@chakra-ui/react";

export const Pagination = (props: PaginationRootProps) => {
  return (
    <Stack alignItems="center">
      <ChakraPagination.Root {...props}>
        <ChakraPagination.Items
          render={(page) => (
            <IconButton variant={{ base: "ghost", _selected: "outline" }}>
              {page.value}
            </IconButton>
          )}
        />
      </ChakraPagination.Root>
    </Stack>
  );
};
