import { UserCircle } from "./user-circle";
import { Profile, Kudo as IKudo } from "@prisma/client";
import { colorMap, backgroundColorMap, emojiMap } from "~/utils/constants";

interface props {
  profile: Profile;
  kudo: IKudo;
}

export function Kudo({ profile, kudo }: props) {
  return (
    <div
      className={`flex justify-between ${
        backgroundColorMap[kudo?.style?.backgroundColor || "RED"]
      } p-4 rounded-xl w-full gap-x-4 relative`}
    >
      <div className="mt-1">
        <UserCircle profile={profile} className="h-16 w-16" />
      </div>
      <div className="flex flex-col grow">
        <p
          className={`${
            colorMap[kudo.style?.textColor || "WHITE"]
          } font-bold text-lg whitespace-pre-wrap break-all`}
        >
          {profile.firstName} {profile.lastName}
        </p>
        <p
          className={`${
            colorMap[kudo.style?.textColor || "WHITE"]
          } whitespace-pre-wrap break-all`}
        >
          {kudo.message}
        </p>
      </div>
      <div className="mt-1">
        <div className="bg-white rounded-full h-10 w-10 flex items-center justify-center text-2xl">
          {emojiMap[kudo.style?.emoji || "THUMBSUP"]}
        </div>
      </div>
    </div>
  );
}
