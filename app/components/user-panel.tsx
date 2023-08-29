import { User } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import React from "react";

// utils
import debounce from "lodash/debounce";

// components
import {
  MagnifyingGlassIcon,
  InfoCircledIcon,
  CaretDownIcon,
  PersonIcon,
  ExitIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  Flex,
  Box,
  Text,
  Avatar,
  TextField,
  Tooltip,
  Heading,
  DropdownMenu,
  ScrollArea,
} from "@radix-ui/themes";

export function UserPanel({
  users,
  mainUser,
}: {
  users: User[];
  mainUser: User;
}) {
  const navigate = useNavigate();
  const filterUsers = debounce((event: React.ChangeEvent<HTMLInputElement>) => {
    const queryString = new URLSearchParams(window.location.search);
    queryString.set("otherUser", event.target.value);
    navigate(`/home?${queryString.toString()}`);
  }, 500);
  const navigateToProfile = () => {
    const queryString = new URLSearchParams(window.location.search);
    navigate(`/home/profile?${queryString.toString()}`);
  };
  const renderSearchBar = () => {
    return (
      <Flex>
        <TextField.Root className="w-full">
          <TextField.Slot>
            <MagnifyingGlassIcon height="16" width="16" />
          </TextField.Slot>
          <TextField.Input
            id="user-panel-search-bar"
            placeholder="Search for user..."
            onChange={filterUsers}
          />
          <TextField.Slot>
            <Tooltip content="Search by email or by name">
              <InfoCircledIcon />
            </Tooltip>
          </TextField.Slot>
        </TextField.Root>
      </Flex>
    );
  };
  const clearUserSearchBar = () => {
    const userSearchBar = document.getElementById(
      "user-panel-search-bar",
    ) as HTMLInputElement;
    if (userSearchBar) {
      userSearchBar.value = "";
    }
  };
  const handleUserCardClick = (userId: string) => {
    clearUserSearchBar();
    if (mainUser) {
      navigate(`kudo/${userId}`);
      return;
    }
    navigate("newUserModal");
  };
  const renderUserCard = (user: User) => {
    return (
      <Card
        onClick={() => handleUserCardClick(user.id)}
        className="cursor-pointer"
        key={user.id}
      >
        <Flex gap="3" align="center">
          <Avatar
            size="3"
            src={user.profile.profilePicture!}
            radius="medium"
            fallback={
              user.profile.firstName.charAt(0).toUpperCase() +
              user.profile.lastName.charAt(0).toUpperCase()
            }
          />
          <ScrollArea scrollbars="horizontal">
            <Box className="max-w-[250px]">
              <Text
                as="div"
                size="2"
                weight="bold"
                className="whitespace-nowrap"
              >{`${user.profile.firstName} ${user.profile.lastName}`}</Text>
              <Text
                as="div"
                size="2"
                color="gray"
                className="whitespace-nowrap"
              >
                {user.email}
              </Text>
            </Box>
          </ScrollArea>
        </Flex>
      </Card>
    );
  };
  const logout = () => {
    fetch("/logout", { method: "POST" }).then(() => {
      navigate("/home");
    });
  };
  const renderMainUserCard = () => {
    return (
      <Flex className="h-20 flex align-center px-3 border-t-2 border-t-gray-300">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="cursor-pointer">
            <Flex gap="3" align="center">
              <Avatar
                size="3"
                src={mainUser.profile.profilePicture!}
                radius="medium"
                fallback={
                  mainUser.profile.firstName.charAt(0).toUpperCase() +
                  mainUser.profile.lastName.charAt(0).toUpperCase()
                }
              />
              <Flex align="center">
                <ScrollArea scrollbars="horizontal">
                  <Text
                    as="div"
                    size="2"
                    weight="bold"
                    className="whitespace-nowrap  overflow-x-auto max-w-[230px]"
                  >
                    {`${mainUser.profile.firstName} ${mainUser.profile.lastName}`}{" "}
                  </Text>
                </ScrollArea>
                <CaretDownIcon className="ml-2" />
              </Flex>
            </Flex>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onClick={navigateToProfile}>
              <Flex align="center" justify="start">
                <PersonIcon className="mr-2" />
                <Text as="span" size="2">
                  Profile
                </Text>
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
      </Flex>
    );
  };
  return (
    <Flex
      direction="column"
      gap="2"
      className="border-r-2 border-r-gray-300 px-2"
    >
      <Flex direction="column" justify="center" align="center" className="h-20">
        <Heading weight="bold" as="h2">
          Kudos
        </Heading>
        <Text as="span" size="2" align="center" color="gray">
          Praise given for achievements
        </Text>
      </Flex>
      {renderSearchBar()}
      <ScrollArea>
        <Flex direction="column" gap="2">
          {users.map((user) => renderUserCard(user))}
        </Flex>
      </ScrollArea>
      {mainUser && renderMainUserCard()}
    </Flex>
  );
}
