import bcrypt from "bcryptjs";
import type { RegisterForm } from "./types.server";
import { prisma } from "./prisma.server";
import { Profile, Prisma } from "@prisma/client";

export const createUser = async (user: RegisterForm) => {
  const passwordHash = bcrypt.hashSync(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
  });
  return { id: newUser.id, email: newUser.email };
};

export const getOtherUsers = async (
  userId: string,
  searchOtherUser?: string | null,
) => {
  let whereUserInput: Prisma.UserWhereInput;
  if (searchOtherUser) {
    let searchOtherUserMultipleWords = searchOtherUser?.split(" ");
    if (searchOtherUserMultipleWords.length > 1) {
      whereUserInput = {
        AND: [
          {
            OR: [
              {
                profile: {
                  is: {
                    firstName: {
                      contains: searchOtherUserMultipleWords[0],
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                profile: {
                  is: {
                    lastName: {
                      startsWith: searchOtherUserMultipleWords[1],
                      mode: "insensitive",
                    },
                  },
                },
              },
            ],
          },
          {
            id: { not: userId },
          },
        ],
      };
    } else {
      whereUserInput = {
        AND: [
          {
            OR: [
              {
                profile: {
                  is: {
                    firstName: {
                      startsWith: searchOtherUser,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                profile: {
                  is: {
                    lastName: {
                      startsWith: searchOtherUser,
                      mode: "insensitive",
                    },
                  },
                },
              },
              {
                email: { contains: searchOtherUser, mode: "insensitive" },
              },
            ],
          },
          {
            id: { not: userId },
          },
        ],
      };
    }
  } else {
    whereUserInput = {
      id: { not: userId },
    };
  }
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      profile: true,
    },
    where: whereUserInput,
    orderBy: {
      profile: {
        firstName: "asc",
      },
    },
    skip: 0,
    take: 100,
  });
};

export const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      profile: true,
    },
    where: {
      id: userId,
    },
  });
};

export const updateUser = async (userId: string, profile: Partial<Profile>) => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profile: {
        update: profile,
      },
    },
  });
};
