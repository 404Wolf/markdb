#set page(
  paper: "us-letter",
  margin: (x: 1in, y: 1in),
  numbering: "1",
)

#set text(
  font: "New Computer Modern",
  size: 11pt,
)

#set par(
  justify: true,
  leading: 0.65em,
)

#set heading(numbering: "1.1")

#align(center)[
  #v(3cm)

  #text(size: 32pt, weight: "bold")[
    MarkDB
  ]

  #v(0.5cm)

  #line(length: 60%, stroke: 0.5pt)

  #v(1.5cm)

  #text(size: 16pt, weight: "semibold")[
    CSDS 341: Introduction to Database Systems
  ]

  #v(0.3cm)

  #text(size: 14pt, style: "italic")[
    Fall 2025 Final Project Report
  ]

  #v(3cm)

  #text(size: 13pt, weight: "semibold")[
    Team Members
  ]

  #v(0.5cm)

  #text(size: 12pt)[
    Wolf Mermelstein

    Nick Mahdavi
  ]

  #v(1fr)

  #text(size: 12pt)[
    December 8, 2025
  ]

  #v(2cm)
]

#pagebreak()

#outline(
  title: "Table of Contents",
  indent: auto,
)

#pagebreak()

= Application Background

// Wolf
// Provide well-detailed background information including:

// - Overview of the application domain
// - Problem statement or motivation
// - Target users and use cases
// - Existing applications in this space
// - How your application differs or improves upon existing solutions
// - Real-world relevance and importance

Markdown is an unstructured text markup language, sort of like latex. Markdown is designed to be nice and easy to write and read, and to somewhat look like its corresponding output. But Markdown is a totally unstructured data format, and sometimes it is useful to attempt to extract or enforce structure on Markdown documents. For example, right now most LLMs naturally output Markdown, since it is an extremely token-efficient and visual format.

#link("https://github.com/404wolf/mdvalidate", "Mdvalidate") is a tool that lets you define a schema for your Markdown in the form of a Markdown file that looks similar to the markdown you are trying to validate. For example, the below example shows how it can be used to validate a grocery list of a specific shape.

#align(center,
  grid(
    columns: (1fr, auto, 1fr),
    gutter: 1em,
    ```md
    # Grocery List

    - `item:/[A-Z][a-z]+/`+
    ```,
    line(angle: 90deg, stroke: 0.5pt),
    ```md
    # Grocery List

    - Apples
    - Potatos
    ```
  )
)

The tool can also output the actual data as a `json`, so from the above you could extract the output:

#align(center,
  ```json
  { "item": [ "Apples", "Potatos"] }
  ```
)

`mdvalidate` is an ongoing project that is the basis of the idea for this project, `markdb`. `markdb` is a database for storing *structured* Markdown data.

Imagine that you had a collection of many Markdown files, all grocery lists. What `markdb` lets you do is store, view, and modify these grocery lists in our website, in a way where you can only ever save a grocery list that validates against a `mdvalidate` Markdown schema. You can change the schema associated with a document, and have many different documents be locked to using the same schema.

= Data Description

== Overview

markdb primarily organizes two types of files: *documents* and *schemas*.

*Documents* are ordinary plaintext files. These are assumed to conform to the Markdown language, but any plaintext document can be stored as a markdb document. Each document is associated with exactly one schema, which enforces a particular structure on the document.

*Schemas* are a hybrid of the Markdown and regex grammars. Schemas match literal text by default, and complex rules are specified between backticks using regular expressions. For example, the final `+` in the expression ```- `item:/\w+/`+``` stands for "one or more of the preceding pattern". In this case, we have a nonempty list where each item consists of one or more word characters.

For more information on mdvalidate and the schema specification, see appendix B.

== Database Relations and Normal Form

#figure(image("er.png"), caption: [ER diagram for our database])

// Our database stores users, tags, schemas, documents, and the loose actual extracted data from the documents.

Since we use Mongodb for our actual database management system, to enforce schemas we used Mongoose. Mongoose is a typescript library that makes it easy to store well structured data in Mongodb. The actual schemas were as follows

