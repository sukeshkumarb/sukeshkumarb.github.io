const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

// Initialize Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to call Gemini with system + user messages
async function geminiChat(systemPrompt, userPrompt, temperature = 0.7) {
  const result = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature
    }
  });
  return result.text.trim();
}

// Current date formatting function
function formatDate() {
  const date = new Date();
  // Note: Adjusting based on the provided current time context if needed,
  // but typically you'd want the actual server date.
  // Using standard Date methods which rely on the server's clock.
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// Generate image file name (png, from Imagen)
function generateImageName(title) {
  const sanitized = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return `blogs/images/${sanitized}.png`;
}

// ===== IMAGE GENERATION FUNCTIONS =====

// Generate a banner image using Imagen 3 and save it as a PNG
async function generateBannerImage(title, outputPath) {
  const imagePrompt =
    `A visually striking, professional 16:9 blog banner image for an article titled: "${title}". ` +
    `The image should be modern, tech-focused, and abstract — using bold colors, clean geometry, ` +
    `or conceptual illustration. Dark background. No text or letters in the image. ` +
    `Style: futuristic digital art, suitable for a UI/UX and frontend development blog.`;

  const response = await genAI.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: imagePrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
      outputMimeType: 'image/png'
    }
  });

  const imageData = response.generatedImages?.[0]?.image?.data;
  if (!imageData) {
    throw new Error(`Imagen returned no image data for title: "${title}"`);
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
  console.log(`  ✅ Banner image created: ${outputPath}`);
}

// ===== END IMAGE GENERATION FUNCTIONS =====

// Add this near the top of your file
const NUM_POSTS_TO_GENERATE = 3;
const SIMILARITY_THRESHOLD = 0.6; // Adjust this value between 0 and 1 as needed

// Function to check if the new topic is similar to existing titles
function isTitleSimilar(newTitle, existingTitles) {
  const normalizedNewTitle = newTitle.toLowerCase();

  // Check for exact duplicates first
  if (existingTitles.some(title => title.toLowerCase() === normalizedNewTitle)) {
    return true;
  }

  // Check for significant word overlap
  const newTitleWords = new Set(normalizedNewTitle.split(/\W+/).filter(word => word.length > 3));

  for (const existingTitle of existingTitles) {
    const existingTitleWords = new Set(existingTitle.toLowerCase().split(/\W+/).filter(word => word.length > 3));

    // Calculate Jaccard similarity
    const intersection = new Set([...newTitleWords].filter(word => existingTitleWords.has(word)));
    const union = new Set([...newTitleWords, ...existingTitleWords]);

    if (union.size === 0) continue;

    const similarity = intersection.size / union.size;
    if (similarity >= SIMILARITY_THRESHOLD) {
      return true;
    }
  }

  return false;
}

