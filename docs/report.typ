#set page(
  paper: "us-letter",
  margin: (x: 1in, y: 1in),
  numbering: "1",
  columns: 2
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
  #v(2cm)

  #text(size: 24pt, weight: "bold")[
    MarkDB
  ]

  #v(1cm)

  #text(size: 16pt)[
    CSDS 341: Introduction to Database Systems
  ]

  #v(0.5cm)

  #text(size: 14pt)[
    Fall 2025 Final Project Report
  ]

  #v(2cm)

  #text(size: 12pt)[
    Team Members:

    Name 1 Wolf Mermelstein
    Name 2: Nick Mahdavi
  ]

  #v(2cm)

  #text(size: 12pt)[
    December 8, 2025
  ]
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

#figure(
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
)

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

// Nick
List and describe the queries your system supports in SQL and Relational Algebra.

= Implementation



== System Environment

A more comprehensive account of each of these components may be found in appendix C.

=== Operating System

We provide Docker configuration for cross-platform deployment. For more information, see appendix C.

=== DBMS

markdb uses MongoDB to store both documents and schemas.

=== Languages

- Operating System
- DBMS
- Programming Languages
- Frameworks and Libraries

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

// Nick
= Appendix A: Installation Manual

Installation steps and prerequisites.

// Nick
= Appendix B: User Manual

How to use the application.

// Nick
= Appendix C: Programmer's Manual

Code documentation and architecture.

// Nick
= Appendix D: Sample Data and Output

// Nick
// (use typst grid)
Screenshots and sample data.
