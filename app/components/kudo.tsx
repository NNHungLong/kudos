import { User, Kudo as IKudo } from "@prisma/client";

// utils
import { emojiMap } from "~/utils/constants";
import moment from "moment";

// components
import { Card, Avatar, Text, Flex, Heading } from "@radix-ui/themes";

interface KudoWithRecipientAndAuthor extends IKudo {
  recipient: User;
  author: User;
}

interface props {
  kudo: KudoWithRecipientAndAuthor;
}

const KudosTimeFormat = {
  sameDay: "[Today], LT ",
  lastDay: "[Yesterday], LT",
  lastWeek: "[Last] dddd, LT",
  sameElse: "DD/MM/YYYY, LT",
};

export function Kudo({ kudo }: props) {
  return (
    <Card>
      <Flex>
        <Flex gap="2" className="flex-1">
          <Avatar
            radius="medium"
            size="4"
            alt="kudo-author-profile-picture"
            src={kudo.author.profile.profilePicture!}
            fallback={
              kudo.author.profile.firstName.charAt(0).toUpperCase() +
              kudo.author.profile.lastName.charAt(0).toUpperCase()
            }
          />
          <Flex direction="column" gap="1">
            <Heading
              size="3"
              weight="bold"
              className="text-ellipsis whitespace-nowrap overflow-hidden max-w-[15rem]"
            >
              {kudo.author.profile.firstName +
                " " +
                kudo.author.profile.lastName}
            </Heading>
            <Text size="1" weight="light">
              {moment(kudo.createdAt).calendar(null, KudosTimeFormat)}
            </Text>
            <Flex gap="2">
              {kudo?.style?.emoji && (
                <Text as="span">{emojiMap[kudo.style.emoji]}</Text>
              )}
              <Text size="2" className="max-h-[150px] overflow-auto">
                {kudo.message}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex className="w-60" direction="column-reverse">
          <Flex align="center" direction="row-reverse" gap="2">
            <Avatar
              radius="medium"
              size="4"
              alt="kudo-recipient-profile-picture"
              src={kudo.recipient.profile.profilePicture!}
              fallback={
                kudo.recipient.profile.firstName.charAt(0).toUpperCase() +
                kudo.recipient.profile.lastName.charAt(0).toUpperCase()
              }
            />
            <Flex direction="column">
              <Heading
                size="3"
                weight="bold"
                align="right"
                className="text-ellipsis whitespace-nowrap overflow-hidden max-w-[11rem]"
              >
                {kudo.recipient.profile.firstName +
                  " " +
                  kudo.recipient.profile.lastName}
              </Heading>
              <Text
                size="2"
                align="right"
                className="text-ellipsis whitespace-nowrap overflow-hidden max-w-[11rem]"
              >
                {kudo.recipient.email}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
