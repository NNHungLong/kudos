// cores
import { LoaderFunction, json } from "@remix-run/node";
import { Kudo as IKudo, Prisma, User } from "@prisma/client";
import { useLoaderData, Outlet } from "@remix-run/react";

// utils
import { getUserId } from "~/utils/auth.server";
import { getFilteredKudos } from "~/utils/kudo.server";
import { getOtherUsers, getUserById } from "~/utils/user.server";

// components
import { Kudo } from "~/components/kudo";
import { Layout } from "~/components/layout";
import { UserPanel } from "~/components/user-panel";
import { SearchBar } from "~/components/search-bar";

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

  let sortOptions: Prisma.KudoOrderByWithRelationInput = {};
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
  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} mainUser={user} />
        <div className="flex-1 flex flex-col">
          <SearchBar mainUser={user} />
          <div className="flex-1 flex overflow-y-scroll flex-col">
            <div className="w-full px-10 py-5 flex flex-col gap-y-4">
              {kudos.map((kudo: KudoWithRecipientAndAuthor) => (
                <Kudo key={kudo.id} kudo={kudo} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
