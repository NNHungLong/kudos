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
  DropdownMenu,
  ScrollArea,
} from "@radix-ui/themes";

export function UserPanel({
  users,
  mainUser,
  className = "",
}: {
  users: User[];
  mainUser: User;
  className?: string;
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
      <Flex className="h-[32px] shrink-0 grow-0">
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
            <Box className="lg:max-w-[230px] md:max-w-[180px]">
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
      <Flex className="h-[50px] shrink-0 grow-0 align-center px-3 border-t-2 border-t-gray-300">
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
                <ScrollArea
                  scrollbars="horizontal"
                  className="lg:max-w-[200px] md:max-w-[150px] sm:max-w-[100px]"
                >
                  <Text
                    as="div"
                    size="2"
                    weight="bold"
                    className="whitespace-nowrap  overflow-x-auto "
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
    <div className={className ? `${className}` : "hidden md:inline-block"}>
      <Flex
        direction="column"
        gap="2"
        className="border-r-2 border-r-gray-300 px-4 py-4 h-full max-h-full"
      >
        {renderSearchBar()}
        <ScrollArea
          style={{
            height: "calc(100vh - 195px)",
          }}
        >
          <Flex direction="column" gap="2">
            {users.map((user) => renderUserCard(user))}
          </Flex>
        </ScrollArea>
        {mainUser && renderMainUserCard()}
      </Flex>
    </div>
  );
}
