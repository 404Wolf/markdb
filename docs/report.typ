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

// Nick
Describe the data your database manages.

== Constraints

Our database stores users, tags, schemas, documents, and the loose actual extracted data from the documents.

Since we use Mongodb for our actual database management system, to enforce schemas we used Mongoose. Mongoose makes it easy to store well structured data in Mongodb.

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

= ER Diagram Design (Optional - Extra Credit)

// Nick
Include your ER diagram here with all entities, attributes, relationships, and their properties.
// #figure(image("./path"), caption: [])

= Functional Dependencies

The biggest functional dependency in our design is that, given a document and its associated schema's contents joined together, the "Extracted" output can always be determined by actually running the validator. Even though this is true, however, we still store the result in the `extractedSchema` collection, because running this validation is relatively expensive.

== Minimal Cover

#figure(
  table(
    columns: 2,
    align: (left, left),
    [*Relation*], [*Minimal Functional Dependencies*],

    [Documents],
    [\_id $arrow.r$ name, schemaId, content, author, tags, createdAt \
       name $arrow.r$ \_id, schemaId, content, author, tags, createdAt],

    [Extracted],
    [\_id $arrow.r$ forDocument, createdAt, data \
    forDocument, createdAt $arrow.r$ \_id, createdAt, data
    ],

    [Schema],
    [\_id $arrow.r$ name, content, createdAt],

    [Tags],
    [\_id $arrow.r$ name, createdAt \
       name $arrow.r$ \_id, createdAt],

    [Users],
    [\_id $arrow.r$ name, email, password, createdAt \
       email $arrow.r$ \_id, name, password, createdAt],
  ),
  caption: [Minimal set of functional dependencies for each relation]
)

= Database Schema

// Wolf
Present your database schema satisfying 3NF (or BCNF).

== Normalization Analysis

// Wolf
Explain why each relation is in 3NF or BCNF.

= Example Queries

// Nick
List and describe the queries your system supports in SQL and Relational Algebra.

= Implementation

// Nick
== System Environment

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
