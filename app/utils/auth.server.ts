import type { LoginForm, RegisterForm } from "./types.server";
import { prisma } from "./prisma.server";
import { redirect, json, createCookieSessionStorage } from "@remix-run/node";
import { createUser } from "./user.server";
import bcrypt from "bcryptjs";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}
const storage = createCookieSessionStorage({
  cookie: {
    name: "kudos-session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

export async function register(user: RegisterForm) {
  const exists = await prisma.user.count({
    where: { email: user.email },
  });
  if (exists) {
    return json({ error: "User already exists" }, { status: 400 });
  }
  const newUser = await createUser(user);
  if (!newUser) {
    return json(
      {
        error: "There was an error creating the user",
        field: { email: user.email, password: user.password },
      },
      { status: 422 },
    );
  }
  return createUserSession(newUser.id, "/");
}

export async function login({ email, password }: LoginForm) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return json({ error: "Invalid email or password" }, { status: 401 });
    }
    return createUserSession(user.id, "/");
  } catch (error) {
    throw json(
      { error: error, message: "can not connect to database" },
      { status: 500 },
    );
  }
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function getUserId(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profile: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}
