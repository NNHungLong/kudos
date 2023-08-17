import { json } from "@remix-run/node";
import { prisma } from "./prisma.server";
import { KudoStyle, Prisma } from "@prisma/client";

export const createKudo = async (
  message: string,
  userId: string,
  recipientId: string,
  style: KudoStyle,
) => {
  try {
    const newKudo = await prisma.kudo.create({
      data: {
        message,
        style,
        author: {
          connect: { id: userId },
        },
        recipient: {
          connect: { id: recipientId },
        },
      },
    });
    return newKudo;
  } catch (error: any) {
    return json(
      { error: error?.message, message: "Can not insert into database" },
      500,
    );
  }
};

export const getFilteredKudo = async (
  userId: string,
  sortFilter: Prisma.KudoOrderByWithRelationInput,
  whereFilter: Prisma.KudoWhereInput,
) => {
  return await prisma.kudo.findMany({
    select: {
      id: true,
      style: true,
      message: true,
      author: {
        select: {
          profile: true,
        },
      },
    },
    orderBy: {
      ...sortFilter,
    },
    where: {
      ...whereFilter,
    },
  });
};

export const getRecentKudos = async () => {
  return await prisma.kudo.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      style: {
        select: { emoji: true },
      },
      recipient: {
        select: {
          id: true,
          profile: true,
        },
      },
    },
  });
};