In addition to just the actual types that the schemas enforce though, we still have important semantic constraints in our database. For documents in our database, we only want to ever store a document record if it validates against its given `schemaId` schema, and we would only like to be able to change a schema if it does not break any of the documents that it is attached to. This is a tricky relationship to enforce, and is something that we cannot express in Mongoose alone --- we've had to design our actual backend to run the validations before doing database mutations.

In @fig:3nf you can find a functional dependency table for our database system. The biggest functional dependency that we could not normalize in our design is that, given a document and its associated schema's contents joined together, the "Extracted" output can always be determined by actually running the validator. However, even though this is true we still store the result in the `extractedSchema` collection, because running this validation is relatively expensive. This is a functional dependency that is impossible to describe within the scope of our database system alone and must be managed in application code.

#figure(
  table(
    columns: 2,
    align: (left, left),
    [*Relation*], [*Minimal Functional Dependencies*],

    [Documents],
    [\_id $arrow.r$ name, schemaId, content, author, tags, createdAt \
       name $arrow.r$ \_id],

    [Extracted],
    [\_id $arrow.r$ forDocument, createdAt, data ],

    [Schema],
    [\_id $arrow.r$ name, content, createdAt],

    [Tags],
    [\_id $arrow.r$ name, createdAt \
       name $arrow.r$ \_id],

    [Users],
    [\_id $arrow.r$ name, email, password, createdAt \
       email $arrow.r$ \_id],
  ),
  caption: [Minimal set of functional dependencies for each relation]
) <fig:3nf>

== Normalization Analysis

// Wolf
Explain why each relation is in 3NF or BCNF.

= Example Queries

We're using Mongodb but for completion we have included this section using regular Postgres compliant queries. Mongodb is No-SQL and has its own query syntax.

== Get all documents with extracted data

SQL:
```sql
SELECT d.*, e.data AS extracted
FROM documents d
LEFT JOIN extracted e ON d._id = e.forDocument;
```

Relational Algebra:

$ "Documents" join.l_("forDocument = _id") "Extracted" $

== Get document and extracted data by ID

SQL:
```sql
SELECT d.*, e.data AS extracted
FROM documents d
LEFT JOIN extracted e ON d._id = e.forDocument
WHERE d._id = :id;
```

Relational Algebra:
$ sigma_("id = id")("Documents" join.l("forDocument = _id") "Extracted") $

== Get all records

SQL:
```sql
SELECT * FROM schemas;
SELECT * FROM tags;
SELECT _id, name, email, createdAt FROM users;
```

Relational Algebra:
$ "Schemas" , quad "Tags" , quad pi_("_id, name, email, createdAt")("Users") $

== Query 4: Get record by ID

SQL:
```sql
SELECT * FROM schemas WHERE _id = :id;
```

Relational Algebra:
$ sigma_("_id = id")("Schemas") $

== User login

SQL:
```sql
SELECT * FROM users WHERE email = :email;
```

Relational Algebra:
$ sigma_("email = e")("Users") $

== Batch lookup

SQL:
```sql
SELECT * FROM extracted WHERE forDocument IN (:ids);
```

Relational Algebra:
$ sigma_("forDocument" in "ids")("Extracted") $

== Update / insert extracted data

SQL:
```sql
INSERT INTO extracted (forDocument, data) VALUES (:id, :data)
ON CONFLICT (forDocument) DO UPDATE SET data = :data;
```

Relational Algebra: not representable

== Wipe database

SQL:
```sql
DELETE FROM users;
DELETE FROM schemas;
DELETE FROM documents;
DELETE FROM tags;
DELETE FROM extracted;
```

Relational Algebra:
$ "Users" <- emptyset, quad "Schemas" <- emptyset, quad "Documents" <- emptyset $

= Implementation

For our backend, we used ts-rest, which makes it really easy to write type safe contracts that we can enforce within our frontend typescript code. Markdb uses MongoDB to store both documents and schemas. We implemented our frontend using SolidJS and solid start for routing, with a simple one page webapp design. Our main target system was Linux, but we also support other unix based systems like Mac (Darwin) as well. We provide Docker configuration for cross-platform deployment -- you can run the project locally with `docker compose up` (or use Podman if you prefer).

