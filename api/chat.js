import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";
import path from "path";

// --- START: BILINGUAL DATA STRUCTURES ---
const translations = {
    'HU': {
        'Architecture': 'Építészet', 'Software': 'Szoftver', 'Projects': 'Projektek',
        'Commercial': 'Kereskedelmi', 'Hamad International Airport': 'Hamad Nemzetközi Repülőtér', 'Qatar National Convention Center': 'Katari Nemzeti Kongresszusi Központ', 'Ferrari World Abu Dhabi': 'Ferrari Világ Abu Dhabi', 'Hunguest BÁL Resort': 'Hunguest BÁL Resort', 'Tengiz Crude Export Project': 'Tengiz Crude Export Project', 'Bakony Integrated Social Institution': 'Bakony Integrált Szociális Intézmény', 'Nagykáta City Library': 'Nagykátai Városi Könyvtár', 'Taksony German Nationality Kindergarten': 'Taksonyi Német Nemzetiségi Óvoda', 'Tamási Cultural Center': 'Tamási Kulturális Központ', 'Ady Endre Cultural Center': 'Ady Endre Cultural Center',
        'Highrise': 'Magasépületek', 'Four Seasons Hotel, Bahrain': 'Four Seasons Hotel, Bahrain', 'ADNOC Headquarters': 'ADNOC Székház', 'Burj Khalifa': 'Burdzs Kalifa',
        'Residential': 'Lakóépületek', '28 Flats Residential Development': '28 Lakásos Társasház Fejlesztés',
        'AI': 'MI', 'LlamaParse Test': 'LlamaParse Teszt', 'Email on Autopilot': 'Email Automata Pilóta', 'LightRAG-Chat': 'LightRAG-Chat', 'Youtube Chronicle': 'Youtube Krónika', 'News Webpage': 'Hírportál', 'RAG_64': 'RAG_64', 'Bookmark Genie': 'Könyvjelző Dzsinn', 'visR': 'visR', 'RAG Chatbot with Gemini': 'RAG Chatbot Geminivel',
        'Archi': 'Építész Szoftver', 'Unreal - Guide for Architects': 'Unreal - Útmutató Építészeknek', 'Unreal - Guide for Archviz': 'Unreal - Útmutató Látványtervezőknek', 'Archicad Python API': 'Archicad Python API', 'Archicad Python Scripts': 'Archicad Python Scriptek',
        'Gaming': 'Játékfejlesztés', 'Pongify': 'Pongify', 'Atomremix': 'Atomremix', 'Apples in Space': 'Alma az űrben',
        'Other': 'Egyéb', 'FTP/SFTP Debian': 'FTP/SFTP Debian', 'Set Up Website': 'Weboldal Beállítása', 'Hosting n8n': 'n8n Hosztolása', 'Chrome Extension, Firebase, Stripe': 'Chrome Bővítmény, Firebase, Stripe', 'Trading BOT': 'Kereskedő BOT', 'Real Estate Analyzer': 'Ingatlan Elemző', 'TSV to Postgress': 'TSV-ből Postgresbe',
    }
};
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
            'AI': { name: 'AI', projects: ['LlamaParse Test', 'Email on Autopilot', 'LightRAG-Chat', 'Youtube Chronicle', 'News Webpage', 'RAG_64', 'Bookmark Genie', 'visR', 'RAG Chatbot with Gemini'] },
            'Archi': { name: 'Archi', projects: ['Unreal - Guide for Architects', 'Unreal - Guide for Archviz', 'Archicad Python API', 'Archicad Python Scripts'] },
            'Gaming': { name: 'Gaming', projects: ['Pongify', 'Atomremix', 'Apples in Space'] },
            'Other': { name: 'Other', projects: ['FTP/SFTP Debian', 'Set Up Website', 'Hosting n8n', 'Chrome Extension, Firebase, Stripe', 'Trading BOT', 'Real Estate Analyzer', 'TSV to Postgress'] }
        }}
    }
};
const projectMap = {};
for (const sectionKey in menuStructure) {
    const section = menuStructure[sectionKey];
    if (section.projects && section.projects.categories) {
        for (const categoryKey in section.projects.categories) {
            for (const projectName of section.projects.categories[categoryKey].projects) {
                const words = projectName.split(' ');
                let simplifiedKey;
                if (projectName === 'Hunguest BÁL Resort') {
                    simplifiedKey = 'bál resort';
                } else if (projectName === 'Unreal - Guide for Architects') {
                    simplifiedKey = 'unreal architects';
                } else if (projectName === 'Unreal - Guide for Archviz') {
                    simplifiedKey = 'unreal archviz';
                }else if (sectionKey === 'software') {
                    simplifiedKey = words.slice(0, 2).join(' ').toLowerCase();
                } else {
                    simplifiedKey = words[0].replace(',', '').toLowerCase();
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
// The function now takes the retrieved CONTEXT as its input, not the final response.
function findProjectData(originalQuery, searchQuery, responseText) {
    // const lowerCaseContext = context.toLowerCase();
    // let foundProjects = [];

    // // Loop through our simplified keywords to find all possible matches in the context
    // for (const simplifiedKey in projectMap) {
    //     if (lowerCaseContext.includes(simplifiedKey)) {
    //         if (!foundProjects.some(p => p.name === projectMap[simplifiedKey].name)) {
    //             foundProjects.push(projectMap[simplifiedKey]);
    //         }
    //     }
    // }
   const combinedQuery = (originalQuery.toLowerCase() + ' ' + searchQuery.toLowerCase());
   console.log(`Combined query for project search: "${combinedQuery}"`);
    
    // STEP 1: High-priority check for the special "Unreal" case, based ONLY on the user's query.
    const mentionsUnreal = combinedQuery.includes('unreal');
    
    // --- Including all specified keywords ---
    const mentionsArchitects = combinedQuery.includes('architect') || combinedQuery.includes('architects') || combinedQuery.includes('építész') || combinedQuery.includes('építészeknek');
    const mentionsArchviz = combinedQuery.includes('archviz');

    if (mentionsUnreal) {
        // Find the full project data objects for our Unreal projects
        const unrealArchitectsProject = Object.values(projectMap).find(p => p.name === 'Unreal - Guide for Architects');
        const unrealArchvizProject = Object.values(projectMap).find(p => p.name === 'Unreal - Guide for Archviz');

        if (mentionsArchitects && mentionsArchviz) {
            // Case 1: The query is ambiguous, mentions both. Return both projects.
            console.log("Disambiguation (Query): User mentioned BOTH Unreal projects. Returning multiple.");
            const foundProjects = [unrealArchitectsProject, unrealArchvizProject].filter(Boolean);
            if (foundProjects.length > 0) {
                 return { count: foundProjects.length, primaryProject: foundProjects[0], sections: new Set(foundProjects.map(p => p.sectionKey)) };
            }
        } else if (mentionsArchitects) {
            // Case 2: Query is specific to the Architects guide. Return only that one.
            console.log("Disambiguation (Query): User query points to 'Unreal for Architects'.");
            if (unrealArchitectsProject) {
                return { count: 1, primaryProject: unrealArchitectsProject, sections: new Set([unrealArchitectsProject.sectionKey]) };
            }
        } else if (mentionsArchviz) {
            // Case 3: Query is specific to the Archviz guide. Return only that one.
            console.log("Disambiguation (Query): User query points to 'Unreal for Archviz'.");
            if (unrealArchvizProject) {
                return { count: 1, primaryProject: unrealArchvizProject, sections: new Set([unrealArchvizProject.sectionKey]) };
            }
        }
    }
    // --- END OF HIGH-PRIORITY UNREAL CHECK ---


    // --- GENERAL PROJECT SEARCH LOGIC (IF UNREAL LOGIC DIDN'T RETURN) ---
    const search = (textToSearch) => {
        const lowerCaseText = textToSearch.toLowerCase();
        let projects = [];
        for (const simplifiedKey in projectMap) {
            if (lowerCaseText.includes(simplifiedKey)) {
                if (!projects.some(p => p.name === projectMap[simplifiedKey].name)) {
                    projects.push(projectMap[simplifiedKey]);
                }
            }
        }
        return projects;
    };

    // Stage 1: Search the user's query first.
    let foundProjects = search(combinedQuery);
    console.log(`Stage 1 (Query Search) found ${foundProjects.length} project(s).`);

    if (foundProjects.length === 1) {
        console.log(`Definitive match found from user query: ${foundProjects[0].name}`);
        return { count: 1, primaryProject: foundProjects[0], sections: new Set([foundProjects[0].sectionKey]) };
    }

    // Stage 2: If the query was ambiguous, fall back to the LLM's response.
    console.log("Query was not definitive. Falling back to searching LLM response.");
    foundProjects = search(responseText);
    console.log(`Stage 2 (Response Search) found ${foundProjects.length} project(s).`);

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


// --- ADVANCED HELPER FUNCTIONS ---
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `Rephrase the Hungarian question into a simple, keyword-focused English search query. Examples: "mik az elérhetőségeik?" -> "contact information", "hány közel keleti projektje volt?" -> "how many Middle East projects". Now, process: "${query}" ->`;
        const result = await model.generateContent(prompt);
        const simplifiedQuery = result.response.text().trim();
        return simplifiedQuery;
    } catch (error) {
        console.error("Error simplifying query:", error);
        return query;
    }
}

async function rewriteQueryForRetrieval(history, followUpQuery, genAI) {
    if (!history || history.length === 0) return followUpQuery;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const historyString = history.map(turn => `${turn.role}: ${turn.content}`).join('\n');
            const prompt = `Based on the "Conversation History", rewrite the "Follow-up Question" to be a standalone question.
    **IMPORTANT RULE:** If the "Follow-up Question" already seems like a clear, standalone query (e.g., it's just a project name like "Burj Khalifa" or "Pongify"), you MUST return it exactly as it is, without any changes.
    Otherwise, combine it with the history to add context.

    Example 1:
    History: user: Tell me about your architecture work. assistant: We worked on many projects...
    Follow-up Question: tell me more about the highrise ones
    Standalone Question: Tell me more about the highrise architecture projects

    Example 2:
    History: user: Tell me about your architecture work. assistant: We worked on many projects...
    Follow-up Question: Pongify
    Standalone Question: Pongify
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
    console.error("Error rewriting query:", error);
    return followUpQuery;
}
}

async function isQueryAskingForSpecificDetails(query, history, genAI) {
    if (!history || history.length === 0) return false;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const historyString = history.map(turn => `${turn.role}: ${turn.content}`).join('\n');
        const prompt = `Is the "Current User Query" a direct follow-up asking for MORE information about the main subject of the "Conversation History"? Answer only "yes" or "no".
        History:
        ${historyString}
        Current Query: "${query}"`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim().toLowerCase() === 'yes';
    } catch (error) {
        console.error("Error in detail detection:", error);
        return false;
    }
}

async function extractTopicsFromConversation(history, genAI) {
    if (!history || history.length === 0) return [];
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const historyText = history.slice(-4).map(turn => `${turn.role}: ${turn.content}`).join('\n');
        const prompt = `Extract the main project names or subjects from this conversation as a comma-separated list. Conversation: ${historyText} Topics:`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim().split(',').map(topic => topic.trim()).filter(Boolean);
    } catch (error) {
        console.error("Error extracting topics:", error);
        return [];
    }
}

async function expandContextForFollowup(history, ragData, genAI, query) {
    const isFollowUp = await isQueryAskingForSpecificDetails(query, history, genAI);
    if (!isFollowUp) return ragData;
    const conversationTopics = await extractTopicsFromConversation(history, genAI);
    if (conversationTopics.length === 0) return ragData;
    const topicRelevantChunks = ragData.filter(chunk => {
        // --- Access the .text property of the chunk object ---
        const chunkText = chunk.text.toLowerCase();
        return conversationTopics.some(topic => chunkText.includes(topic.toLowerCase()));
    });
    console.log(`Context Expansion: Found ${topicRelevantChunks.length} topic-relevant chunks for follow-up.`);
    return topicRelevantChunks.length > 0 ? topicRelevantChunks : ragData;
}

async function findRelevantChunksImproved(query, genAI, ragData, history, topK = 8) {
    const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await embeddingModel.embedContent(query);
    const queryEmbedding = result.embedding.values;
    const previousAssistantResponses = history.filter(turn => turn.role === 'assistant').map(turn => turn.content.toLowerCase());
    const isSpecificFollowUp = await isQueryAskingForSpecificDetails(query, history, genAI);
    const similarities = ragData.map(chunk => {
        const chunkEmbedding = chunk.embedding;
        let score = dotProduct(queryEmbedding, chunkEmbedding);
        if (isSpecificFollowUp && previousAssistantResponses.some(res => res.includes(chunk.text.toLowerCase()))) {
            score *= 0.98;
        } else if (previousAssistantResponses.some(res => res.includes(chunk.text.toLowerCase()))) {
            score *= 0.75;
        }
        return { score, chunk };
    });
    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, topK).map(s => s.chunk.text);
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) { product += vecA[i] * vecB[i]; }
  return product;
}

// --- logConversation must be defined here ---
function logConversation(data) {
  const LOGGING_URL = process.env.LOGGING_URL;
  if (!LOGGING_URL) return;
  // Commenting out the fetch call to prevent the ECONNRESET error
  // fetch(LOGGING_URL, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // }).catch(error => console.error("Failed to log conversation:", error));
}
// --- END ADVANCED HELPER FUNCTIONS ---


// --- CONFIGURATION CONSTANTS ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GENERATIVE_MODEL = "gemini-1.5-flash-latest";
const EMBEDDING_MODEL = "text-embedding-004";
const PROJECT_HINTS = {
    en: { prefix_for_one: "You can find this project here:", architecture_button: "View our Architecture Projects", software_button: "View our Software Projects", mixed: "You can find our projects in the Architecture and Software sections of our website.", archi_software_button: "View our Architectural Software Projects" },
    hu: { prefix_for_one: "Ezt a projektet itt találja:", architecture_button: "Építészeti Projektjeink Megtekintése", software_button: "Szoftveres Projektjeink Megtekintése", mixed: "Projektjeinket a weboldalunk Építészet és Szoftver szekcióiban találja meg.", archi_software_button: "Építészeti Szoftver Projektjeink Megtekintése" }
};
const NAME_VARIANTS = { en: "Attila Déri", hu: "Déri Attila" };
const FALLBACK_RESPONSES = {
  en: { off_topic: "I am an assistant for Accaderi, and I can only answer questions related to our company, services, and projects. How can I help you with that?", too_specific: "That's a very detailed question! For inquiries like that, it's best to get in touch with us directly so we can provide the most accurate information. You can reach us via the contact form on our website." },
  hu: { off_topic: "Elnézést, de én az Accaderi asszisztense vagyok, így csak a cégünkkel, szolgáltatásainkkal és projektjeinkkel kapcsolatos kérdésekre tudok válaszolni. Miben segíthetek ezzel kapcsolatban?", too_specific: "Ez egy nagyon specifikus kérdés! Az ehhez hasonló részletes megkeresésekkel kapcsolatban a legjobb, ha közvetlenül felveszi velünk a kapcsolatot, hogy a legpontosabb tájékoztatást adhassuk. A weboldalunkon található kapcsolatfelvételi űrlapon keresztül érhet el minket." }
};
// --- END CONFIGURATION CONSTANTS ---


// --- MAIN HANDLER ---
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
    if (query.trim().length <= 3) {
        const responseText = FALLBACK_RESPONSES[currentLang].off_topic || FALLBACK_RESPONSES.en.off_topic;
        logConversation({ lang, query, response: responseText, type: 'short_query_fallback' });
        return res.status(200).json({ response: responseText });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    let ragData = await loadRagData();
    if (!ragData) { return res.status(500).json({ error: `The primary English knowledge base is missing.` }); }
    
    ragData = await expandContextForFollowup(history, ragData, genAI, query);
    const standaloneQuery = await rewriteQueryForRetrieval(history, query, genAI);
    let searchQuery = standaloneQuery;
    if (currentLang === 'hu') {
      searchQuery = await simplifyQueryToEnglish(standaloneQuery, genAI);
    }
    const contextChunks = await findRelevantChunksImproved(searchQuery, genAI, ragData, history);
    const context = contextChunks.join("\n\n---\n\n");

    const correctNameForLang = NAME_VARIANTS[currentLang] || NAME_VARIANTS.en;
    const formattedHistory = history.map(turn => `${turn.role}: ${turn.content}`).join('\n');
    const improvedMasterPromptRules = `
    **Your Golden Rule:** Your primary and most important job is to answer based *ONLY* on the "Context". For follow-up questions like "tell me more", you must provide ADDITIONAL details from the context that were NOT in your previous response. NEVER repeat the same information.
    **Persona & Behavior Rules:**
    1. You are a knowledgeable and friendly team member of Accaderi.
    2. Speak in the first-person plural ("we").
    3. Never mention "the document" or "the context".
    4. Refer to "${correctNameForLang}" as the founder when asked.
    **Task-Specific Rules:**
    1.  **Counting:** If asked "how many", count items and give a definitive number.
    2.  **Project Details:** Use the full "Project Name" and the "Designation:" from the context to frame your role accurately.
    3.  **Broad Questions:** For vague questions like "how many projects?", guide the user: "We have worked on many architecture and software projects. Are you more interested in one or the other?"
    4.  **TECHNOLOGY SYNTHESIS RULE:** If the user asks about a specific technology (e.g., "how many python projects?", "do you use n8n?"), you MUST scan the entire context for all projects that mention it. Your response should be a helpful summary, not just a number. For example: "We use Python in several of our projects, including Pongify and our Archicad Automation Scripts. It's a key part of our backend and automation toolkit."
    **Fallback Logic:**
    1. If the question is completely off-topic (news, employees, weather), use: "${FALLBACK_RESPONSES[currentLang].off_topic}"
    2. If the question is on-topic but too specific for the context, use: "${FALLBACK_RESPONSES[currentLang].too_specific}"
    `;
    let augmentedPrompt;
    if (currentLang === 'hu') {
        augmentedPrompt = `You are an expert multilingual assistant whose only job is to provide a final, clean response in HUNGARIAN.
        **Process:**
        1. Analyze the user's "Original Question", "Conversation History", and "Context".
        2. Internally formulate an answer in ENGLISH that strictly follows all rules in the "Master Prompt Rules" section.
        3. Translate the complete English result into HUNGARIAN.
        **CRITICAL OUTPUT RULE:** Your final output MUST ONLY contain the final Hungarian translation.
        ---
        **Master Prompt Rules:**
        ${improvedMasterPromptRules}
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
        augmentedPrompt = `You are a helpful and friendly assistant for Accaderi. Your main task is to answer the user's question by strictly following the rules below.
        ---
        **Master Prompt Rules:**
        ${improvedMasterPromptRules}
        ---
        **Conversation History:**
        ${formattedHistory}
        ---
        **Context:**
        ${context}
        ---
        **User's Question:**
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
    // The logic is now fully programmatic and based on the reliable `context`.
    const projectData = findProjectData(query, searchQuery, text);
    let finalText = text;
    let navLinkHTML = '';

    if (projectData) {
        console.log(`Found ${projectData.count} relevant projects in context.`);
        console.log(`Primary project: ${projectData.primaryProject.name} in section ${projectData.primaryProject.sectionKey}`);
        const hintTexts = PROJECT_HINTS[currentLang] || PROJECT_HINTS.en;
        
        if (projectData.count === 1) {
            const p = projectData.primaryProject;
            const pathText = buildTranslatedPath(p, currentLang);
            navLinkHTML = `<div class="chatbot-nav-container"><span>${hintTexts.prefix_for_one}</span><button class="chatbot-nav-link" data-section-key="${p.sectionKey}" data-section-id="${p.sectionId}" data-category="${p.category}" data-project="${p.name}">${pathText}</button></div>`;
        
        } else if (projectData.count > 1) {
            // Check for the special "Unreal" case before handling general multiple projects
            const lowerCaseContext = context.toLowerCase();
            if (lowerCaseContext.includes('unreal')) {
                 const buttonText = hintTexts.archi_software_button;
                 navLinkHTML = `<div class="chatbot-nav-container"><span>${hintTexts.prefix_for_one}</span><button class="chatbot-nav-link" data-section-key="software" data-section-id="projects" data-category="Archi" data-project="">${buttonText}</button></div>`;
            } else if (projectData.sections.size === 1) {
                const sectionKey = projectData.sections.values().next().value;
                const buttonText = hintTexts[`${sectionKey}_button`];
                const sectionId = projectData.primaryProject.sectionId;
                navLinkHTML = `<div class="chatbot-nav-container"><button class="chatbot-nav-link" data-section-key="${sectionKey}" data-section-id="${sectionId}" data-category="" data-project="">${buttonText}</button></div>`;
            } else {
                navLinkHTML = `<div class="chatbot-nav-container"><span>${hintTexts.mixed}</span></div>`;
            }
        }
    }

    finalText += navLinkHTML;
    
    logConversation({ lang, query, response: finalText, type: 'rag' });
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
