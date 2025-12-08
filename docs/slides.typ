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
  info: [Fall 2025 — Final Project Presentation],
)

#title-slide[
  Background
]

#slide(title: "Project Overview")[
  - Brief description of your application and its purpose
  - Problem statement or motivation
  - Target users or use case
  - Why this project matters
]

#slide(title: "Existing Solutions")[
  - Overview of existing applications or approaches
  - Limitations of current solutions
  - How your project improves upon or differs from existing work
]

#title-slide[
  Project Functionalities
]

#slide(title: "Core Features")[
  - Feature 1: Live automatic validation
  - Feature 2: Description
  - Feature 3: Description
  - Feature 4: Description
]

#slide(title: "Database Operations")[
  - Key queries supported
  - CRUD operations implemented
  - Any special database features (triggers, stored procedures, etc.)
]

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

#slide[
  Thank you!
]
