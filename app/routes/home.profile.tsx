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

// components
import { Modal } from "~/components/modal";
import { FormField } from "~/components/form-field";
import { SelectBox } from "~/components/select-box";
import { ImageUploader } from "~/components/image-uploader";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return json({ user });
};

export default function ProfileSettings() {
  const { user } = useLoaderData();

  const [formData, setFormData] = useState({
    firstName: user?.profile?.firstName,
    lastName: user?.profile?.lastName,
    departments: user?.profile?.departments || "MARKETING",
    profilePicture: user?.profile?.profilePicture || "",
  });
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setFormData((form) => ({
      ...form,
      [field]: e.target.value,
    }));
  };
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
  return (
    <Modal isOpen={true} className="w-1/3">
      <div className="p-3">
        <h2 className="text-4xl font-semibold text-blue-600 text-center mb-4">
          Your Profile
        </h2>
        <div className="flex">
          <div className="w-1/3">
            <ImageUploader
              onChange={handleFileUpload}
              imageUrl={formData.profilePicture || ""}
            />
          </div>
          <div className="flex-1">
            <form method="post">
              <FormField
                htmlFor="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange(e, "firstName")}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange(e, "lastName")}
              />
              <SelectBox
                className="w-full rounded-xl px-3 py-2"
                id="departments"
                label="Departments"
                name="department"
                options={departments}
                value={formData.departments}
                onChange={(e) => handleInputChange(e, "departments")}
              />
              <div className="w-full text-right mt-4">
                <button className="rounded-xl bg-yellow-300 font-semibold text-blue-600 px-16 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const userId = await requireUserId(request);
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");
  let department = form.get("department");

  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof department !== "string"
  ) {
    return json({ error: `Invalid form data` }, { status: 400 });
  }
  const errors = {
    firstName: validateName(firstName),
    lastName: validateName(lastName),
    department: validateName(department),
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