async function generateMultiplePosts() {
  try {
    // Read the existing blogs.json file first (just once)
    const blogsFilePath = path.join(process.cwd(), 'blogs', 'blogs.json');
    let blogs = []; // Initialize as empty array
    // Ensure the directory exists
    const blogsDir = path.dirname(blogsFilePath);
    if (!fs.existsSync(blogsDir)) {
        fs.mkdirSync(blogsDir, { recursive: true });
    }
    // Try reading the file, default to empty array if it doesn't exist or is invalid
    if (fs.existsSync(blogsFilePath)) {
        try {
            const blogsData = fs.readFileSync(blogsFilePath, 'utf8');
            const parsedData = JSON.parse(blogsData);
            if (Array.isArray(parsedData)) {
                blogs = parsedData;
            } else {
                console.warn("Warning: blogs.json does not contain a valid JSON array. Starting with an empty list.");
            }
        } catch (readError) {
            console.warn(`Warning: Could not read or parse blogs.json (${readError.message}). Starting with an empty list.`);
        }
    } else {
        console.log("blogs.json not found. A new file will be created.");
    }


    // Extract existing titles for similarity checking
    const existingTitles = blogs.map(blog => blog.title);

    console.log(`Generating ${NUM_POSTS_TO_GENERATE} blog posts...`);

    // Generate multiple posts
    for (let i = 0; i < NUM_POSTS_TO_GENERATE; i++) {
      console.log(`\nGenerating blog post ${i + 1}/${NUM_POSTS_TO_GENERATE}...`);

      let topic;
      let isUnique = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 5;

      // Keep generating topics until we find a unique one
      while (!isUnique && attempts < MAX_ATTEMPTS) {
        attempts++;

        // --- Topic Generation Section ---
        topic = await geminiChat(
          `You are an expert content strategist specializing in UI/UX design, frontend development, and modern web technologies, including their practical application and integration (like AI). Your goal is to generate *diverse* and *highly specific* blog post topics suitable for an audience of experienced designers and developers.`,
          `Generate **one** highly specific and unique blog post topic for uiuxpowerhouse.com.

                **Crucially, aim for significant diversity across different requests.** Avoid repeatedly generating topics focused *only* on abstract AI concepts (like 'empathetic AI' or 'emotional design interfaces') unless it involves a *very concrete*, novel technical implementation or a specific, uncommon design pattern analysis.

                Ensure the topics span across these core domains, focusing on practical, actionable insights, niche techniques, or comparative analyses:

                1.  **Advanced UI/UX Design:** Think beyond fundamentals. Consider specific usability challenges, niche interaction patterns (e.g., designing for complex data tables, gesture interactions on the web), data-driven design workflows, advanced accessibility techniques (e.g., WCAG 2.2 specifics), or the UX of emerging technologies (e.g., AR/VR interfaces on the web).
                    * *Example Specificity:* Instead of "Mobile Design", suggest "Optimizing Touch Target Sizes for Complex Mobile Forms on High-Density Displays". Instead of "Design Systems", suggest "Strategies for Versioning and Deprecating Components in Large-Scale Design Systems".

                2.  **Specific Frontend Development Techniques:** Focus on practical implementation details, performance optimization for specific scenarios, new/underutilized browser APIs, comparisons of specific library features, or modern CSS/JS capabilities.
                    * *Example Specificity:* Instead of "React Hooks", suggest "Leveraging the useTransition Hook in React 18 for Non-Blocking UI Updates". Instead of "CSS Grid", suggest "Creating Intrinsic Magazine-Style Layouts with CSS Grid and Subgrid". Instead of "Web Performance", suggest "Diagnosing and Fixing Interaction to Next Paint (INP) Issues in Single Page Applications".

                3.  **Practical AI Integration in Web Interfaces:** Focus on *how* AI can be *implemented* or *utilized* for tangible benefits in UI/UX or development workflows, specific tools, ethical considerations of *concrete* use cases, or performance implications.
                    * *Example Specificity:* Instead of "AI in UX", suggest "Implementing Real-time Form Validation Assistance using TensorFlow.js". Instead of "AI chatbots", suggest "Designing Effective Fallback Strategies for AI Chatbots When NLP Fails". Instead of "AI for Devs", suggest "Using AI-Powered Tools (like GitHub Copilot) for Automated Frontend Unit Test Generation: Benefits and Pitfalls".

                **Requirements:**
                * The topic must be **specific and actionable**, not general.
                * It should feel **fresh and insightful**, avoiding commonly rehashed subjects.
                * It must be relevant to **experienced** UI/UX designers or frontend developers.

                **Output only the suggested blog post title as a single line of text.**`,
          0.85
        );
        // --- End of Topic Generation Section ---
        // Remove potential quotes around the topic
        topic = topic.replace(/^"|"$/g, '');
        console.log(`Topic generated (attempt ${attempts}): ${topic}`);

        // Check if the topic is similar to existing titles
        isUnique = !isTitleSimilar(topic, existingTitles);

        if (!isUnique) {
          console.log(`Topic is too similar to existing posts. Generating a new one...`);
        }
      }

      if (!isUnique) {
        console.log(`Warning: Could not generate a unique topic after ${MAX_ATTEMPTS} attempts. Using the last generated topic: "${topic}"`);
      }

      const blogContent = await geminiChat(
        `You are an expert content writer for uiuxpowerhouse.com, creating in-depth, valuable blog posts about UI/UX design, frontend web development, and modern web technologies. Write in a professional but engaging tone. Include practical insights, code examples where appropriate, and forward-thinking ideas. Your content should be informative, actionable, and reflect current best practices in the industry.`,
        `Write a comprehensive blog post on the topic: "${topic}".

            The blog MUST BE LIMITED TO approximately 750 WORDS MAXIMUM. Aim for clarity and conciseness while being thorough.

            Format the content as clean HTML suitable for embedding. Use proper semantic elements:
            - One \`<h1>\` for the main title (use the provided topic).
            - \`<h2>\` or \`<h3>\` for section headings.
            - \`<p>\` for paragraphs.
            - \`<ul>\`/\`<ol>\`/\`<li>\` for lists.
            - \`<pre><code>\` for code blocks (specify language if possible, e.g., \`<pre><code class="language-javascript">\`). Use \`<code>\` for inline code.
            - \`<strong>\` or \`<em>\` for emphasis where appropriate.

            Structure the post with:
            1. A brief introduction explaining the topic and its relevance.
            2. 3-4 main sections with meaningful subheadings (\`<h2>\` or \`<h3>\`).
            3. A concluding summary.

            Content Requirements:
            - Include practical tips, best practices, or actionable advice.
            - Use code examples for technical topics or detailed descriptions for design topics.
            - Reference current trends or technologies where relevant.
            - Explain technical terms concisely if necessary.
            - Maintain a professional yet engaging tone.

            Output ONLY the HTML content for the blog post body. Do NOT include \`<html>\`, \`<head>\`, \`<title>\`, or \`<body>\` tags. Do NOT include any JavaScript.`,
        0.7
      );

      // Generate tags
      const tagsString = await geminiChat(
        "You are an expert in SEO and content categorization. Generate relevant tags for a blog post.",
        `Generate 6-8 relevant, specific tags for a blog post titled: "${topic}". Consider the key concepts, technologies, and disciplines mentioned or implied.
            Return only the tags as a comma-separated list (e.g., tag1, tag2, tag3) with no introductory text or explanations.`,
        0.7
      );
      const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      // Generate categories
      const categoriesString = await geminiChat(
        "You are an expert in content categorization. Select relevant categories for a blog post from a predefined list.",
        `Based on the blog post title: "${topic}", select 2-3 *most relevant* broad categories from the list below.

            Available Categories:
            - Design (UI Design, Visual Design, Interaction Design)
            - User Experience (UX Research, Usability, Information Architecture)
            - Frontend Development (JavaScript, React, Vue, Angular)
            - CSS (Styling, Layout, Animation)
            - Web Performance (Optimization, Loading Speed, Core Web Vitals)
            - Accessibility (WCAG, Inclusive Design, Assistive Technology)
            - Web Components (Custom Elements, Shadow DOM, Component Libraries)
            - Progressive Web Apps (PWA, Service Workers, Offline Support)
            - AI Integration (Machine Learning, NLP, Computer Vision)
            - AI Development (AI Tools, Frameworks, Libraries)
            - AI Applications (Chatbots, Assistants, Automation)
            - AI for Design (AI Design Tools, Generative Design)
            - AI for Development (Code Generation, Testing, Documentation)
            - AI for UX (Personalization, Analytics, Optimization)
            - Web Security (Authentication, Authorization, Data Protection)
            - Testing (Unit Testing, E2E Testing, Performance Testing)
            - Build Tools (Bundlers, Task Runners, Package Managers)
            - Responsive Design (Mobile-First, Breakpoints, Fluid Layouts)
            - API Integration (REST, GraphQL, Data Fetching)
            - State Management (Redux, Context API, State Machines)

            Return only the selected category names as a comma-separated list (e.g., Frontend Development, Web Performance) with no introductory text or explanations.`,
        0.5
      );
      const categories = categoriesString.split(',').map(category => category.trim()).filter(category => category.length > 0);

      // Use the generated (and potentially deduplicated) topic as the title
      const title = topic;

      // Create the new blog post object
      const newBlogPost = {
        title: title,
        body: blogContent, // Contains only the HTML body content now
        postedOn: formatDate(),
        tags: tags,
        categories: categories,
        author: "UI UX Powerhouse",
        bannerImage: generateImageName(title) // Generates path like 'blogs/images/my-topic-title.svg'
      };

      // Generate the actual banner image file via Imagen 3
      const imagePath = path.join(process.cwd(), newBlogPost.bannerImage);
      await generateBannerImage(title, imagePath);

      // Add to existing titles for future similarity checks in this batch
      existingTitles.push(title);

      // Add the new post object to the array in memory
      blogs.push(newBlogPost);
      console.log(`Blog post "${title}" added to memory!`);

    } // End of for loop generating posts

    // Write the updated array with all new posts to the file once
    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2), 'utf8'); // Using 2 spaces for indentation
    console.log(`\nSuccessfully generated and saved ${NUM_POSTS_TO_GENERATE} blog posts to ${blogsFilePath}!`);

  } catch (error) {
    console.error('Error generating blog posts:', error);
    if (error.response) {
      console.error("API Error Details:", error.response.data);
    }
    process.exit(1);
  }
}

// Call the function to generate posts
generateMultiplePosts();