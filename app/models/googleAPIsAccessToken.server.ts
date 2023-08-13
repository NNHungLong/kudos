import { prisma } from "../utils/prisma.server";
import { Prisma } from "@prisma/client";

type FindFirstArgs = Prisma.GoogleAPIsAccessTokenFindFirstArgs;

export const getGoogleAPIsAccessToken = async (
  FindFirstArgs: FindFirstArgs,
) => {
  return await prisma.googleAPIsAccessToken.findFirst(FindFirstArgs);
};
