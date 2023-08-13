// cores
import { LoaderFunction, json } from "@remix-run/node";
import { Kudo as IKudo, Profile, Prisma } from "@prisma/client";
import { useLoaderData, Outlet } from "@remix-run/react";

// utils
import { requireUserId } from "~/utils/auth.server";
import { getFilteredKudo, getRecentKudos } from "~/utils/kudo.server";
import { getOtherUsers, getUserById } from "~/utils/user.server";

// components
import { Kudo } from "~/components/kudo";
import { Layout } from "~/components/layout";
import { UserPanel } from "~/components/user-panel";
import { SearchBar } from "~/components/search-bar";
import { RecentBar } from "~/components/recent-bar";

interface KudoWithProfile extends IKudo {
  author: {
    profile: Profile;
  };
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const users = await getOtherUsers(userId);
  const user = await getUserById(userId);
  const recentKudos = await getRecentKudos();

  const url = new URL(request.url);
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
  const kudos = await getFilteredKudo(userId, sortOptions, textFilter);
  return json({ users, kudos, recentKudos, user });
};

export default function Home() {
  const { users, kudos, recentKudos, user } = useLoaderData();
  return (
    <Layout>
      <Outlet />
      <div className="h-full flex">
        <UserPanel users={users} />
        <div className="flex-1 flex flex-col">
          <SearchBar profile={user.profile} />
          <div className="flex-1 flex">
            <div className="w-full p-10 flex flex-col gap-y-4">
              {kudos.map((kudo: KudoWithProfile) => (
                <Kudo key={kudo.id} kudo={kudo} profile={kudo.author.profile} />
              ))}
            </div>
            <RecentBar kudos={recentKudos} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
