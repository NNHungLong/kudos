// cores
import {
  json,
  LoaderFunction,
  ActionFunction,
  redirect,
} from "@remix-run/node";
import { useState } from "react";
import { Emoji } from "@prisma/client";
import { useLoaderData, useNavigate } from "@remix-run/react";

// utils
import { getUserById } from "~/utils/user.server";
import { getUser } from "~/utils/auth.server";
import { emojiMap } from "~/utils/constants";
import { requireUserId } from "~/utils/auth.server";
import { createKudo } from "~/utils/kudo.server";
import moment from "moment";

// components
import {
  Card,
  Avatar,
  Text,
  Flex,
  Heading,
  TextArea,
  Select,
  Button,
} from "@radix-ui/themes";
import { Modal } from "~/components/modal";

const KudosTimeFormat = {
  sameDay: "[Today], LT ",
  lastDay: "[Yesterday], LT",
  lastWeek: "[Last] dddd, LT",
  sameElse: "DD/MM/YYYY, LT",
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const message = form.get("message");
  const emoji = form.get("emoji");
  const recipientId = form.get("recipientId");

  if (
    typeof message !== "string" ||
    typeof recipientId !== "string" ||
    typeof emoji !== "string"
  ) {
    return json({ error: `Invalid Form Data` }, { status: 400 });
  }
  if (!message.length) {
    return json({ error: `Please provide a message.` }, { status: 400 });
  }
  if (!recipientId.length) {
    return json({ error: `No recipient found...` }, { status: 400 });
  }
  await createKudo(message, userId, recipientId, {
    emoji: emoji as Emoji,
  });
  return redirect("/home");
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { userId } = params;
  if (typeof userId !== "string") {
    redirect("/home");
  }
  const recipient = await getUserById(userId as string);
  const user = await getUser(request);
  return json({ recipient, user });
};

export default function KudoModal() {
  const { recipient, user } = useLoaderData();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const hideModal = () => {
    setShowModal(false);
    navigate(`/home`);
  };
  const setEmojiInputValue = (emoji: Emoji) => {
    document.getElementById("emojiInput")!.setAttribute("value", emoji);
    document.getElementById("emojiText")!.innerHTML = emojiMap[emoji];
  };
  const updateMessageInputValue = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    document
      .getElementById("kudos-message-input")!
      .setAttribute("value", e.target.value);
  };
  return (
    <Modal isOpen={showModal} hideModal={hideModal} className="w-2/3">
      <Flex direction="column">
        <Card>
          <div className="flex md:flex-row flex-col">
            <Flex gap="2" className="flex-1">
              <Avatar
                radius="medium"
                size="4"
                alt="kudo-author-profile-picture"
                src={user.profile.profilePicture!}
                fallback={
                  user.profile.firstName.charAt(0).toUpperCase() +
                  user.profile.lastName.charAt(0).toUpperCase()
                }
              />
              <Flex direction="column" gap="1" className="flex-1">
                <Flex gap="1" align="center">
                  <Heading size="3" weight="bold">
                    {user.profile.firstName + " " + user.profile.lastName}
                  </Heading>
                  <Text id="emojiText" size="3">
                    {emojiMap["THUMBSUP"]}
                  </Text>
                </Flex>
                <Text size="1" weight="light">
                  {moment().calendar(null, KudosTimeFormat)}
                </Text>
                <Flex gap="2" justify="start" className="relative">
                  <TextArea
                    name="message"
                    size="3"
                    className="max-h-[150px]"
                    placeholder="Kudos message..."
                    onChange={updateMessageInputValue}
                  />
                </Flex>
              </Flex>
            </Flex>
            <Flex className="md:w-60" direction="column-reverse">
              <Flex align="center" direction="row-reverse" gap="2">
                <Avatar
                  radius="medium"
                  size="4"
                  alt="kudo-recipient-profile-picture"
                  src={recipient.profile.profilePicture!}
                  fallback={
                    recipient.profile.firstName.charAt(0).toUpperCase() +
                    recipient.profile.lastName.charAt(0).toUpperCase()
                  }
                />
                <Flex direction="column">
                  <Heading size="3" weight="bold" align="right">
                    {recipient.profile.firstName +
                      " " +
                      recipient.profile.lastName}
                  </Heading>
                  <Text size="2" align="right">
                    {recipient.email}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </div>
        </Card>
        <Flex
          gap="2"
          direction="row"
          justify="between"
          className="mt-4 pt-2 border-t-2 border-t-gray-300"
        >
          <Button onClick={hideModal} color="gray" className="self-end">
            Cancel
          </Button>
          <form method="post">
            <Flex gap="2">
              <input type="hidden" name="recipientId" value={recipient.id} />
              <input
                id="kudos-message-input"
                type="hidden"
                name="message"
                value=""
              />
              <input type="hidden" name="userId" value={user.id} />
              <input
                id="emojiInput"
                type="hidden"
                name="emoji"
                value="THUMBSUP"
              />
              <Select.Root name="emoji" onValueChange={setEmojiInputValue}>
                <Select.Trigger
                  placeholder={`Select an emoji ${emojiMap["THUMBSUP"]}`}
                />
                <Select.Content>
                  {Object.keys(emojiMap).map((emoji: string) => (
                    <Select.Item key={emoji} value={emoji}>
                      {`${emojiMap[emoji as keyof typeof emojiMap]} ${
                        emoji.charAt(0).toUpperCase() +
                        emoji.slice(1).toLowerCase()
                      }`}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Button type="submit" color="blue">
                Send
              </Button>
            </Flex>
          </form>
        </Flex>
      </Flex>
    </Modal>
  );
}
