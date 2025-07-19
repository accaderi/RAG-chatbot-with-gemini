import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// --- START: BILINGUAL DATA STRUCTURES ---

// 1. THE TRANSLATION OBJECT (Source of truth for all display names)
const translations = {
    'HU': {
        'Architecture': 'Építészet', 'Software': 'Szoftver', 'Projects': 'Projektek',
        'Commercial': 'Kereskedelmi', 'Hamad International Airport': 'Hamad Nemzetközi Repülőtér', 'Qatar National Convention Center': 'Katari Nemzeti Kongresszusi Központ', 'Ferrari World Abu Dhabi': 'Ferrari Világ Abu Dhabi', 'Hunguest BÁL Resort': 'Hunguest BÁL Resort', 'Tengiz Crude Export Project': 'Tengiz Crude Export Project', 'Bakony Integrated Social Institution': 'Bakony Integrált Szociális Intézmény', 'Nagykáta City Library': 'Nagykátai Városi Könyvtár', 'Taksony German Nationality Kindergarten': 'Taksonyi Német Nemzetiségi Óvoda', 'Tamási Cultural Center': 'Tamási Kulturális Központ', 'Ady Endre Cultural Center': 'Ady Endre Cultural Center',
        'Highrise': 'Magasépületek', 'Four Seasons Hotel, Bahrain': 'Four Seasons Hotel, Bahrain', 'ADNOC Headquarters': 'ADNOC Székház', 'Burj Khalifa': 'Burdzs Kalifa',
        'Residential': 'Lakóépületek', '28 Flats Residential Development': '28 Lakásos Társasház Fejlesztés',
        'AI': 'MI', 'LlamaParse Test': 'LlamaParse Teszt', 'Email on Autopilot': 'Email Automata Pilóta', 'LightRAG-Chat': 'LightRAG-Chat', 'Youtube Chronicle': 'Youtube Krónika', 'News Webpage': 'Hírportál', 'RAG_64': 'RAG_64', 'Bookmark Genie': 'Könyvjelző Dzsinn', 'visR': 'visR',
        'Archi': 'Építész Szoftver', 'Unreal - Guide for Architects': 'Unreal - Útmutató Építészeknek', 'Unreal - Guide for Archviz': 'Unreal - Útmutató Látványtervezőknek', 'Archicad Python API': 'Archicad Python API', 'Archicad Python Scripts': 'Archicad Python Scriptek',
        'Gaming': 'Játékfejlesztés', 'Pongify': 'Pongify', 'Atomremix': 'Atomremix', 'Apples in Space': 'Alma az űrben',
        'Other': 'Egyéb', 'FTP/SFTP Debian': 'FTP/SFTP Debian', 'Set Up Website': 'Weboldal Beállítása', 'Hosting n8n': 'n8n Hosztolása', 'Chrome Extension, Firebase, Stripe': 'Chrome Bővítmény, Firebase, Stripe', 'Trading BOT': 'Kereskedő BOT', 'Real Estate Analyzer': 'Ingatlan Elemző', 'TSV to Postgress': 'TSV-ből Postgresbe',
    }
};

// 2. THE MENU STRUCTURE (Using canonical English keys that match your frontend script)
const menuStructure = {
    architecture: {
        name: 'Architecture', projects: { sectionId: 'projects', name: 'Projects', categories: {
            'Commercial': { name: 'Commercial', projects: ['Hamad International Airport', 'Qatar National Convention Center', 'Ferrari World Abu Dhabi', 'Hunguest BÁL Resort', 'Tengiz Crude Export Project', 'Bakony Integrated Social Institution', 'Nagykáta City Library', 'Taksony German Nationality Kindergarten', 'Tamási Cultural Center', 'Ady Endre Cultural Center'] },
            'Highrise': { name: 'Highrise', projects: ['Four Seasons Hotel, Bahrain', 'ADNOC Headquarters', 'Burj Khalifa'] },
            'Residential': { name: 'Residential', projects: ['28 Flats Residential Development'] }
        }}
    },
    software: {
        name: 'Software', projects: { sectionId: 'projects', name: 'Projects', categories: {
            'AI': { name: 'AI', projects: ['LlamaParse Test', 'Email on Autopilot', 'LightRAG-Chat', 'Youtube Chronicle', 'News Webpage', 'RAG_64', 'Bookmark Genie', 'visR'] },
            'Archi': { name: 'Archi', projects: ['Unreal - Guide for Architects', 'Unreal - Guide for Archviz', 'Archicad Python API', 'Archicad Python Scripts'] },
            'Gaming': { name: 'Gaming', projects: ['Pongify', 'Atomremix', 'Apples in Space'] },
            'Other': { name: 'Other', projects: ['FTP/SFTP Debian', 'Set Up Website', 'Hosting n8n', 'Chrome Extension, Firebase, Stripe', 'Trading BOT', 'Real Estate Analyzer', 'TSV to Postgress'] }
        }}
    }
};

