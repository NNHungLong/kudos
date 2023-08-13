import jwt from "jsonwebtoken";
import { prisma } from "./prisma.server";
import { GoogleAPIsCredential, GoogleAPIsAccessToken } from "@prisma/client";
import type { SignOptions } from "jsonwebtoken";

type GoogleAPIsToken = {
  access_token: string;
  expires_in: number; // seconds
  token_type: string;
};

export const getGoogleAPIsCredential = async () => {
  return await prisma.googleAPIsCredential.findFirst({
    where: {
      project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
    },
  });
};

export const getGoogleDriveToken = async () => {
  const googleDriveCredential =
    (await getGoogleAPIsCredential()) as GoogleAPIsCredential;
  if (!googleDriveCredential) {
    console.error("Missing Google Drive APIs credentials");
  }
  const accessToken = await getGoogleDriveTokenByCredential(
    googleDriveCredential,
  );
  const tokenCreationOffsetTime = 20; // seconds
  let isTokenUnexpired =
    accessToken &&
    (accessToken.expires_in - tokenCreationOffsetTime) * 1000 +
      new Date(accessToken.created_at).getTime() >
      Date.now();
  if (isTokenUnexpired) {
    return accessToken;
  }
  // refresh token and save to GoogleAPIsAccessToken
  const googleAPIsToken = await refreshGoogleAPIsToken(googleDriveCredential);

  if (!googleAPIsToken?.access_token) {
    console.error("failed to request Google Drive Access Token");
    return { error: "failed to request Google Drive Access Token" };
  }
  let newToken;
  if (accessToken?.id?.toString()) {
    newToken = await updateGoogleAPIsAccessToken(googleAPIsToken, accessToken);
  } else {
    newToken = await createGoogleAPIsAccessToken(
      googleAPIsToken,
      googleDriveCredential,
    );
  }
  return newToken;
};

const createGoogleAPIsAccessToken = async (
  googleAPIsToken: GoogleAPIsToken,
  googleDriveCredential: GoogleAPIsCredential,
) => {
  return await prisma.googleAPIsAccessToken.create({
    data: {
      access_token: googleAPIsToken?.access_token || "",
      expires_in: googleAPIsToken?.expires_in || 0,
      token_type: googleAPIsToken?.token_type || "",
      created_at: new Date(),
      credential: {
        connect: {
          id: googleDriveCredential?.id,
        },
      },
    },
  });
};

const updateGoogleAPIsAccessToken = async (
  googleAPIsToken: GoogleAPIsToken,
  accessToken: GoogleAPIsAccessToken,
) => {
  return await prisma.googleAPIsAccessToken.update({
    where: {
      id: accessToken?.id?.toString(),
    },
    data: {
      access_token: googleAPIsToken?.access_token || "",
      expires_in: googleAPIsToken?.expires_in || 0,
      created_at: new Date(),
    },
  });
};

const getGoogleDriveTokenByCredential = async (
  credential?: GoogleAPIsCredential,
) => {
  return await prisma.googleAPIsAccessToken.findFirst({
    where: {
      credential: {
        project_id:
          credential?.project_id || process.env.GOOGLE_DRIVE_PROJECT_ID,
        private_key_id:
          credential?.private_key_id || process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
      },
    },
  });
};

const generateRefreshTokenRequestToken = async (
  googleAPIsCredential: GoogleAPIsCredential,
) => {
  const privateKey = googleAPIsCredential.private_key;
  const claimSet = {
    iss: googleAPIsCredential.client_email,
    scope: "https://www.googleapis.com/auth/drive",
    aud: googleAPIsCredential.token_uri,
    exp: Math.floor(new Date().getTime() / 1000) + 60 * 60, // 1 hour
    iat: Math.floor(new Date().getTime() / 1000), // current timestamp in seconds
  };
  const header = { algorithm: "RS256" };
  return jwt.sign(claimSet, privateKey, header as SignOptions);
};

const refreshGoogleAPIsToken = async (
  googleAPIsCredential: GoogleAPIsCredential,
) => {
  try {
    const token = await generateRefreshTokenRequestToken(googleAPIsCredential);
    return requestGoogleToken(token, googleAPIsCredential.token_uri);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error:", err.message);
      return { error: err.message };
    }
    return { error: "An unknown error occurred." };
  }
};

export const requestGoogleToken = async (
  token: string,
  token_uri: string = "https://oauth2.googleapis.com/token",
) => {
  const options: RequestInit = {
    method: "POST",
    mode: "cors", // cross origin resource sharing
    cache: "no-cache" as RequestCache,
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    }),
  };
  try {
    return await fetch(token_uri, options)
      .then((response) => response.json())
      .then((data) => data);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred." };
  }
};
