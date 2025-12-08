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

// Title Page
#align(center)[
  #v(2cm)

  #text(size: 24pt, weight: "bold")[
    Project Title
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

    Name 1

    Name 2
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

Provide well-detailed background information including:

- Overview of the application domain
- Problem statement or motivation
- Target users and use cases
- Existing applications in this space
- How your application differs or improves upon existing solutions
- Real-world relevance and importance

= Data Description

== Overview

Describe the data your database manages.

== Constraints

List all constraints that need to be enforced:

- Domain constraints
- Key constraints
- Entity integrity constraints
- Referential integrity constraints
- Business rules

= ER Diagram Design (Optional - Extra Credit)

Include your ER diagram here with all entities, attributes, relationships, and their properties.

= Functional Dependencies

List all functional dependencies derived from the semantics of your data.

== Minimal Cover
Provide the minimal set of functional dependencies for each relation.

= Database Schema

Present your database schema satisfying 3NF (or BCNF).

== Normalization Analysis

Explain why each relation is in 3NF or BCNF.

= Example Queries

List and describe the queries your system supports in SQL and Relational Algebra.

= Implementation

== System Environment

- Operating System
- DBMS
- Programming Languages
- Frameworks and Libraries

= Team Member Roles and Contributions

== Team Member 1: Name

*Role*:

*Contributions*:

*What I Learned*:

= Lessons Learned

What the team learned beyond the course material.

= Conclusion

Project summary and achievements.

#pagebreak()

= Appendix A: Installation Manual

Installation steps and prerequisites.

= Appendix B: User Manual

How to use the application.

= Appendix C: Programmer's Manual

Code documentation and architecture.

= Appendix D: Sample Data and Output

Screenshots and sample data.