=== DBMS

= Team Member Roles and Contributions

== Team Member 1: Name

// Nick
*Role*:

// Nick
*Contributions*:

// Nick
*What I Learned*:

= Lessons Learned

// Nick
What the team learned beyond the course material.

= Conclusion

Project summary and achievements.

#pagebreak()

= Appendix

#place(top, scope: "parent", float: true,
figure(
```ts
const documentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  schemaId: { type: Schema.Types.ObjectId, ref: "Schema", required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  createdAt: { type: Date, default: Date.now }
});

const extractedSchema = new mongoose.Schema({
  forDocument: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
  createdAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed }
});

const schemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // (salted + hashed)
  createdAt: { type: Date, default: Date.now }
});
```, caption: [Our database's schemas, in Mongoose typescript]
))

#pagebreak()

#set page(columns: 1)

// Nick
= Appendix A: Installation Manual
\
Clone (required)

```sh
git clone https://github.com/404wolf/markdb
cd markdb
```

Docker (recommended)

```sh
docker compose up
```

Nix (dev)

```sh
nix develop
docker compose up -d mongodb redis
bun install
bun run dev
```

// Nick
= Appendix B: User Manual

How to use the application.

// Nick
= Appendix C: Programmer's Manual

== Architecture Overview

markdb follows a not-quite-three-tier architecture:

#figure(
  table(
    columns: 2,
    align: (left, left),
    [*Layer*], [*Technology*],
    [Frontend], [SolidJS + SolidStart + TailwindCSS],
    [Backend], [Fastify + ts-rest],
    [Database], [MongoDB + Mongoose ODM],
    [CLI], [Stricli],
    [Validation], [mdvalidate],
  ),
  caption: [Technology stack by architectural layer]
)

== Backend API

The backend uses ts-rest for type-safe API contracts. Each resource has a contract defining endpoints and a router implementing handlers.

#figure(
  table(
    columns: 3,
    align: (left, left, left),
    [*Resource*], [*Endpoints*], [*File*],
    [Documents], [GET, POST, PUT, DELETE], [`backend/contracts/documents.ts`],
    [Schemas], [GET, POST, PUT, DELETE], [`backend/contracts/schemas.ts`],
    [Users], [GET, POST, PUT, DELETE, LOGIN], [`backend/contracts/users.ts`],
    [Tags], [GET, POST, PUT, DELETE], [`backend/contracts/tags.ts`],
    [Validate], [POST], [`backend/contracts/validate.ts`],
    [Admin], [POST (wipe)], [`backend/contracts/admin.ts`],
  ),
  caption: [API endpoints by resource]
)

== Schema Validation

We rely on the `mdvalidate` library to enforce the Markdown validation grammar specified in appendix B. Each document creation or update triggers the following validation process:

1. Client submits document content + schemaId
2. Backend fetches schema content from database
3. `validate()` writes schema to temp file, invokes `mdv` binary
4. If valid: document saved, extracted JSON stored in `Extracted` collection
5. If invalid: error returned with validation message

== CLI Commands

#figure(
  table(
    columns: 2,
    align: (left, left),
    [*Command*], [*Description*],
    [`validate <schema> <input>`], [Validate markdown against schema],
    [`user login <email> <password>`], [Authenticate and store session],
    [`user get`], [Show current logged-in user],
    [`user clear`], [Clear stored session],
    [`list-schemas`], [List all schemas],
    [`list-documents`], [List all documents],
    [`tag-document <id> --add/--remove`], [Manage document tags],
    [`admin wipe <password>`], [Wipe database (requires],
  ),
  caption: [Available CLI commands]
)

== Database Models

The application consists of five different databases, each of which are mapped to by a different Mongoose model.

- *User data* and authentication with password hasing
- *Markdown schemas* for validation
- *Documents* containing Markdown content linked to a schema and author
- *Tags* for organizing documents (many-to-many with Document)
- *Extracted* validation output (JSON) per document

== Test suite

```sh
bun run test
```

Each route has a corresponding `.test.ts` file testing each CRUD operation.

// Nick
// (use typst grid)
Screenshots and sample data.
