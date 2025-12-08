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

export async function getOrCreateDemoDocumentAndSchema(userId: string) {
  const demoSchemaContent = `# Grocery List

- \`item:/\\w+/\`+
`;

  const demoDocumentContent = `# Grocery List

- Apples
- Bananas
- Carrots`;

  // Get or create schema
  const schemasResult = await clientApi.schemas.getAll();
  let schema = schemasResult.body?.find(s => s.name === "Demo Schema");
  
  if (!schema) {
    const createResult = await clientApi.schemas.create({
      body: { name: "Demo Schema", content: demoSchemaContent }
    });
    schema = createResult.body;
  }

  // Get or create document
  const documentsResult = await clientApi.documents.getAll();
  let document = documentsResult.body?.find(d => d.name === "Demo Document");
  
  if (!document) {
    const createResult = await clientApi.documents.create({
      body: {
        name: "Demo Document",
        schemaId: schema._id,
        content: demoDocumentContent,
        author: userId,
        tags: []
      }
    });
    document = '_id' in createResult.body ? createResult.body : null;
  }

  return {
    documentId: document?._id || "",
    documentName: document?.name || "Demo Document",
    documentContent: document?.content || demoDocumentContent,
    schemaId: schema._id,
    schemaContent: demoSchemaContent
  };
}
