// cores
import { LoaderFunction, json } from "@remix-run/node";
import { Kudo as IKudo, Prisma, User } from "@prisma/client";
import { useLoaderData, Outlet } from "@remix-run/react";
import { useState } from "react";

// utils
import { getUserId } from "~/utils/auth.server";
import { getFilteredKudos } from "~/utils/kudo.server";
import { getOtherUsers, getUserById } from "~/utils/user.server";

// components
import { Kudo } from "~/components/kudo";
import { Layout } from "~/components/layout";
import { UserPanel } from "~/components/user-panel";
import { SearchBar } from "~/components/search-bar";
import { Flex, ScrollArea } from "@radix-ui/themes";

interface KudoWithRecipientAndAuthor extends IKudo {
  recipient: User;
  author: User;
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const url = new URL(request.url);
  const searchOtherUser = url.searchParams.get("otherUser");
  const users = await getOtherUsers(userId, searchOtherUser);
  const user = userId ? await getUserById(userId) : null;

  const sort = url.searchParams.get("sort");
  const filter = url.searchParams.get("filter");

  let sortOptions: Prisma.KudoOrderByWithRelationInput = { createdAt: "desc" };
  if (sort) {
    switch (sort) {
      case "date":
        sortOptions = { createdAt: "desc" };
        break;
      case "sender":
        sortOptions = {
          author: {
            profile: { firstName: "asc" },
          },
        };
        break;
      case "emoji":
        sortOptions = { style: { emoji: "asc" } };
        break;
    }
  }
  let textFilter: Prisma.KudoWhereInput = {};
  if (filter) {
    textFilter = {
      OR: [
        { message: { mode: "insensitive", contains: filter } },
        {
          author: {
            OR: [
              {
                profile: {
                  is: { firstName: { mode: "insensitive", contains: filter } },
                },
              },
              {
                profile: {
                  is: { lastName: { mode: "insensitive", contains: filter } },
                },
              },
            ],
          },
        },
      ],
    };
  }
  const kudos = await getFilteredKudos(sortOptions, textFilter);
  return json({ users, kudos, user });
};

export default function Home() {
  const { users, kudos, user } = useLoaderData();
  const [showSideBar, setShowSideBar] = useState(false);
  const sideBarClassName =
    "bg-white absolute z-10 top-[66px] left-0 right:0 h-screen min-w-full" +
    (showSideBar ? "" : " hidden");
  const toggleSideBar = () => {
    setShowSideBar((prevShowSideBar) => !prevShowSideBar);
  };

  return (
    <Layout className="overflow-hidden relative">
      <Outlet />
      <SearchBar mainUser={user} toggleSideBar={toggleSideBar} />
      <Flex className="flex-grow-1 flex-shrink-1">
        <UserPanel users={users} mainUser={user} />
        <ScrollArea style={{ height: "calc(100vh - 66px)" }}>
          <Flex direction="column" className="px-4 py-4 gap-y-4">
            {kudos.map((kudo: KudoWithRecipientAndAuthor) => (
              <Kudo key={kudo.id} kudo={kudo} />
            ))}
          </Flex>
        </ScrollArea>
      </Flex>
      <UserPanel className={sideBarClassName} users={users} mainUser={user} />
    </Layout>
  );
}
