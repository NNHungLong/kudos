import { useNavigate, useSearchParams } from "@remix-run/react";
import { Form } from "@remix-run/react";
import { User } from "@prisma/client";

// components
import {
  Text,
  Flex,
  TextField,
  Button,
  IconButton,
  DropdownMenu,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  GearIcon,
  PersonIcon,
  ExitIcon,
} from "@radix-ui/react-icons";

type props = {
  mainUser: User;
};

export function SearchBar({ mainUser }: props) {
  const navigate = useNavigate();
  let [searchParams] = useSearchParams();
  const filterKudos = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const queryString = new URLSearchParams(window.location.search);
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        queryString.set(key, value);
      }
    }
    navigate(`/home?${queryString.toString()}`);
  };

  const clearFilter = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const searchBarForm = document.getElementById(
      "search-bar-form",
    ) as HTMLFormElement;
    searchBarForm.reset();
    const formData = new FormData(searchBarForm);
    const queryString = new URLSearchParams(window.location.search);
    for (const key of formData.keys()) {
      if (queryString.has(key)) {
        queryString.delete(key);
      }
    }
    navigate(`/home?${queryString.toString()}`);
  };

  const navigateToProfile = () => {
    const queryString = new URLSearchParams(window.location.search);
    navigate(`/home/profile?${queryString.toString()}`);
  };

  const logout = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    fetch("/logout", { method: "POST" }).then(() => {
      navigate("/home");
    });
  };

  const renderSignUpLoginButtons = () => {
    return (
      <Flex gap="2">
        <Button color="green" onClick={() => navigate("/login")}>
          Login
        </Button>
        <Button color="blue" onClick={() => navigate("/login?action=register")}>
          Sign Up
        </Button>
      </Flex>
    );
  };

  const renderSettingButton = () => {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger className="cursor-pointer">
          <IconButton radius="medium" variant="soft" color="gray">
            <GearIcon width="18" height="18" />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={navigateToProfile}>
            <Flex align="center" justify="start">
              <PersonIcon className="mr-2" />
              <Text as="span">Profile</Text>
            </Flex>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={logout}>
            <Flex align="center" justify="start">
              <ExitIcon className="mr-2" />
              <Text as="span">Log out</Text>
            </Flex>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  };

  return (
    <Flex
      className="py-4 gap-x-5 border-b-2 border-b-gray-300 px-2"
      justify="between"
      align="center"
    >
      <Form onSubmit={filterKudos} id="search-bar-form">
        <Flex gap="2">
          <TextField.Root>
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input name="filter" placeholder="Search for kudos..." />
          </TextField.Root>
          <Button color="blue">Search</Button>
          {searchParams.get("filter") && (
            <Button color="gray" variant="soft" onClick={clearFilter}>
              Clear Filters
            </Button>
          )}
        </Flex>
      </Form>
      {mainUser ? renderSettingButton() : renderSignUpLoginButtons()}
    </Flex>
  );
}
