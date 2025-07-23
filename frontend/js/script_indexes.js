// js/script_indexes.js

document.addEventListener('DOMContentLoaded', function () {
    // Determine which section we're in based on HTML class
    const htmlElement = document.documentElement;
    const isArchitectureSection = htmlElement.classList.contains('green-theme');
    const isSoftwareSection = htmlElement.classList.contains('blue-theme');

    // Set section prefix for sessionStorage based on which section we're in
    const sectionPrefix = isArchitectureSection ? 'architecture_' : 'software_';

    // --- Get DOM Elements ---
    const topMenuItems = document.querySelectorAll('.top-menu-items a, .top-menu-items button');
    const sideMenu = document.getElementById('side-menu');
    const contentFrame = document.getElementById('content-frame');
    const contentContainer = document.getElementById('content-container');
    const hamburgerToggle = document.getElementById('hamburger-toggle');
    const topMenuItemsContainer = document.getElementById('top-menu-items');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');
    const projectsLink = document.getElementById('projects'); // Assumes static 'Projects' link exists in HTML
    let projectSubmenuContainer = null; // Will hold the dynamic container for mobile
    let projectsArrowImg = null; // To hold the arrow for mobile projects link

    // --- Define menuStructure variable ---
    let menuStructure; // Declare variable

    // --- Populate menuStructure ---
    // IMPORTANT: Keys ('Commercial', 'AI') and project names MUST match entries in translations.HU
    if (isArchitectureSection) {
        menuStructure = {
            'about': { defaultPage: 'about.html', hasSubmenu: false },
            'services': { defaultPage: 'services.html', hasSubmenu: false },
            'projects': {
                defaultPage: 'architecture.html', hasSubmenu: true,
                categories: {
                    'Commercial': { page: 'architecture.html', projects: [
                            { name: 'Hamad International Airport', page: 'projects/commercial/project1.html' },
                            { name: 'Qatar National Convention Center', page: 'projects/commercial/project2.html' },
                            { name: 'Ferrari World Abu Dhabi', page: 'projects/commercial/project3.html' },
                            { name: 'Hunguest BÁL Resort', page: 'projects/commercial/project4.html' },
                            { name: 'Tengiz Crude Export Project', page: 'projects/commercial/project5.html' },
                            { name: 'Bakony Integrated Social Institution', page: 'projects/commercial/project6.html' },
                            { name: 'Nagykáta City Library', page: 'projects/commercial/project7.html' },
                            { name: 'Taksony German Nationality Kindergarten', page: 'projects/commercial/project8.html' },
                            { name: 'Tamási Cultural Center', page: 'projects/commercial/project9.html' },
                            { name: 'Ady Endre Cultural Center', page: 'projects/commercial/project10.html' } ] },
                    'Highrise': { page: 'architecture.html', projects: [ // Adjusted page path if needed
                            { name: 'Four Seasons Hotel, Bahrain', page: 'projects/highrise/project1.html' },
                            { name: 'ADNOC Headquarters', page: 'projects/highrise/project2.html' },
                            { name: 'Burj Khalifa', page: 'projects/highrise/project3.html' } ] },
                    'Residential': { page: 'architecture.html', projects: [ // Adjusted page path if needed
                            { name: '28 Flats Residential Development', page: 'projects/residential/project1.html' } ] }
                }
            },
            'contact': { defaultPage: 'contact.html', hasSubmenu: false }
        };
    } else { // Software section by default
        menuStructure = {
            'about': { defaultPage: 'about.html', hasSubmenu: false },
            'services': { defaultPage: 'services.html', hasSubmenu: false },
            'projects': {
                defaultPage: 'coding.html', hasSubmenu: true,
                categories: {
                    'AI': { page: 'coding/ai.html', projects: [
                            { name: 'LlamaParse Test', page: 'projects/ai/project1.html' },
                            { name: 'Email on Autopilot', page: 'projects/ai/project2.html' },
                            { name: 'LightRAG-Chat', page: 'projects/ai/project3.html' },
                            { name: 'Youtube Chronicle', page: 'projects/ai/project4.html' },
                            { name: 'News Webpage', page: 'projects/ai/project5.html' },
                            { name: 'RAG_64', page: 'projects/ai/project6.html' },
                            { name: 'Bookmark Genie', page: 'projects/ai/project7.html' },
                            { name: 'visR', page: 'projects/ai/project8.html' },
                            { name: 'RAG Chatbot with Gemini', page: 'projects/ai/project9.html' } ] },
                    'Archi': { page: 'coding/archi.html', projects: [
                            { name: 'Unreal - Guide for Architects', page: 'projects/archi/project1.html' },
                            { name: 'Unreal - Guide for Archviz', page: 'projects/archi/project2.html' },
                            { name: 'Archicad Python API', page: 'projects/archi/project3.html' },
                            { name: 'Archicad Python Scripts', page: 'projects/archi/project4.html' } ] },
                    'Gaming': { page: 'coding/gaming.html', projects: [
                            { name: 'Pongify', page: 'projects/gaming/project1.html' },
                            { name: 'Atomremix', page: 'projects/gaming/project2.html' },
                            { name: 'Apples in Space', page: 'projects/gaming/project3.html' } ] },
                    'Other': { page: 'coding/other.html', projects: [ // Assuming other.html exists
                            { name: 'FTP/SFTP Debian', page: 'projects/other/project1.html' },
                            { name: 'Set Up Website', page: 'projects/other/project2.html' },
                            { name: 'Hosting n8n', page: 'projects/other/project3.html' },
                            { name: 'Chrome Extension, Firebase, Stripe', page: 'projects/other/project4.html' },
                            { name: 'Trading BOT', page: 'projects/other/project5.html' },
                            { name: 'Real Estate Analyzer', page: 'projects/other/project6.html' },
                            { name: 'TSV to Postgress', page: 'projects/other/project7.html' } ] }
                }
            },
            'contact': { defaultPage: 'contact.html', hasSubmenu: false }
        };
    }
    // --- NOW menuStructure is initialized ---


    // --- Define Functions ---

    /** Gets language from localStorage, used during menu build */
    // function getCurrentLang() {
    //     try {
    //          const lang = localStorage.getItem('lang');
    //          return (lang === 'HU') ? 'HU' : 'EN'; // Default to EN if invalid/null
    //     } catch (e) {
    //          return 'EN'; // Fallback on storage error
    //     }
    // }

    function getCurrentLang() {
        if (typeof window.getEffectiveAppLanguage === 'function') {
            return window.getEffectiveAppLanguage();
        }
        // Fallback if languageSwitcher.js or its function isn't loaded/ready
        console.warn("window.getEffectiveAppLanguage not found. Falling back to direct localStorage access for script_indexes menu language. Ensure languageSwitcher.js is loaded first.");
        try {
             const lang = localStorage.getItem('lang');
             return (lang === 'HU') ? 'HU' : 'EN'; // Default to EN if invalid/null
        } catch (e) {
             console.error("Error accessing localStorage in getCurrentLang fallback:", e);
             return 'EN'; // Fallback on storage error
        }
    }

    /** Builds the dynamic menu items (side menu or mobile project container) */
    function buildMenuItems(sectionId, menuData) {
        const isMobile = window.innerWidth <= 768;
        const targetContainer = isMobile ? projectSubmenuContainer : sideMenu;

        if (!targetContainer || !menuData) return;

        // Clear previous dynamic items
        targetContainer.innerHTML = '';

        if (!menuData.hasSubmenu || !menuData.categories) {
            targetContainer.classList.remove('open');
            return;
        }

        const currentLang = getCurrentLang(); // Get language state for this build

        // Check if translate function exists
        const translateFunc = window.translateMenuItem;
        if (!translateFunc) {
            console.warn("translateMenuItem function not found on window. Menus will not be translated.");
        }

        Object.entries(menuData.categories).forEach(([categoryKey, data]) => {
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            // --- TRANSLATE CATEGORY NAME ---
            categoryLink.textContent = translateFunc ? translateFunc(categoryKey, currentLang) : categoryKey;
            categoryLink.classList.add('category-link');
            categoryLink.dataset.category = categoryKey; // Store the ORIGINAL KEY

            const submenu = document.createElement('div');
            submenu.classList.add('submenu');

            if (data.projects && Array.isArray(data.projects)) {
                data.projects.forEach(project => {
                    const projectLink = document.createElement('a');
                    projectLink.href = '#';
                    // --- TRANSLATE PROJECT NAME ---
                    projectLink.textContent = translateFunc ? translateFunc(project.name, currentLang) : project.name;
                    projectLink.dataset.page = project.page;
                    projectLink.dataset.originalName = project.name; // Store ORIGINAL NAME for restoration

                    projectLink.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const currentTargetContainer = isMobile ? projectSubmenuContainer : sideMenu;
                        if (!currentTargetContainer) return;
                        const parentSubmenu = this.closest('.submenu');

                        // Clear active states
                        if (parentSubmenu) {
                            parentSubmenu.querySelectorAll('a.active').forEach(activeLink => activeLink.classList.remove('active'));
                        }
                        currentTargetContainer.querySelectorAll('.category-link.active').forEach(activeCatLink => {
                            if (activeCatLink !== categoryLink) {
                                activeCatLink.classList.remove('active');
                                const siblingSubmenu = activeCatLink.nextElementSibling;
                                if (siblingSubmenu && siblingSubmenu.classList.contains('submenu')) {
                                    siblingSubmenu.classList.remove('open');
                                }
                            }
                        });

                        // Activate current path
                        categoryLink.classList.add('active');
                        if (submenu && !submenu.classList.contains('open')) {
                            submenu.classList.add('open');
                        }
                        this.classList.add('active');

                        if (contentFrame && this.dataset.page) contentFrame.src = this.dataset.page;

                        // Save ORIGINAL KEY and NAME to sessionStorage
                        sessionStorage.setItem(`${sectionPrefix}${sectionId}_category`, categoryKey);
                        sessionStorage.setItem(`${sectionPrefix}${sectionId}_project`, this.dataset.originalName); // Use original name

                        if (isMobile) {
                            closeMobileMenu();
                        }
                    });
                    submenu.appendChild(projectLink);
                });
            }

            categoryLink.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const currentTargetContainer = isMobile ? projectSubmenuContainer : sideMenu;
                if (!currentTargetContainer || !submenu) return;
                const isSubmenuDivOpen = submenu.classList.contains('open');

                // Load default page for the main section ('projects') when category clicked
                 if (contentFrame && menuStructure[sectionId]) contentFrame.src = menuStructure[sectionId].defaultPage;

                // Close other submenus
                currentTargetContainer.querySelectorAll('.submenu.open').forEach(sm => {
                    if (sm !== submenu) {
                        sm.classList.remove('open');
                        const correspondingCategory = sm.previousElementSibling;
                        if (correspondingCategory && correspondingCategory.classList.contains('category-link')) {
                            correspondingCategory.classList.remove('active');
                        }
                    }
                });

                // Toggle current submenu
                if (!isSubmenuDivOpen) {
                    submenu.classList.add('open');
                    this.classList.add('active');
                    sessionStorage.setItem(`${sectionPrefix}${sectionId}_category`, categoryKey); // Save ORIGINAL KEY
                    sessionStorage.removeItem(`${sectionPrefix}${sectionId}_project`);
                    if(submenu) submenu.querySelectorAll('a.active').forEach(pl => pl.classList.remove('active'));
                } else {
                    submenu.classList.remove('open');
                    this.classList.remove('active');
                    sessionStorage.removeItem(`${sectionPrefix}${sectionId}_category`); // Remove ORIGINAL KEY
                    sessionStorage.removeItem(`${sectionPrefix}${sectionId}_project`);
                }
            });

            targetContainer.appendChild(categoryLink);
            targetContainer.appendChild(submenu);
        });

        // Restore active state using ORIGINAL keys/names AFTER building
        restoreSubmenuSelection(sectionId, targetContainer);

        // Handle mobile container visibility
        if (isMobile && targetContainer.innerHTML !== '') {
            if (sessionStorage.getItem(`${sectionPrefix}currentSection`) === sectionId) {
                targetContainer.classList.add('open');
            }
        }
    } // End buildMenuItems

    /** Restores active states based on sessionStorage */
    function restoreSubmenuSelection(sectionId, container) {
        if (!container) return;

        const savedCategoryKey = sessionStorage.getItem(`${sectionPrefix}${sectionId}_category`); // Get KEY
        const savedProjectOriginalName = sessionStorage.getItem(`${sectionPrefix}${sectionId}_project`); // Get ORIGINAL NAME

        if (savedCategoryKey) {
            const categoryLink = container.querySelector(`.category-link[data-category="${savedCategoryKey}"]`);
            if (categoryLink) {
                container.querySelectorAll('.category-link.active').forEach(cl => cl.classList.remove('active'));
                categoryLink.classList.add('active');
                const submenu = categoryLink.nextElementSibling;

                if (submenu && submenu.classList.contains('submenu')) {
                    submenu.classList.add('open'); // Ensure submenu is open

                    if (savedProjectOriginalName) {
                         submenu.querySelectorAll('a.active').forEach(pl => pl.classList.remove('active'));
                         // Find project link using the ORIGINAL NAME stored in data-original-name
                         const projectLink = submenu.querySelector(`a[data-original-name="${savedProjectOriginalName}"]`);

                         if (projectLink) {
                             projectLink.classList.add('active');
                         } else {
                              // Fallback: Try matching by page URL (less reliable if names differ but pages same)
                              const projectData = menuStructure[sectionId]?.categories[savedCategoryKey]?.projects.find(p => p.name === savedProjectOriginalName);
                              const projectPage = projectData?.page;
                               if (projectPage) {
                                   const linkByPage = submenu.querySelector(`a[data-page="${projectPage}"]`);
                                   if(linkByPage) linkByPage.classList.add('active');
                               } else {
                                   console.warn(`Could not find project link for restored state: ${savedProjectOriginalName}`);
                               }
                         }
                    }
                } else if (submenu){
                    // Category restored, but submenu doesn't exist? Error somewhere.
                     console.warn(`Submenu not found for category link: ${savedCategoryKey}`);
                }
            } else {
                 // console.warn(`Category link not found for restored key: ${savedCategoryKey}`);
            }
        }
    } // End restoreSubmenuSelection

    /** Handles desktop sidebar visibility and building content */
    function handleDesktopSidebar(sectionId, menuData) {
        if (!toggleSidebarBtn || !sideMenu || !contentContainer || !menuData || window.innerWidth <= 768) return;

        if (!menuData.hasSubmenu) {
            toggleSidebarBtn.classList.add('disabled');
            toggleSidebarBtn.classList.remove('active');
            sideMenu.classList.add('hidden');
            contentContainer.classList.add('full-width');
            toggleSidebarBtn.textContent = "▶";
            sideMenu.innerHTML = '';
        } else {
            toggleSidebarBtn.classList.remove('disabled');
            sidebarVisible = sessionStorage.getItem(`${sectionPrefix}sidebarVisible`) !== 'false';
            if (sidebarVisible) {
                sideMenu.classList.remove('hidden');
                contentContainer.classList.remove('full-width');
                toggleSidebarBtn.textContent = "◀";
                toggleSidebarBtn.classList.add('active');
            } else {
                sideMenu.classList.add('hidden');
                contentContainer.classList.add('full-width');
                toggleSidebarBtn.textContent = "▶";
                toggleSidebarBtn.classList.remove('active');
            }
            // Build items in the side menu for desktop (uses current language)
            buildMenuItems(sectionId, menuData);
        }
    } // End handleDesktopSidebar

    /** Handles URL hash changes for basic routing */
        function handleHashNavigation() {
        const hash = window.location.hash.substring(1).toLowerCase(); // Get hash, remove #, lowercase

        if (!contentFrame) {
            console.error("contentFrame not found, cannot navigate by hash.");
            return;
        }

        let targetSectionId = null;
        let specificProjectCategoryKey = null; // For #coding or #architecture

        if (!hash || hash === 'about') {
            targetSectionId = 'about';
        } else if (hash === 'services') {
            targetSectionId = 'services';
        } else if (hash === 'contact') {
            targetSectionId = 'contact';
        } else if (hash === 'projects') {
            // For a generic #projects, decide a default based on theme or a fixed default
            targetSectionId = 'projects';
            // Example: default to 'Coding' for software, 'Commercial' for architecture
            specificProjectCategoryKey = isSoftwareSection ? 'AI' : 'Commercial'; // **ADJUST THESE DEFAULT CATEGORY KEYS**
                                                                                  // These should be the *keys* from your menuStructure.projects.categories
        } else if (isSoftwareSection) {
            if (hash === 'coding') { // Treat #coding as the main 'projects' section with 'AI' as default category
                targetSectionId = 'projects';
                specificProjectCategoryKey = 'AI'; // **ADJUST if your default "Coding" category key is different**
            } else if (menuStructure.projects && menuStructure.projects.categories) {
                // Check if hash matches a software project category key
                for (const catKey in menuStructure.projects.categories) {
                    if (catKey.toLowerCase() === hash) {
                        targetSectionId = 'projects';
                        specificProjectCategoryKey = catKey;
                        break;
                    }
                    // Check if hash matches a specific project *name's* page for deep linking to specific project
                    // This part is more complex and requires iterating through projects.
                    // For simplicity, we'll stick to category-level hashes for now.
                }
            }
        } else if (isArchitectureSection) {
            if (hash === 'architecture') { // Treat #architecture as main 'projects' with 'Commercial' default
                targetSectionId = 'projects';
                specificProjectCategoryKey = 'Commercial'; // **ADJUST if your default "Architecture" category key is different**
            } else if (menuStructure.projects && menuStructure.projects.categories) {
                // Check if hash matches an architecture project category key
                for (const catKey in menuStructure.projects.categories) {
                    if (catKey.toLowerCase() === hash) {
                        targetSectionId = 'projects';
                        specificProjectCategoryKey = catKey;
                        break;
                    }
                }
            }
        }


        if (targetSectionId && menuStructure[targetSectionId]) {
            const topLevelLink = document.getElementById(targetSectionId);
            if (topLevelLink) {
                // Simulate a click on the top-level link.
                // This should trigger your existing logic to:
                // 1. Set the top-level link as active.
                // 2. Store `currentSection` in sessionStorage.
                // 3. Load the defaultPage for that section.
                // 4. If it's 'projects', handle desktop sidebar or mobile submenu.

                // Before clicking, if it's a specific project category hash,
                // we need to prime sessionStorage so the projectsLink click handler
                // can pick up the correct category and potentially its default project.
                if (targetSectionId === 'projects' && specificProjectCategoryKey) {
                    sessionStorage.setItem(`${sectionPrefix}projects_category`, specificProjectCategoryKey);
                    // If you want to load the category's specific default project, not just the category overview page:
                    const categoryData = menuStructure.projects.categories[specificProjectCategoryKey];
                    if (categoryData && categoryData.projects && categoryData.projects.length > 0) {
                         // To load the *first project* of that category by default:
                         // sessionStorage.setItem(`${sectionPrefix}projects_project`, categoryData.projects[0].name);
                         // OR, if each category has its own 'page' like 'coding/ai.html':
                         // You might need to adjust your main click handler to use this, or directly load here.
                         // For now, clicking projectsLink and having it read the category should be enough
                         // if its default action is to show the category overview or first project.
                    } else {
                        sessionStorage.removeItem(`${sectionPrefix}projects_project`); // No specific project, just category
                    }
                } else if (targetSectionId !== 'projects') {
                    // Clear project-specific session storage if navigating away from projects
                    sessionStorage.removeItem(`${sectionPrefix}projects_category`);
                    sessionStorage.removeItem(`${sectionPrefix}projects_project`);
                }

                // Check if the target is already loaded to prevent redundant clicks/reloads
                const currentSection = sessionStorage.getItem(`${sectionPrefix}currentSection`);
                const currentIframeSrc = contentFrame.getAttribute('src');
                let intendedPageToLoad = menuStructure[targetSectionId].defaultPage;

                if (targetSectionId === 'projects' && specificProjectCategoryKey) {
                    const categoryData = menuStructure.projects.categories[specificProjectCategoryKey];
                    // If category itself has a 'page' attribute (like 'coding/ai.html') use that,
                    // otherwise use the main projects defaultPage.
                    if (categoryData && categoryData.page) {
                        intendedPageToLoad = categoryData.page;
                    } else if (categoryData && categoryData.projects && categoryData.projects.length > 0){
                        // If we want to default to the first project within the category
                        // intendedPageToLoad = categoryData.projects[0].page;
                    }
                }

                // Only click if not already on the target section AND target page
                // This is a bit tricky because a click on "projects" might load different sub-content
                // based on session. A simpler check is if the top-level section is already active.
                if (!topLevelLink.classList.contains('active') || contentFrame.getAttribute('src') !== intendedPageToLoad) {
                    topLevelLink.click();
                } else if (targetSectionId === 'projects' && specificProjectCategoryKey) {
                    // If projects is already active, but maybe a different category was targeted by hash
                    // We might need to specifically re-build the side menu or mobile menu
                    // This can be complex. For now, the topLevelLink.click() should handle
                    // reading the session storage we just set.
                    // If the category is already the one in session, this will do nothing extra.
                    // If it's different, the projectsLink click handler should pick it up.
                }


            } else {
                console.warn(`Menu link with ID "${targetSectionId}" not found for hash navigation.`);
                // Fallback to a known default if the link for the hash is missing
                const fallbackLink = document.getElementById('about');
                if (fallbackLink && !fallbackLink.classList.contains('active')) fallbackLink.click();
            }
        } else if (hash) { // Hash was present but didn't match any primary section
            console.warn(`No route configured for hash: #${hash}. Defaulting to 'about'.`);
            const fallbackLink = document.getElementById('about');
            // Only click if 'about' isn't already the active one to avoid loops
            if (fallbackLink && !fallbackLink.classList.contains('active')) {
                 sessionStorage.removeItem(`${sectionPrefix}projects_category`); // Clear project state
                 sessionStorage.removeItem(`${sectionPrefix}projects_project`);
                 fallbackLink.click();
            } else if (fallbackLink && fallbackLink.classList.contains('active') && contentFrame.getAttribute('src') !== menuStructure.about.defaultPage) {
                // If about is active but iframe src is wrong (e.g. from a bad previous state)
                contentFrame.src = menuStructure.about.defaultPage;
            }
        } else if (!hash && !sessionStorage.getItem(`${sectionPrefix}currentSection`)) {
            // If no hash and no saved section (very first load), click 'about'
            const aboutDefaultLink = document.getElementById('about');
            if (aboutDefaultLink) aboutDefaultLink.click();
        }
        // If there's no hash BUT there IS a saved section, your existing initial load logic
        // that reads `sessionStorage.getItem(`${sectionPrefix}currentSection`)` should handle it.
    }

    /** Clears active classes from menu items */
    function clearActiveStates(container = sideMenu) {
         if (!container) return;
         container.querySelectorAll('.active').forEach(item => item.classList.remove('active'));
    }

    /** Closes the mobile hamburger menu */
    function closeMobileMenu() {
        if (window.innerWidth <= 768 && topMenuItemsContainer && hamburgerToggle) {
            topMenuItemsContainer.classList.remove('active');
            hamburgerToggle.querySelectorAll('span').forEach(span => span.classList.remove('active'));
        }
    }

    /** Creates the container for mobile project submenu */
    function createProjectSubmenuContainer() {
        if (!projectSubmenuContainer && projectsLink) {
            projectSubmenuContainer = document.createElement('div');
            projectSubmenuContainer.id = 'project-submenu-container';
            projectsLink.parentNode.insertBefore(projectSubmenuContainer, projectsLink.nextSibling);
        }
    }

    // Function to create or update the projects arrow for mobile
    function setupProjectsMobileArrow() {
        if (projectsLink && !projectsArrowImg) {
            projectsArrowImg = document.createElement('img');
            projectsArrowImg.classList.add('projects-arrow-mobile');
            projectsArrowImg.src = '../svg/down-chevron-white.svg'; 
            projectsArrowImg.alt = 'Toggle submenu';
            projectsLink.appendChild(projectsArrowImg);
        }
        // CSS will handle visibility based on screen width
    }

    // --- End Function Definitions ---


    // --- Initial Setup ---
    if (projectsLink) { // Only create if static projects link exists
        createProjectSubmenuContainer();
        setupProjectsMobileArrow(); // Create the arrow on initial setup
    }


    // --- Attach Event Listeners ---

    // Close mobile menus on outside click
    document.addEventListener('click', function (e) {
        if (window.innerWidth <= 768 && topMenuItemsContainer && hamburgerToggle) {
            if (!topMenuItemsContainer.contains(e.target) && !hamburgerToggle.contains(e.target)) {
                closeMobileMenu();
                if (projectSubmenuContainer) projectSubmenuContainer.classList.remove('open');
            }
        }
    });

    // --- Window Resize Listener ---
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', function() {
        const currentWidth = window.innerWidth;
        const breakpoint = 768;

        // Toggle arrow visibility based on resize
        if (projectsArrowImg) {
            if (currentWidth <= breakpoint) {
                projectsArrowImg.style.display = 'inline-block';
            } else {
                projectsArrowImg.style.display = 'none';
            }
        }

        if (lastWidth <= breakpoint && currentWidth > breakpoint) {
            // Resized from mobile to desktop
            if (topMenuItemsContainer && topMenuItemsContainer.classList.contains('active')) {
                topMenuItemsContainer.classList.remove('active');
                if (hamburgerToggle) {
                    hamburgerToggle.querySelectorAll('span').forEach(span => span.classList.remove('active'));
                }
            }
            if (projectSubmenuContainer) { // Clear and hide mobile project container if it exists
                projectSubmenuContainer.innerHTML = '';
                projectSubmenuContainer.classList.remove('open');
            }

            // Determine active section link and call handleDesktopSidebar
            let activeSectionLink = null;
            if (topMenuItemsContainer) {
                const potentialActiveLinks = topMenuItemsContainer.querySelectorAll('a.active[id]');
                for (const link of potentialActiveLinks) {
                    if (menuStructure.hasOwnProperty(link.id)) {
                        activeSectionLink = link;
                        break; // Found the first 'a' tag that is a valid section and active
                    }
                }
            }

            if (activeSectionLink) {
                const sectionId = activeSectionLink.id;
                const menuData = menuStructure[sectionId];
                handleDesktopSidebar(sectionId, menuData);
            } else {
                // Fallback: if no active section link found, try to get from session storage or default
                const lastActiveSectionId = sessionStorage.getItem(`${sectionPrefix}currentSection`);
                if (lastActiveSectionId && menuStructure[lastActiveSectionId]){
                    handleDesktopSidebar(lastActiveSectionId, menuStructure[lastActiveSectionId]);
                } else {
                    // If truly no idea, ensure side menu is hidden and toggle is disabled
                    if (sideMenu) {
                        sideMenu.classList.add('hidden');
                        sideMenu.innerHTML = '';
                    }
                    if (contentContainer) {
                        contentContainer.classList.add('full-width');
                    }
                    if (toggleSidebarBtn) {
                        toggleSidebarBtn.classList.add('disabled');
                        toggleSidebarBtn.classList.remove('active');
                        toggleSidebarBtn.textContent = "▶";
                    }
                }
            }

        } else if (lastWidth > breakpoint && currentWidth <= breakpoint) {
            // Resized from desktop to mobile
            // Ensure sideMenu is hidden and content is full width initially for mobile
            if (sideMenu) sideMenu.classList.add('hidden');
            if (contentContainer) contentContainer.classList.remove('full-width'); // Mobile CSS handles this mostly

            // If 'Projects' is active, build for mobile project container
            const activeTopLink = document.querySelector('.top-menu-items a.active, .top-menu-items button.active');
            if (activeTopLink && activeTopLink.id && menuStructure[activeTopLink.id] && menuStructure[activeTopLink.id].hasSubmenu) {
                if (!projectSubmenuContainer) { // Create if it doesn't exist
                    projectSubmenuContainer = createProjectSubmenuContainer();
                }
                buildMenuItems(activeTopLink.id, menuStructure[activeTopLink.id]);
                // Restore selection in mobile container if it was open
                if (topMenuItemsContainer && topMenuItemsContainer.classList.contains('active')) {
                     restoreSubmenuSelection(activeTopLink.id, projectSubmenuContainer);
                }
            } else if (projectSubmenuContainer) {
                projectSubmenuContainer.innerHTML = '';
                projectSubmenuContainer.classList.remove('open');
            }
        }

        lastWidth = currentWidth;
    });

    // Toggle hamburger menu
    if(hamburgerToggle) {
        hamburgerToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            if (!topMenuItemsContainer) return;

            const isNowOpening = !topMenuItemsContainer.classList.contains('active'); // State BEFORE toggle
            topMenuItemsContainer.classList.toggle('active');
            hamburgerToggle.querySelectorAll('span').forEach(span => span.classList.toggle('active'));

            const currentSectionId = sessionStorage.getItem(`${sectionPrefix}currentSection`);

            if (isNowOpening) { // Hamburger is being opened
                if (projectSubmenuContainer) {
                    if (currentSectionId === 'projects' && menuStructure.projects) {
                        // Rebuild items for language consistency & ensure it's open
                        buildMenuItems(currentSectionId, menuStructure[currentSectionId]); 
                        projectSubmenuContainer.classList.add('open');
                    } else {
                        // Ensure it's closed for other sections
                        projectSubmenuContainer.classList.remove('open'); 
                    }
                }

                // After submenu state is set, update arrow visibility and direction
                if (projectsArrowImg) {
                    projectsArrowImg.style.display = 'inline-block';
                    if (projectSubmenuContainer && projectSubmenuContainer.classList.contains('open')) {
                        projectsArrowImg.src = '../svg/up-chevron-white.svg';
                    } else {
                        projectsArrowImg.src = '../svg/down-chevron-white.svg';
                    }
                }
            } else { // Hamburger is being closed
                if (projectSubmenuContainer) {
                    projectSubmenuContainer.classList.remove('open'); // Also close submenu
                }
                // Arrow will be hidden by CSS or resize logic, but can set src for consistency
                if (projectsArrowImg) {
                    projectsArrowImg.src = '../svg/down-chevron-white.svg';
                    // projectsArrowImg.style.display = 'none'; // Or let resize/desktop view handle this
                }
            }
        });
    }

    // Sidebar toggle button
    if(toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', function () {
            if (toggleSidebarBtn.classList.contains('disabled') || !sideMenu || !contentContainer) return;
            if (sideMenu.classList.contains('hidden')) {
                sideMenu.classList.remove('hidden'); contentContainer.classList.remove('full-width');
                toggleSidebarBtn.textContent = "◀"; toggleSidebarBtn.classList.add('active');
                sessionStorage.setItem(`${sectionPrefix}sidebarVisible`, 'true');
            } else {
                sideMenu.classList.add('hidden'); contentContainer.classList.add('full-width');
                toggleSidebarBtn.textContent = "▶"; toggleSidebarBtn.classList.remove('active');
                sessionStorage.setItem(`${sectionPrefix}sidebarVisible`, 'false');
            }
        });
    }

    // Top Menu Item Click Handler
    topMenuItems.forEach(item => {
        if (item.closest && item.closest('#project-submenu-container')) { return; }
        if (item.tagName === 'BUTTON' && item.id === 'toggle-sidebar') { return; }
        if (item.tagName === 'DIV' && item.classList.contains('menu-divider')) { return; }
        // Check if parent is correct container (might need adjustment based on exact HTML)
        // if (item.parentNode !== topMenuItemsContainer && item.parentNode.closest('.top-menu-items') !== topMenuItemsContainer) { return; }
        
        item.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '../index.html') { return; } // Allow back navigation

            e.preventDefault();
            e.stopPropagation();

            const id = this.id;
            if (!id || !menuStructure[id]) return;
            const menuData = menuStructure[id];
            const isMobile = window.innerWidth <= 768;

            // Mobile Project Submenu Toggling
            if (isMobile && projectSubmenuContainer && menuData) {
                if (id === 'projects') {
                    const isOpen = projectSubmenuContainer.classList.contains('open');
                    if (!isOpen) {
                        buildMenuItems(id, menuData); 
                        projectSubmenuContainer.classList.add('open');
                        if (projectsArrowImg) projectsArrowImg.src = '../svg/up-chevron-white.svg';
                    } else { 
                        projectSubmenuContainer.classList.remove('open'); 
                        if (projectsArrowImg) projectsArrowImg.src = '../svg/down-chevron-white.svg';
                    }
                } else { // A non-'Projects' top menu item was clicked in mobile view
                    if (projectSubmenuContainer.classList.contains('open')) {
                        projectSubmenuContainer.classList.remove('open');
                        if (projectsArrowImg) projectsArrowImg.src = '../svg/down-chevron-white.svg';
                    }
                }
            }

            // Update Top Level Active State
            if (topMenuItemsContainer) {
                Array.from(topMenuItemsContainer.children).forEach(child => {
                    if (child.tagName === 'A' || child.tagName === 'BUTTON') { child.classList.remove('active'); }
                });
                this.classList.add('active');
            }
            sessionStorage.setItem(`${sectionPrefix}currentSection`, id);

            // Determine Page to Load
            let pageToLoad = menuData.defaultPage;
            if (id === 'projects') {
                const savedCategoryKey = sessionStorage.getItem(`${sectionPrefix}projects_category`);
                const savedProjectName = sessionStorage.getItem(`${sectionPrefix}projects_project`);
                 if (savedCategoryKey && savedProjectName && menuStructure.projects?.categories[savedCategoryKey]?.projects) {
                     const projectData = menuStructure.projects.categories[savedCategoryKey].projects.find(p => p.name === savedProjectName);
                     if (projectData?.page) { pageToLoad = projectData.page; }
                 }
            }

            // (4) Load page into iframe LOGIC
            if (contentFrame) {
                const currentSrc = contentFrame.getAttribute('src');
                const isProjectsLink = (id === 'projects');

                if (isMobile && isProjectsLink) {
                    // For the mobile "Projects" link, always load the pageToLoad.
                    // This pageToLoad has already been determined to be either the
                    // specific saved project or the default projects page.
                    contentFrame.src = pageToLoad;
                } else {
                    // For desktop or other mobile menu items
                    if (currentSrc !== pageToLoad) {
                        contentFrame.src = pageToLoad;
                    }
                }
            }

            // Handle Desktop Sidebar
            if (!isMobile) { 
                handleDesktopSidebar(id, menuData); 
                if (projectsArrowImg) projectsArrowImg.style.display = 'none'; // Hide arrow on desktop
            } else {
                if (projectsArrowImg) projectsArrowImg.style.display = 'inline-block'; // Show arrow on mobile
            }

            // Close mobile menu for non-project top items
            if (isMobile && id !== 'projects') { closeMobileMenu(); }
        });
    });


    // --- Initial Load Logic ---
    // const savedSection = sessionStorage.getItem(`${sectionPrefix}currentSection`);
    // const initialSectionId = (savedSection && menuStructure[savedSection]) ? savedSection : 'about';
    // const initialLink = document.getElementById(initialSectionId);

    // if (initialLink && menuStructure[initialSectionId] && contentFrame) {
    //     // Set initial active state for top menu
    //     if(topMenuItemsContainer) {
    //        Array.from(topMenuItemsContainer.children).forEach(child => child.classList.remove('active'));
    //     }
    //     initialLink.classList.add('active');

    //     // Determine initial page
    //     let initialPageToLoad = menuStructure[initialSectionId].defaultPage;
    //     if (initialSectionId === 'projects') {
    //         const savedCategoryKey = sessionStorage.getItem(`${sectionPrefix}projects_category`);
    //         const savedProjectName = sessionStorage.getItem(`${sectionPrefix}projects_project`);
    //          if (savedCategoryKey && savedProjectName && menuStructure.projects?.categories[savedCategoryKey]?.projects) {
    //              const projectData = menuStructure.projects.categories[savedCategoryKey].projects.find(p => p.name === savedProjectName);
    //              if (projectData?.page) { initialPageToLoad = projectData.page; }
    //          }
    //     }
    //     contentFrame.src = initialPageToLoad; // Set initial iframe src
    //     sessionStorage.setItem(`${sectionPrefix}currentSection`, initialSectionId);

    //     // Desktop/Mobile specific setup
    //     if (window.innerWidth > 768) {
    //         handleDesktopSidebar(initialSectionId, menuStructure[initialSectionId]);
    //         if (toggleSidebarBtn) { // Smooth visibility for toggle button
    //            requestAnimationFrame(() => { setTimeout(() => { toggleSidebarBtn.classList.add('ready'); }, 0); });
    //         }
    //     } else {
    //         if(sideMenu) sideMenu.classList.add('hidden');
    //         if(contentContainer) contentContainer.classList.add('full-width');
    //         if (initialSectionId === 'projects' && projectSubmenuContainer && menuStructure.projects) {
    //             buildMenuItems(initialSectionId, menuStructure.projects); // Builds mobile menu
    //         }
    //     }
    // } else {
    //     console.error("Initial load failed: Required elements not found or invalid initialSectionId.");
    //     if(contentFrame && menuStructure.about) contentFrame.src = menuStructure.about.defaultPage; // Fallback load
    // }

    // --- NEW, SMARTER INITIALIZATION LOGIC FOR CHATBOT LINKS---

    function initializePage() {
        console.log("Initializing page...");
        
        // Priority 1: Check for a pending command from the chatbot.
        const chatbotCommandRaw = sessionStorage.getItem('chatbot_navigation_command');
        if (chatbotCommandRaw) {
            sessionStorage.removeItem('chatbot_navigation_command');
            
            console.log("Chatbot navigation command found. Executing...");
            try {
                const command = JSON.parse(chatbotCommandRaw);

                // Set all the necessary session storage keys from the command object.
                for (const [key, value] of Object.entries(command.keysToSet)) {
                    console.log(`Setting sessionStorage: ${key} = ${value}`);
                    sessionStorage.setItem(key, value);
                }

                const topLevelLink = document.getElementById(command.targetSectionId);
                if (topLevelLink) {
                    topLevelLink.click();
                } else {
                    console.error(`Chatbot command failed: Could not find link with ID: ${command.targetSectionId}`);
                }
                return; 
            } catch (e) {
                console.error("Failed to parse chatbot navigation command:", e);
                // If parsing fails, proceed to normal page load.
            }
        }

        // Priority 2: If no command, check for a URL hash for deep linking.
        if (window.location.hash) {
            console.log(`Found URL hash: ${window.location.hash}. Navigating via hash.`);
            handleHashNavigation();
            return;
        }

        // Priority 3: If no command and no hash, restore the last generic session state.
        const savedSection = sessionStorage.getItem(`${sectionPrefix}currentSection`);
        if (savedSection && menuStructure[savedSection]) {
            console.log(`Found previous session state. Simulating click on: ${savedSection}`);
            const linkToClick = document.getElementById(savedSection);
            if (linkToClick) {
                linkToClick.click();
            }
            return;
        }
        
        // Priority 4: If nothing else, default to the 'about' page.
        console.log("No command, hash, or session state found. Defaulting to 'about' section.");
        const aboutLink = document.getElementById('about');
        if (aboutLink) {
            aboutLink.click();
        }
    }

    // Handle hash navigation
    window.addEventListener('hashchange', handleHashNavigation);
    handleHashNavigation(); // Call on initial load

    // Call the new initialization function on page load.
    initializePage();

    // ***** Expose to window AFTER definition *****
    // Note: Global exposure isn't ideal but simplifies communication between scripts here.
    window.menuStructure = menuStructure;
    window.buildMenuItems = buildMenuItems;


}); // End DOMContentLoaded