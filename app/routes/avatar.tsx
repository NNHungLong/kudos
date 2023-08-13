import { ActionFunction, json, ActionArgs } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/prisma.server";
import { uploadImageToGoogleDrive } from "~/utils/drive.server";

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const GGDriveResponse = await uploadImageToGoogleDrive(request);
  const userId = GGDriveResponse?.userId;
  if (GGDriveResponse.fileId) {
    const imageUrl = getImageUrl(GGDriveResponse.fileId);
    updateProfilePicture(userId, imageUrl);
    return json({ imageUrl });
  } else {
    return json({ ...GGDriveResponse }, { status: 400 });
  }
};

const getImageUrl = (fileId: string) => {
  return "https://drive.google.com/uc?id=" + fileId;
};

const updateProfilePicture = async (userId: string, imageUrl: string) => {
  await prisma.user.update({
    data: {
      profile: {
        update: {
          profilePicture: imageUrl,
        },
      },
    },
    where: {
      id: userId,
    },
  });
};
