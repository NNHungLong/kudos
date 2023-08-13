// cores
import { useCallback, useState, useEffect, useRef } from "react";
import { Response } from "@remix-run/node";
import { useNavigation, useActionData } from "@remix-run/react";
import { Form } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

// utils
import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/utils/validators.server";
import { login, register } from "~/utils/auth.server";

// components
import { Layout } from "~/components/layout";
import { FormField } from "~/components/form-field";

type Action = "login" | "register";
const DEFAULT_FORM_DATA = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
};

export default function Login() {
  const navigation = useNavigation();
  let actionData = useActionData();
  // navigation.state: 'idle' -> 'submitting' -> 'loading' -> 'idle'
  const [formData, setFormData] = useState({
    email: actionData?.fields?.email || "",
    password: actionData?.fields?.password || "",
    firstName: actionData?.fields?.firstName || "",
    lastName: actionData?.fields?.lastName || "",
  });
  const firstLoad = useRef(true);
  const [errors, setErrors] = useState(actionData?.errors || {});
  const [formError, setFormError] = useState(actionData?.error || "");
  const [action, setAction] = useState<Action>("login");
  useEffect(() => {
    // setErrors(DEFAULT_FORM_DATA);
    // setFormError("");
    // setFormData(DEFAULT_FORM_DATA)
    firstLoad.current = false;
  }, []);
  useEffect(() => {
    if (!firstLoad.current) {
      setErrors(DEFAULT_FORM_DATA);
      setFormError("");
      setFormData(DEFAULT_FORM_DATA);
    }
  }, [action]);
  useEffect(() => {
    if (actionData?.errors) {
      setErrors(actionData.errors);
    } else {
      setErrors(DEFAULT_FORM_DATA);
    }
    if (actionData?.error) {
      setFormError(actionData.error);
    } else {
      setFormError("");
    }
  }, [actionData]);
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((oldFormData: typeof DEFAULT_FORM_DATA) => ({
        ...oldFormData,
        [e.target.name]: e.target.value,
      }));
      if (navigation.state === "idle") {
        setFormError("");
      }
    },
    [navigation.state],
  );
  const toggleAction = () => {
    setAction((oldAction) => (oldAction === "login" ? "register" : "login"));
    setFormData(DEFAULT_FORM_DATA);
  };
  return (
    <Layout>
      <div className="h-full justify-center items-center flex flex-col gap-y-4">
        <h2 className="text-5xl font-extrabold text-yellow-300">
          Welcome to Kudos!
        </h2>
        <p className="font-semibold text-slate-300">
          {action === "login"
            ? "Log In To Give Some Praise!"
            : "Sign Up To Get Started!"}
        </p>

        <Form
          method="post"
          action="/login"
          className="rounded-2xl bg-gray-200 p-6 w-96"
        >
          <FormField
            htmlFor="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors?.email}
            navigationState={navigation.state}
          />
          <FormField
            htmlFor="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors?.password}
            navigationState={navigation.state}
          />
          {action === "register" && (
            <>
              <FormField
                htmlFor="firstName"
                label="First Name"
                onChange={handleInputChange}
                value={formData.firstName}
                error={errors?.firstName}
                navigationState={navigation.state}
              />
              <FormField
                htmlFor="lastName"
                label="Last Name"
                onChange={handleInputChange}
                value={formData.lastName}
                error={errors?.lastName}
                navigationState={navigation.state}
              />
            </>
          )}
          <div className="w-full text-center">
            <button
              type="submit"
              name="_action"
              value={action}
              className={`rounded-xl mt-2 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out ${
                navigation.state === "submitting"
                  ? "bg-yellow-100"
                  : "bg-yellow-300 hover:bg-yellow-400 hover:-translate-y-1"
              }`}
            >
              {navigation.state === "submitting"
                ? "Submitting..."
                : action === "login"
                ? "Login"
                : "Sign Up"}
            </button>
          </div>
          <div className="text-red-500 mt-2 text-xs h-5 flex items-center justify-center font-semibold">
            {formError ? formError : ""}
          </div>
        </Form>
        <button
          onClick={toggleAction}
          className="absolute top-8 right-8 rounded-xl bg-yellow-300 font-semibold text-blue-600 px-3 py-2 transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
        >
          {action === "login" ? "Sign Up" : "Login"}
        </button>
      </div>
    </Layout>
  );
}

// post request in /login path
export const action = async ({ request }: ActionArgs) => {
  const form = await request.formData();
  const action = form.get("_action");
  const email = form.get("email");
  const password = form.get("password");
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");

  if (
    typeof action !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json({ error: "Invalid form data" }, { status: 400 });
  }

  if (
    action === "register" &&
    (typeof firstName !== "string" || typeof lastName !== "string")
  ) {
    return new Response("Invalid form data", { status: 400 });
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(action === "register"
      ? {
          firstName: validateName((firstName as string) || ""),
          lastName: validateName((lastName as string) || ""),
        }
      : {}),
  };

  if (Object.values(errors).some(Boolean)) {
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
        form: action,
      },
      { status: 422 },
    );
  }
  switch (action) {
    case "login": {
      return await login({ email, password });
    }
    case "register": {
      firstName = firstName as string;
      lastName = lastName as string;
      return await register({ email, password, firstName, lastName });
    }
    default: {
      return json({ error: "Invalid action", action }, { status: 400 });
    }
  }
};
