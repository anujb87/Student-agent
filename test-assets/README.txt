=====================================================
  MIS 3250 Test Assets — Study Guide Flow Testing
=====================================================

These files are designed to test the Campus Agent Study Guide feature.
They simulate a realistic college database course (MIS 3250) with 4 lectures
and a professor-supplied practice quiz.

-----------------------------------------------------
FILES IN THIS FOLDER
-----------------------------------------------------

MIS3250_Lecture1_IntroAndERDiagrams.txt
  → Lecture 1 content: database intro, DBMS types, 3-schema architecture,
    ER diagrams (entities, attributes, relationships, cardinality),
    ER-to-relational conversion, EER (specialization/generalization)

MIS3250_Lecture2_RelationalModelAndNormalization.txt
  → Lecture 2 content: relational model, keys (super/candidate/PK/FK),
    integrity constraints, functional dependencies, Armstrong's axioms,
    normalization (1NF, 2NF, 3NF, BCNF) with worked examples

MIS3250_Lecture3_SQL.txt
  → Lecture 3 content: SQL overview (DDL/DML/DCL/TCL), SELECT basics,
    GROUP BY/HAVING, JOIN types, subqueries, views, CTEs, window functions

MIS3250_Lecture4_TransactionsAndIndexing.txt
  → Lecture 4 content: ACID properties, transaction states, concurrency
    problems (dirty read, phantom, non-repeatable), isolation levels,
    locking/2PL, deadlock detection, B+ tree vs hash indexes, query optimization

MIS3250_ProfessorQuiz_Practice.txt
  → Professor-supplied practice quiz covering all 4 lectures:
    multiple choice, short answer, and SQL writing questions with answer key

-----------------------------------------------------
HOW TO TEST THE STUDY GUIDE
-----------------------------------------------------

FLOW 1 — Auto-grouping (primary test)
  1. Open Campus Agent → click "Study Guide" in the sidebar
  2. Select course: MIS 3250 (or any course)
  3. Click the upload zone and select ALL 5 files at once
     (or drag and drop all 5 files together)
  4. Click "Auto-Group with AI"
  5. Expected AI grouping output:
       - Group 1: "Lecture 1: Intro and ER Diagrams" → Lecture1 file
       - Group 2: "Lecture 2: Relational Model & Normalization" → Lecture2 file
       - Group 3: "Lecture 3: SQL" → Lecture3 file
       - Group 4: "Lecture 4: Transactions and Indexing" → Lecture4 file
       - The quiz file may be placed in a separate group or merged with
         relevant lectures — either is acceptable behavior
  6. Confirm the groups → click "Generate Study Guides"
  7. Watch the progress bar as each lecture is processed in sequence

FLOW 2 — Flashcard mode
  After generation completes:
  1. Click "Flashcards" tab in the top mode selector
  2. Select "All Lectures" in the left panel to see all flashcards
     or select a specific lecture to filter
  3. Click the card to flip (front = topic name, back = summary + concepts)
  4. Use "Got it ✓" and "Review Again ↩" to filter the deck
  5. Deck completion screen should appear when all cards are marked

FLOW 3 — Key Concepts mode
  1. Click "Key Concepts" tab
  2. Select a lecture on the left to see its consolidated summary
     (topics, key concepts, and bullet points)
  3. The quiz file content should appear integrated with lecture material

FLOW 4 — Practice Quiz mode
  1. Click "Practice Quiz" tab
  2. Select a lecture or "All Lectures"
  3. AI-generated quiz questions should appear (multiple choice or short answer)
  4. The professor quiz content should be reflected/supplemented in the questions

-----------------------------------------------------
EXPECTED AI BEHAVIOR
-----------------------------------------------------

Because these files have clear lecture numbers in their names
("Lecture1", "Lecture2", etc.), the AI auto-grouping should achieve
near-perfect grouping accuracy.

Rich content within each file gives the AI enough material to generate:
  - 5–8 topics per lecture
  - 3–5 key concepts per topic
  - 4–6 practice quiz questions per lecture
  - Flashcard deck of ~20–32 cards total (across 4 lectures)

The professor quiz file adds extra practice questions that the AI should
incorporate into suggested practice quizzes for relevant lectures.

-----------------------------------------------------
NOTES
-----------------------------------------------------

- These are plain text files (.txt) to keep things simple for testing.
  The Study Guide also supports PDF and image uploads (e.g., actual slides).

- Audio files (.mp3, .wav) can be added to test the "audio metadata only"
  path — the app will show the file name but cannot transcribe audio.

- If auto-grouping places the quiz file in an unexpected group, that is
  reasonable behavior — the AI is making a best-guess from file names.
  You can manually drag files between groups before confirming.
