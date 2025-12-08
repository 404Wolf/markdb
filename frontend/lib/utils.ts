import { clientApi } from "./api";

export async function getOrCreateDemoUser() {
  const placeholderUser = {
    email: "test@example.com",
    name: "Test User",
    password: "password"
  };

  // Try to create user first
  const createResult = await clientApi.users.create({
    body: placeholderUser
  });

  if (createResult.status === 201) {
    return { _id: createResult.body._id, ...placeholderUser };
  }

  // If creation fails (user already exists), try to login
  const loginResult = await clientApi.users.login({
    body: {
      email: placeholderUser.email,
      password: placeholderUser.password
    }
  });

  if (loginResult.status === 200) {
    console.log("User logged in:", loginResult.body);
    return { _id: loginResult.body._id, ...placeholderUser };
  } else {
    throw new Error("Failed to create or login user");
  }
}
