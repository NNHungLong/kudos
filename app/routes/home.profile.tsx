// cores
import {
  json,
  LoaderFunction,
  ActionFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { Department } from "@prisma/client";

// utils
import { getUser, requireUserId } from "~/utils/auth.server";
import { departments } from "~/utils/constants";
import { validateName } from "~/utils/validators.server";
import { updateUser } from "~/utils/user.server";
import { useNavigate } from "@remix-run/react";

// components
import { Modal } from "~/components/modal";
import { ImageUploader } from "~/components/image-uploader";
import {
  Button,
  Flex,
  TextField,
  Box,
  Text,
  Heading,
  Select,
  Card,
  Tooltip,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
};

export default function ProfileSettings() {
  const { user } = useLoaderData();
  const [showModal, setShowModal] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName,
    lastName: user?.profile?.lastName,
    department: user?.profile?.department || "MARKETING",
    profilePicture: user?.profile?.profilePicture || "",
  });
  const navigate = useNavigate();
  const handleFileUpload = async (file: File) => {
    let inputFormData = new FormData();
    inputFormData.append("profile-pic", file);
    const response = await fetch("/avatar", {
      method: "POST",
      body: inputFormData,
    });
    const responseJSON = await response.json();
    const { imageUrl, error } = responseJSON;
    if (error) {
      alert(error);
    }
    if (imageUrl) {
      setFormData((form) => ({
        ...form,
        profilePicture: imageUrl,
      }));
    }
  };
  const navigateToHome = () => {
    let currentPath = new URL(window.location.href).pathname;
    if (currentPath === "/home") return;
    if (currentPath.match(/^\/home/)) {
      const queryString = new URLSearchParams(window.location.search);
      navigate(`/home?${queryString.toString()}`);
      return;
    }
    navigate("/home");
  };
  const hideModal = () => {
    setShowModal(false);
    navigateToHome();
  };
  return (
    <Modal isOpen={showModal} className="w-1/3" hideModal={hideModal}>
      <Card>
        <Box width="auto">
          <Flex align="start" justify="between">
            <Flex direction="column">
              <Heading size="6" as="h4" weight="bold" align="left">
                Edit Profile
              </Heading>
              <Text size="2" weight="medium">
                Make changes to your profile
              </Text>
            </Flex>
            <Flex direction="column" align="center">
              <ImageUploader
                onChange={handleFileUpload}
                imageUrl={formData.profilePicture || ""}
                fallback={
                  user?.profile?.firstName.charAt(0).toUpperCase() +
                  user?.profile?.lastName.charAt(0).toUpperCase()
                }
              />
              <Tooltip
                multiline={true}
                content="Click on the avatar or drag an image into the avatar section to upload a new profile picture."
              >
                <InfoCircledIcon radius="full" />
              </Tooltip>
            </Flex>
          </Flex>
          <form method="post" className="mt-2">
            <Flex direction="column" gap="3">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  First Name
                </Text>
                <TextField.Input
                  name="firstName"
                  defaultValue={user?.profile?.firstName}
                  placeholder="First Name"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Last Name
                </Text>
                <TextField.Input
                  name="lastName"
                  defaultValue={user?.profile?.lastName}
                  placeholder="Last Name"
                />
              </label>
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Department
                </Text>
                <Select.Root
                  defaultValue={user?.profile?.department}
                  name="department"
                >
                  <Select.Trigger className="w-full" />
                  <Select.Content position="popper">
                    {departments.map((department) => (
                      <Select.Item
                        key={department.value}
                        value={department.value}
                      >
                        {department.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </label>
            </Flex>
            <Flex gap="3" mt="4" justify="end">
              <Button variant="soft" color="gray" onClick={hideModal}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </Flex>
          </form>
        </Box>
      </Card>
    </Modal>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const userId = await requireUserId(request);
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");
  let department = form.get("department");

  if (typeof firstName !== "string" || typeof lastName !== "string") {
    return json({ error: `Invalid form data` }, { status: 400 });
  }
  const errors = {
    firstName: validateName(firstName),
    lastName: validateName(lastName),
  };

  if (Object.values(errors).some(Boolean)) {
    return json(
      { errors, fields: { firstName, lastName, department } },
      { status: 422 },
    );
  }
  await updateUser(userId, {
    firstName,
    lastName,
    department: department as Department,
  });
  return redirect("/home");
};
