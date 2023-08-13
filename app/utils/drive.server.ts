import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  unstable_createFileUploadHandler,
} from "@remix-run/node";
import { getGoogleDriveToken } from "./token.server";
import { GoogleAPIsAccessToken } from "@prisma/client";
const fs = require("fs");
const { google } = require("googleapis");
import { getUser } from "./auth.server";

export const uploadImageToGoogleDrive = async (request: Request) => {
  const [
    user,
    { client_secret, client_id, redirect_uris },
    { access_token, token_type, expires_in },
  ] = await Promise.all([
    getUser(request),
    getWebCredentials(),
    getGoogleDriveToken(),
  ]);
  const userId = user.id;
  const oldProfilePicture = user.profile?.profilePicture;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );
  oAuth2Client.setCredentials({
    access_token,
    scope: "https://www.googleapis.com/auth/drive",
    token_type,
    expires_in,
  });

  let fileType = "";
  let fileFormat = "";
  let fileName = "";
  const validImageTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
  ];
  const uploadHandlerOptions = {
    maxPartSize: 3000000,
    maxFiles: 1,
    filter: ({ contentType }) => {
      fileFormat = contentType.replace("image/", ".");
      fileType = contentType;
      return validImageTypes.includes(contentType);
    },
    directory: "./tmp",
    file: ({ contentType }) => {
      fileName = "avatar_" + userId + fileFormat;
      return fileName;
    },
  };
  const uploadHandler = unstable_createFileUploadHandler(uploadHandlerOptions);
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );

  const avatar = formData.get("profile-pic");
  if (!avatar) {
    return {
      statusCode: 400,
      error: "No file uploaded or file is not an image",
    };
  }

  const media = await {
    mimeType: fileType,
    body: await fs.createReadStream("./tmp/" + fileName),
  };
  const fileMetaData = {
    name: fileName,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  };
  const drive = google.drive({ version: "v3", auth: oAuth2Client });
  return await drive.files
    .create({
      requestBody: fileMetaData,
      media: media,
      fields: "id, name",
    })
    .then((res: any) => {
      if (oldProfilePicture) {
        deleteOldPicture();
      }
      return {
        statusCode: 200,
        fileId: res?.data?.id,
        userId: userId,
      };
    })
    .catch((err: unknown) => {
      console.error("error", err);
      return {
        statusCode: 500,
        error: err,
      };
    })
    .finally(() => {
      fs.unlinkSync("./tmp/" + fileName);
    });

  function deleteOldPicture() {
    const oldProfilePictureId = new URL(oldProfilePicture).searchParams.get(
      "id",
    );
    const url = `https://www.googleapis.com/drive/v3/files/${oldProfilePictureId}`;
    return fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  }
};

const getWebCredentials = async () => {
  const webCredentials = JSON.parse(process.env.GOOGLE_API_WEB_CREDENTIAL);
  return webCredentials.web;
};