// 3. THE PROJECT MAP - This links simplified keywords to the full, canonical project data.
const projectMap = {};
for (const sectionKey in menuStructure) {
  const section = menuStructure[sectionKey];
  if (section.projects && section.projects.categories) {
    for (const categoryKey in section.projects.categories) {
      for (const projectName of section.projects.categories[categoryKey].projects) {
        let simplifiedKey;
        // Option one - Automatic with exceptions for specific keys
        //                 const words = projectName.split(' ');
        //                 // A more robust, specific keys
        //                 if (projectName === 'Hunguest BÁL Resort') {
          //                     simplifiedKey = 'bál resort';}
          //                 // end of specific keys
          //                 if (sectionKey === 'software') {
            //                     simplifiedKey = words.slice(0, 2).join(' ').toLowerCase();
            //                 } else {
              //                     simplifiedKey = words[0].replace(',', '').toLowerCase();
              //                 }
              
              //                 projectMap[simplifiedKey] = {
                //                     name: projectName,
                //                     sectionKey: sectionKey,
                //                     sectionId: section.projects.sectionId,
                //                     category: categoryKey
                //                 };
                //             }
                //         }
                //     }
                // }

              // Option two - Manual mapping for all the keys
              const lowerCaseProjectName = projectName.toLowerCase();

              // Create explicit, unique keys for each project
              switch (projectName) {
                  // Architecture
                  case 'Hamad International Airport': simplifiedKey = 'hamad'; break;
                  case 'Qatar National Convention Center': simplifiedKey = 'qatar national convention'; break;
                  case 'Ferrari World Abu Dhabi': simplifiedKey = 'ferrari world'; break;
                  case 'Hunguest BÁL Resort': simplifiedKey = 'bál resort'; break;
                  case 'Tengiz Crude Export Project': simplifiedKey = 'tengiz'; break;
                  case 'Bakony Integrated Social Institution': simplifiedKey = 'bakony'; break;
                  case 'Nagykáta City Library': simplifiedKey = 'nagykáta'; break;
                  case 'Taksony German Nationality Kindergarten': simplifiedKey = 'taksony'; break;
                  case 'Tamási Cultural Center': simplifiedKey = 'tamási'; break;
                  case 'Ady Endre Cultural Center': simplifiedKey = 'ady endre'; break;
                  case 'Four Seasons Hotel, Bahrain': simplifiedKey = 'four seasons'; break;
                  case 'ADNOC Headquarters': simplifiedKey = 'adnoc'; break;
                  case 'Burj Khalifa': simplifiedKey = 'burj khalifa'; break;
                  case '28 Flats Residential Development': simplifiedKey = '28 flats'; break;
                  
                  // Software
                  case 'LlamaParse Test': simplifiedKey = 'llamaparse'; break;
                  case 'Email on Autopilot': simplifiedKey = 'email on autopilot'; break;
                  case 'LightRAG-Chat': simplifiedKey = 'lightrag'; break;
                  case 'Youtube Chronicle': simplifiedKey = 'youtube chronicle'; break;
                  case 'News Webpage': simplifiedKey = 'news webpage'; break;
                  case 'RAG_64': simplifiedKey = 'rag_64'; break;
                  case 'Bookmark Genie': simplifiedKey = 'bookmark genie'; break;
                  case 'visR': simplifiedKey = 'visr'; break;
                  case 'Unreal - Guide for Architects': simplifiedKey = 'unreal architects'; break;
                  case 'Unreal - Guide for Archviz': simplifiedKey = 'unreal archviz'; break;
                  case 'Archicad Python API': simplifiedKey = 'archicad api'; break;
                  case 'Archicad Python Scripts': simplifiedKey = 'archicad scripts'; break;
                  case 'Pongify': simplifiedKey = 'pongify'; break;
                  case 'Atomremix': simplifiedKey = 'atomremix'; break;
                  case 'Apples in Space': simplifiedKey = 'apples in space'; break;
                  case 'FTP/SFTP Debian': simplifiedKey = 'ftp/sftp'; break;
                  case 'Set Up Website': simplifiedKey = 'set up website'; break;
                  case 'Hosting n8n': simplifiedKey = 'hosting n8n'; break;
                  case 'Chrome Extension, Firebase, Stripe': simplifiedKey = 'chrome extension'; break;
                  case 'Trading BOT': simplifiedKey = 'trading bot'; break;
                  case 'Real Estate Analyzer': simplifiedKey = 'real estate analyzer'; break;
                  case 'TSV to Postgress': simplifiedKey = 'tsv to postgress'; break;
                  
                  default:
                      // Fallback for any new projects you might add later
                      simplifiedKey = lowerCaseProjectName.split(' ').slice(0, 2).join(' ');
              }
              
              projectMap[simplifiedKey] = {
                  name: projectName,
                  sectionKey: sectionKey,
                  sectionId: section.projects.sectionId,
                  category: categoryKey
              };
          }
      }
  }
}

