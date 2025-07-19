import 'dotenv/config'; // Loads variables from .env into process.env
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs/promises";
import path from "path";

// --- Configuration ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL = "text-embedding-004";
const DOCUMENTS_DIR = "documents";
const BATCH_SIZE = 100; // Gemini API limit

// --- Utility: Split array into batches ---
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// --- Main Indexing Function ---
async function buildRAGIndex() {
  console.log("Starting RAG index build...");
  if (!GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY not found in .env file.");
    return;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });

  try {
    const files = await fs.readdir(DOCUMENTS_DIR);
    const mdFiles = files.filter(file => file.endsWith('.md'));

    if (mdFiles.length === 0) {
      console.log("No .md files found in the documents directory.");
      return;
    }

    // Process each markdown file
    for (const file of mdFiles) {
      // Assumes file names like 'knowledge_base_en.md', extracts 'en'
      const lang = file.split('_').pop().split('.')[0]; 
      const docPath = path.join(DOCUMENTS_DIR, file);
      const outputPath = path.join("api", `rag-data_${lang}.json`);

      console.log(`\nProcessing [${file}] for language [${lang}]...`);

      const docText = await fs.readFile(docPath, "utf-8");
      const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
      const chunks = await textSplitter.splitText(docText);
      console.log(`Document split into ${chunks.length} chunks.`);

      console.log("Embedding chunks in batches...");
      const chunkBatches = chunkArray(chunks, BATCH_SIZE);
      let allEmbeddings = [];

      for (let i = 0; i < chunkBatches.length; i++) {
        const batch = chunkBatches[i];
        console.log(`  Embedding batch ${i + 1} of ${chunkBatches.length} (${batch.length} chunks)...`);
        const result = await embeddingModel.batchEmbedContents({
          requests: batch.map((text) => ({ content: { parts: [{ text }] } })),
        });
        allEmbeddings = allEmbeddings.concat(result.embeddings);
      }

      if (allEmbeddings.length !== chunks.length) {
        throw new Error(`Mismatch: got ${allEmbeddings.length} embeddings for ${chunks.length} chunks`);
      }

      const indexedData = chunks.map((chunkText, index) => ({
        id: `${lang}_chunk_${index}`,
        text: chunkText,
        embedding: allEmbeddings[index].values,
      }));

      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(indexedData, null, 2));
      console.log(`✅ RAG index for [${lang}] built successfully! Saved to: ${outputPath}`);
    }

  } catch (error) {
    console.error("An error occurred during indexing:", error.message);
  }
}

buildRAGIndex();
