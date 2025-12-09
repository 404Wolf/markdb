#import "@preview/typslides:1.3.0": *

#show: typslides.with(
  ratio: "16-9",
  theme: "bluey",
  font: "Fira Sans",
  font-size: 22pt,
  link-style: "color",
  show-progress: true,
)

#front-slide(
  title: "Project Title",
  subtitle: [CSDS 341 Database Systems Final Project],
  authors: "Team Member Names",
  info: [Fall 2025 -- Final Project Presentation],
)

#title-slide[
  Background
]

// Wolf
#slide(title: "Project Overview")[
  = MarkDB is a markdown-first database system.

  With MarkDB you can input unstructured input text data, and then apply a schema to enforce a shape on top of the data.
]

#slide(title: "Use Cases")[
  = Some example use cases include:

  - Using LLM output as structured data
  - Extracting data from large collections of Markdown input data
  - A WASIWIG data entry system in Markdown
]

// Wolf
#slide(title: "Prior Art")[
  = There's a lot of companies that try to make unstructured data useful, particularly for LLMs/vector use cases.

  - Companies like Parseur & Unstructured.io
  - NLP libraries and techniques (e.g. Apache OpenNLP)
  - JSON-schema for enforcing structure on unstructured JSON blob data
]

// Nick
#title-slide[
  Project Functionalities
]

// Nick
#slide(title: "Core Features")[
  - *Live automatic validation*
    - markdb gives you a side-by-side view of the document you're editing and the schema it belongs to. The separator will change colors in real time based on whether the document accurately follows the schema or not.
  - *Markdown rendering*
    - The web app also doubles as a rich text editor! You can either view your markdown files as plaintext or have them appear fully rendered with headings, bold, italic, lists, etc.
  - *Tag system*
    - markdb has a fully integrated tagging system. You can either assign tags manually to documents, or bulk-select by schema.
]

// Wolf
#slide(title: "Database Operations")[
  - Key queries supported
  - CRUD operations implemented
  - Any special database features (triggers, stored procedures, etc.)
]

// Nick
#title-slide[
  Technologies Used
]

#slide(title: "Technology Stack")[
  - *Database*: MongoDb
  - *Backend*: Nodejs backend with solid start to serve our frontend and fastify for our backend
  - *Frontend*: SolidJS with Lexical for markdown viewing
  - *CLI*: Using Stricli for our CLI
  - *Other Tools*: (e.g., frameworks, libraries, deployment tools)
]

#title-slide[
  Team Member Roles
]

#slide(title: "Project Contributions")[
  - *Wolf*: Backend and CLI
  - *Nick*: Frontend
]

#title-slide[
  Demo!
]

#slide[
  (Live demo!)

  Features to see:
  - Using the website and getting live validation
  - Saving and renaming documents
  - Viewing the extracted information
]

#title-slide[
  Questions?
]

// Nick
#slide(title: "What we Learned")[

]

#slide[
  Thank you!
]