// 4. THE HELPER FUNCTIONS
function buildTranslatedPath(projectData, lang) {
    const { sectionKey, category: categoryKey, name: canonicalName } = projectData;
    const section = menuStructure[sectionKey];
    const category = section.projects.categories[categoryKey];

    if (lang.toUpperCase() === 'HU' && translations.HU) {
        const huTranslations = translations.HU;
        const sectionName = huTranslations[section.name] || section.name;
        const projectsWord = huTranslations[section.projects.name] || section.projects.name;
        const categoryName = huTranslations[category.name] || category.name;
        const projectName = huTranslations[canonicalName] || canonicalName;
        return `${sectionName} > ${projectsWord} > ${categoryName} > ${projectName}`;
    } else {
        return `${section.name} > ${section.projects.name} > ${category.name} > ${canonicalName}`;
    }
}

function findProjectData(responseText) {
    const lowerCaseResponse = responseText.toLowerCase();
    let foundProjects = [];

    for (const simplifiedKey in projectMap) {
        if (lowerCaseResponse.includes(simplifiedKey)) {
            // Avoid duplicate additions if multiple simplified keys point to the same project
            if (!foundProjects.some(p => p.name === projectMap[simplifiedKey].name)) {
                foundProjects.push(projectMap[simplifiedKey]);
            }
        }
    }

    if (foundProjects.length === 0) {
        return null;
    }

    return {
        count: foundProjects.length,
        primaryProject: foundProjects[0],
        sections: new Set(foundProjects.map(p => p.sectionKey))
    };
}
// --- END: BILINGUAL DATA STRUCTURES ---
async function loadRagData() {
  try {
    const ragDataPath = path.join(process.cwd(), 'api', `rag-data_en.json`);
    const data = await fs.readFile(ragDataPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`ERROR: Could not load the primary English RAG data.`, error);
    return null;
  }
}

async function simplifyQueryToEnglish(query, genAI) {
    try {
        console.log(`Simplifying Hungarian query to an English search query: "${query}"`);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `Your task is to rephrase the following Hungarian user question into a very simple, keyword-focused English search query. Do not use conversational language. Focus on the essential nouns and concepts.

        Here are some examples:
        User Question: "mik az elérhetőségeik?"
        Search Query: "contact information"
        User Question: "hány közel keleti projektje volt az accaderinek?"
        Search Query: "how many Middle East projects"
        User Question: "milyen szoftveres megoldásokat kínálnak?"
        Search Query: "software solutions services"
        User Question: "mutasd a Burj Khalifa projektet"
        Search Query: "Burj Khalifa project"
        ---
        Now, perform the task for the following question. Output ONLY the simplified English search query.
        User Question: "${query}"
        Search Query:`;

        const result = await model.generateContent(prompt);
        const simplifiedQuery = result.response.text().trim();
        console.log(`Simplified English search query: "${simplifiedQuery}"`);
        return simplifiedQuery;
    } catch (error) {
        console.error("Error during query simplification:", error);
        return query;
    }
}

