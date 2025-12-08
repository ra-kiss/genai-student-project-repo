# AI Assistant for CS Students

## Overview

This project introduces an AI-powered note-taking tool designed to help computer science students learn faster and study more effectively.
The app enhances the user's notes using generative AI. It summarizes material, expands brief points, explains complex technical concepts, and automatically generates flashcards.
Built with an LLM and Retrieval-Augmented Generation (RAG) pipeline, sentence embeddings, and the OpenAI API, it delivers accurate, context-aware assistance tailored to CS coursework. Whether you're reviewing lectures, learning algorithms, or preparing for exams, the AI Assistant makes understanding and organizing information easier than ever.

## Setup Instructions

1. ### Install Node.js 22 or newer
2. ### Clone the repository
    * `git clone https://github.com/ra-kiss/genai-student-project-repo.git` 
    * `cd genai-student-project-repo`
3. ### Install the necessary packages
    * `npm install`
4. ### Ensure your OpenAI API Key is loaded as an environment variable
    - Create a file `.env.local` in the project folder, and add your API key inside as seen below:
    - `NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-...`
5. ### Run the project, and view it on `http://localhost:3000`
    - `npm run dev`

**Note:** The application requires an OpenAI API key, which is not provided here.

&copy; Robert-Alexandru Kiss & Angelica Rings, 2025
