// components
import { Profile } from "@prisma/client";

interface props {
  profile: Profile;
  className?: string;
  onClick?: (...arg: any) => any;
}

export function UserCircle({ profile, className, onClick }: props) {
  return (
    <div
      className={`${className} cursor-pointer bg-gray-400 rounded-full flex justify-center items-center border-2 border-gray-400`}
      onClick={onClick}
      style={{
        backgroundSize: "cover",
        ...(profile.profilePicture
          ? { backgroundImage: `url(${profile.profilePicture})` }
          : {}),
      }}
    >
      {!profile.profilePicture && (
        <h2>
          {profile.firstName.charAt(0).toUpperCase()}
          {profile.lastName.charAt(0).toUpperCase()}
        </h2>
      )}
    </div>
  );
}