// --- CONVERSATION-AWARE QUERY REWRITING FUNCTION ---
async function rewriteQueryForRetrieval(history, followUpQuery, genAI) {
    // If there's no history, there's nothing to rewrite.
    if (!history || history.length === 0) {
        return followUpQuery;
    }

    try {
        console.log("Rewriting query based on history...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const historyString = history.map(turn => `${turn.role}: ${turn.content}`).join('\n');

        const prompt = `Based on the provided "Conversation History", rewrite the "Follow-up Question" to be a standalone question that contains all the necessary context.

        **Example:**
        Conversation History:
        user: Tell me about the Burj Khalifa project.
        assistant: We were involved in the Burj Khalifa project, where our role was to manage the Armani Interior package.
        Follow-up Question: Tell me more about it.
        Standalone Question: Tell me more about the Burj Khalifa project.

        ---

        **Conversation History:**
        ${historyString}
        **Follow-up Question:**
        ${followUpQuery}
        **Standalone Question:**`;

        const result = await model.generateContent(prompt);
        const rewrittenQuery = result.response.text().trim();
        console.log(`Rewritten query for retrieval: "${rewrittenQuery}"`);
        return rewrittenQuery;
    } catch (error) {
        console.error("Error during query rewriting, falling back to original query.", error);
        return followUpQuery; // Fallback if rewriting fails
    }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const LOGGING_URL = process.env.LOGGING_URL;
const EMBEDDING_MODEL = "text-embedding-004";
const GENERATIVE_MODEL = "gemini-1.5-flash-latest";

const PROJECT_HINTS = {
    en: {
        prefix_for_one: "You can find this project here: ",
        architecture_button: "View our Architecture Projects",
        software_button: "View our Software Projects",
        mixed: "You can find our projects in the Architecture and Software sections of our website.",
        archi_software_button: "View our Architectural Software Projects"
    },
    hu: {
        prefix_for_one: "Ezt a projektet itt találja: ",
        architecture_button: "Építészeti Projektjeink Megtekintése",
        software_button: "Szoftveres Projektjeink Megtekintése",
        mixed: "Projektjeinket a weboldalunk Építészet és Szoftver szekcióiban találja meg.",
        archi_software_button: "Építészeti Szoftver Projektjeink Megtekintése"
    }
};

const NAME_VARIANTS = {
    en: "Attila Déri",
    hu: "Déri Attila"
};

const FALLBACK_RESPONSES = {
  en: {
    off_topic: "I am an assistant for Accaderi, and I can only answer questions related to our company, services, and projects. How can I help you with that?",
    too_specific: "That's a very detailed question! For inquiries like that, it's best to get in touch with us directly so we can provide the most accurate information. You can reach us via the contact form on our website."
  },
  hu: {
    off_topic: "Elnézést, de én az Accaderi asszisztense vagyok, így csak a cégünkkel, szolgáltatásainkkal és projektjeinkkel kapcsolatos kérdésekre tudok válaszolni. Miben segíthetek ezzel kapcsolatban?",
    too_specific: "Ez egy nagyon specifikus kérdés! Az ehhez hasonló részletes megkeresésekkel kapcsolatban a legjobb, ha közvetlenül felveszi velünk a kapcsolatot, hogy a legpontosabb tájékoztatást adhassuk. A weboldalunkon található kapcsolatfelvételi űrlapon keresztül érhet el minket."
  }
};

function logConversation(data) {
  if (!LOGGING_URL) return;
  fetch(LOGGING_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(error => console.error("Failed to log conversation:", error));
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

async function findRelevantChunks(query, genAI, ragData, topK = 8) {
  const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await embeddingModel.embedContent(query);
  const queryEmbedding = result.embedding.values;
  const similarities = ragData.map(chunk => {
    const chunkEmbedding = chunk.embedding;
    const score = dotProduct(queryEmbedding, chunkEmbedding);
    return { score, chunk };
  });
  similarities.sort((a, b) => b.score - a.score);
  return similarities.slice(0, topK).map(s => s.chunk.text);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { return res.status(200).end(); }
  if (req.method !== 'POST') { return res.status(405).json({ error: 'Method Not Allowed' }); }

  try {
    const { query, lang = 'en', history = [] } = req.body;
    if (!query) { return res.status(400).json({ error: 'Query is required' }); }
    
    const currentLang = lang.toLowerCase();

    // --- SHORT QUERY FALLBACK RULE (NO LLM USED) ---
    if (query.trim().length <= 3) {
        console.log(`Query "${query}" is too short. Responding with off_topic fallback without LLM call.`);
        const responseText = FALLBACK_RESPONSES[currentLang].off_topic || FALLBACK_RESPONSES.en.off_topic;
        
        // Log this specific event for analytics
        logConversation({ lang, query, response: responseText, type: 'short_query_fallback' });
        
        // Immediately return the response and stop execution
        return res.status(200).json({ response: responseText });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
     // --- INTELLIGENT RETRIEVAL PIPELINE ---
    // 1. Rewrite the user's query to be standalone, based on history.
    const standaloneQuery = await rewriteQueryForRetrieval(history, query, genAI);

    // 2. Simplify the standalone query to English keywords for the best search.
    let searchQuery = standaloneQuery;

    if (currentLang === 'hu') {
      searchQuery = await simplifyQueryToEnglish(standaloneQuery, genAI);
    }

    const ragData = await loadRagData();
    if (!ragData) {
        const errorMsg = `The primary English knowledge base is missing on the server.`;
        return res.status(500).json({ error: errorMsg });
    }
    
    const contextChunks = await findRelevantChunks(searchQuery, genAI, ragData);
    const context = contextChunks.join("\n\n---\n\n");
    
    let augmentedPrompt;
    // 1. Select the correct name format for the current language.
    const correctNameForLang = NAME_VARIANTS[currentLang] || NAME_VARIANTS.en;
    const formattedHistory = history.map(turn => `${turn.role}: ${turn.content}`).join('\n');

    const personaRules = `
    **Your Persona & Rules:**
    1.  You are a knowledgeable and friendly team member of Accaderi.
    2.  You MUST speak in the first-person plural (e.g., 'we were involved in').
    3.  Your knowledge is internal. You MUST NEVER mention 'the document' or 'the context'.
    4.  **Use the "Conversation History" to understand follow-up questions (e.g., "tell me more about that one").**
    5.  When asked for a quantity ('how many', 'hány') or a list, you MUST synthesize the information and provide a definitive number.
    6.  **CRITICAL PROJECT NAME RULE:** When your answer mentions a specific project, you MUST use its full, canonical name exactly as it appears in the provided context (e.g., "ADNOC Headquarters", not "ADNOC tower").
    7.  **Critical Project Role Rule:** When asked about a specific project, find the "Designation:" in the context to frame your response accurately (e.g., "We were involved as...").
    8.  **Software Project Rule:** Frame software projects as examples of our capabilities (e.g., "We developed that tool to demonstrate...").
    9.  **Attila Déri Rule:** If the user asks about "Attila Déri" or "Déri Attila", you must refer to him in the third person as the founder of Accaderi, using the name "${correctNameForLang}" in your response. Never respond with "I am Attila."
    10. **Synthesis Rule:** When asked a general question about "services" or "contact", you MUST check the context for information on BOTH Architecture and Software and provide a comprehensive, combined answer if available.
    `;

    const fallbackLogic = `
    **Fallback Logic:**
    If the context does not contain the answer, you must choose a fallback response.
    1.  If the question is completely unrelated (weather, politics), use: "${FALLBACK_RESPONSES[currentLang].off_topic}"
    2.  If the question is related but too specific, use: "${FALLBACK_RESPONSES[currentLang].too_specific}"
    `;

    if (currentLang === 'hu') {
      augmentedPrompt = `You are an expert multilingual assistant whose only job is to provide a final, clean response in Hungarian.
      **Your Process:**
      1.  Analyze the user's "Original Question" and the provided "Context".
      2.  Internally formulate an answer in English that strictly follows all rules in the "Persona & Rules" and "Fallback Logic" sections.
      3.  Translate the complete English result into Hungarian.
      **CRITICAL OUTPUT RULE: Your final output MUST ONLY contain the final Hungarian translation. Do not include any headers, preambles, notes, or the original English version. Your response should begin directly with the first word of the Hungarian answer.**
      ---
      ${personaRules}
      ${fallbackLogic}
      ---
      **Conversation History:**
      ${formattedHistory}
      ---
      **Context:**
      ${context}
      ---
      **Original Question (in Hungarian):**
      ${query}
      `;
    } else {
      augmentedPrompt = `You are a helpful and friendly assistant for Accaderi.
      **Your Main Task:**
      Answer the user's question based *only* on the context provided below.
      ---
      ${personaRules}
      ${fallbackLogic}
      ---
       **Conversation History:**
      ${formattedHistory}
      ---
      **Context:**
      ${context}
      ---
      User's Question:
      ${query}
      `;
    }

    const model = genAI.getGenerativeModel({ model: GENERATIVE_MODEL });
    let result;
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
        try {
            result = await model.generateContent(augmentedPrompt);
            break; 
        } catch (error) {
            if (error.status === 503 && i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, (i + 1) * 1000));
            } else {
                throw error;
            }
        }
    }

    let text = result.response.text();
    if (typeof text !== 'string' || text.trim() === '') {
        text = FALLBACK_RESPONSES[currentLang].too_specific;
    }

    // --- FINAL NAVIGATION LOGIC ---
    let finalText = text;
    const lowerCaseText = text.toLowerCase();
    const hintTexts = PROJECT_HINTS[currentLang] || PROJECT_HINTS.en;
    let navLinkHTML = '';
    
    if (lowerCaseText.includes('unreal')) {
      console.log("Found 'Unreal' in response. Applying special navigation logic.");
      
      // --- YOUR DESIGN IMPLEMENTED ---
      const sectionKey = 'software';
      const categoryKey = 'Archi';
      
      // 1. Build the translated path for the button's text, stopping at the category.
      let pathText;
      const section = menuStructure[sectionKey];
      const category = section.projects.categories[categoryKey];
      if (currentLang === 'hu' && translations.HU) {
        pathText = `${translations.HU[section.name] || section.name} > ${translations.HU[section.projects.name] || section.projects.name} > ${translations.HU[category.name] || category.name}`;
      } else {
        pathText = `${section.name} > ${section.projects.name} > ${category.name}`;
      }
      
      // 2. Get the special prefix text for the span.
      const prefixText = hintTexts.archi_software_button;
      
      // 3. Build the final HTML with the correct text and data attributes.
      // The data-project attribute is intentionally left empty.
      navLinkHTML = `<div class="chatbot-nav-container"><span>${prefixText}</span><button class="chatbot-nav-link" data-section-key="${sectionKey}" data-section-id="projects" data-category="${categoryKey}" data-project="">${pathText}</button></div>`;
    } else {
        const projectData = findProjectData(text);
        if (projectData) {
       
          if (projectData.count === 1) {
              const p = projectData.primaryProject;
              const pathText = buildTranslatedPath(p, currentLang);
              navLinkHTML = `<div class="chatbot-nav-container"><span>${hintTexts.prefix_for_one}</span><button class="chatbot-nav-link" data-section-key="${p.sectionKey}" data-section-id="${p.sectionId}" data-category="${p.category}" data-project="${p.name}">${pathText}</button></div>`;
          } else if (projectData.count > 1) {
              if (projectData.sections.size === 1) {
                  const sectionKey = projectData.sections.values().next().value;
                  const buttonText = hintTexts[`${sectionKey}_button`];
                  const sectionId = projectData.primaryProject.sectionId;
                  navLinkHTML = `<div class="chatbot-nav-container"><button class="chatbot-nav-link" data-section-key="${sectionKey}" data-section-id="${sectionId}" data-category="" data-project="">${buttonText}</button></div>`;
              } else {
                  navLinkHTML = `<div class="chatbot-nav-container"><span>${hintTexts.mixed}</span></div>`;
              }
          }
        }
    }
    finalText += navLinkHTML;
    
    // logConversation({ lang, query, response: finalText, type: 'rag' });
    res.status(200).json({ response: finalText });

  } catch (error) {
    console.error("Fatal error in chat handler:", error);
    const errorMessage = error.message || 'An unknown error occurred on the server.';
    logConversation({ query: req.body.query, lang: req.body.lang, error: errorMessage });
    if (error.status === 503) {
      res.status(503).json({ error: 'The AI model is currently overloaded. Please try again in a moment.' });
    } else {
      res.status(500).json({ error: 'Failed to process chat request due to a server error.' });
    }
  }
}

