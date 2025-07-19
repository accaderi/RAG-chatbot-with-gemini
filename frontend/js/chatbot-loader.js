(function() {
    // --- Configuration ---
    const chatPageUrl = 'https://rag-chatbot-with-gemini.vercel.app'; 
    const cssFileUrl = '/css/chatbot-style.css'; 

    // --- Create and append CSS ---
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.type = 'text/css';
    styleLink.href = cssFileUrl;
    document.head.appendChild(styleLink);

    // --- Create the widget elements ---
    const launcher = document.createElement('div');
    launcher.id = 'chat-widget-launcher';
    launcher.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="32px" height="32px"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>`;

    const container = document.createElement('div');
    container.id = 'chat-widget-container';

    const iframe = document.createElement('iframe');
    iframe.id = 'chat-widget-iframe';
    const initialLang = typeof window.getEffectiveAppLanguage === 'function' ? window.getEffectiveAppLanguage().toUpperCase() : 'EN';
    iframe.src = `${chatPageUrl}?lang=${initialLang}`;
    container.appendChild(iframe);

    document.body.appendChild(launcher);
    document.body.appendChild(container);

    launcher.addEventListener('click', () => {
        container.classList.toggle('open');
    });

    // --- EVENT LISTENER FOR MESSAGES FROM THE CHATBOT ---
    window.addEventListener('message', (event) => {
        // --- THE ORIGIN CHECK ---
        // We now allow messages from the deployed app's domain and the main site's domain.
        const allowedOrigins = [
            new URL(chatPageUrl).origin, // The Vercel app URL
            window.location.origin      // Your main site (e.g. https://accaderi.fyi)
        ];
        
        // This check is now robust and allows communication.
        if (!allowedOrigins.includes(event.origin)) {
            console.warn('Blocked message from untrusted origin:', event.origin);
            return;
        }

        const data = event.data;
        if (data && data.type === 'CHATBOT_NAVIGATE') {
            console.log('Navigation command received from chatbot:', data);

            // --- THE NAVIGATION LOGIC ---
            // This logic correctly handles navigation from the main index page.

            if (!data.sectionKey) {
                console.error("Navigation failed: sectionKey is missing from the chatbot message.", data);
                return;
            }

            // 1. Determine the target URL for the section (e.g., '/architecture/index.html')
            const targetUrl = `/${data.sectionKey}/index.html`;

            // 2. Store the detailed path in sessionStorage for the NEXT page to use.
            const sectionPrefix = `${data.sectionKey}_`;

            // This single command object is safer and cleaner.
            const command = {
                targetSectionId: data.sectionId, // e.g., 'projects'
                // We now create the EXACT keys that script_indexes.js will look for.
                keysToSet: {
                    [`${sectionPrefix}currentSection`]: data.sectionId,
                    [`${sectionPrefix}${data.sectionId}_category`]: data.category,
                    [`${sectionPrefix}${data.sectionId}_project`]: data.project
                }
            };

            sessionStorage.setItem('chatbot_navigation_command', JSON.stringify(command));
            
            // 3. Navigate the browser to the correct section page.
            console.log(`Navigating to ${targetUrl} and passing navigation state...`);
            window.location.href = targetUrl;
        }
    });

})();