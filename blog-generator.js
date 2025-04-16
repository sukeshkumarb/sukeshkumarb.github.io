const fs = require('fs');
const { OpenAI } = require('openai');
const path = require('path');

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Current date formatting function
function formatDate() {
  const date = new Date();
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

// Generate a random image name
function generateImageName(title) {
  const sanitized = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  return `blogs/images/${sanitized}.png`;
}

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
    const blogsData = fs.readFileSync(blogsFilePath, 'utf8');
    const blogs = JSON.parse(blogsData);
    
    // Extract existing titles for similarity checking
    const existingTitles = blogs.map(blog => blog.title);
    
    console.log(`Generating ${NUM_POSTS_TO_GENERATE} blog posts...`);
    
    // Generate multiple posts
    for (let i = 0; i < NUM_POSTS_TO_GENERATE; i++) {
      console.log(`\nGenerating blog post ${i+1}/${NUM_POSTS_TO_GENERATE}...`);
      
      let topic;
      let isUnique = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 5;
      
      // Keep generating topics until we find a unique one
      while (!isUnique && attempts < MAX_ATTEMPTS) {
        attempts++;
        
        // Topic generation with enhanced diversity prompting
        const topicResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system", 
              content: "You are an expert in UI/UX design, frontend web development, and modern web technologies. Generate an interesting, cutting-edge topic for a blog post that covers UI/UX design principles, frontend development techniques, or the integration of AI in web interfaces. Be specific and unique - avoid general topics that might have been covered repeatedly."
            },
            {
              role: "user", 
              content: `Generate a highly specific and unique blog post topic related to UI/UX design, frontend web development, or the integration of AI in web interfaces that would be interesting for designers and developers. 
              
              Your website focuses on UI/UX and frontend web development, so topics should cover a wide range of areas including:
              
              UI/UX Design Topics:
              - Modern UI/UX design principles and techniques
              - User research and usability testing
              - Information architecture and content strategy
              - Visual design and branding
              - Interaction design patterns
              - Mobile-first and responsive design
              - Accessibility and inclusive design
              - Design systems and component libraries
              - User journey mapping and experience design
              - Microinteractions and animation in UI
              
              Frontend Development Topics:
              - Frontend frameworks and libraries (React, Vue, Angular, etc.)
              - CSS techniques (Grid, Flexbox, Custom Properties, etc.)
              - JavaScript best practices and patterns
              - Web performance optimization
              - Progressive Web Apps (PWAs)
              - Web accessibility implementation
              - Cross-browser compatibility
              - Web animation techniques
              - State management in frontend applications
              - API integration and data fetching
              - Form validation and user input handling
              - Web security best practices
              - Testing frontend applications
              - Build tools and bundlers
              - Web components and custom elements
              
              AI Integration Topics (but not exclusively):
              - AI-powered UI components
              - Machine learning in user interfaces
              - Natural language processing for web applications
              - Computer vision in web interfaces
              - AI-assisted design tools
              - Personalization algorithms in web experiences
              - AI for accessibility improvements
              - AI-powered content generation for websites
              - AI for performance optimization
              - AI for user behavior analysis
              - AI-powered chatbots and virtual assistants
              - AI for form validation and error prevention
              - AI-driven A/B testing and optimization
              - AI for image and media optimization
              - AI for code generation and development assistance
              - AI for automated UI testing
              - AI for predictive analytics in web applications
              - AI for voice user interfaces (VUI)
              - AI for gesture recognition in web interfaces
              - AI for real-time translation in web applications
              - AI for recommendation engines in e-commerce
              - AI for fraud detection in web applications
              - AI for sentiment analysis in user feedback
              - AI for automated accessibility testing
              - AI for dynamic content personalization
              - AI for intelligent search functionality
              - AI for automated UI/UX improvements
              - AI for code review and quality assurance
              - AI for automated documentation generation
              - AI for intelligent form autofill and validation
              
              Ensure the topic is novel and hasn't likely been covered in standard blogs. Focus on emerging trends, specific use cases, or innovative approaches in these fields.`
            }
          ],
          temperature: 0.9  // Increased temperature for more creativity
        });
        
        topic = topicResponse.choices[0].message.content.trim();
        console.log(`Topic generated (attempt ${attempts}): ${topic}`);
        
        // Check if the topic is similar to existing titles
        isUnique = !isTitleSimilar(topic, existingTitles);
        
        if (!isUnique) {
          console.log(`Topic is too similar to existing posts. Generating a new one...`);
        }
      }
      
      if (!isUnique) {
        console.log(`Warning: Could not generate a unique topic after ${MAX_ATTEMPTS} attempts. Using the last generated topic.`);
      }
      
      // Add the 750-word limit to your prompt
      const blogResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using the cheaper model
        messages: [
          {
            role: "system", 
            content: `You are an expert content writer for uiuxpowerhouse.com, creating in-depth, valuable blog posts about UI/UX design, frontend web development, and modern web technologies. Write in a professional but engaging tone. Include practical insights, code examples where appropriate, and forward-thinking ideas. Your content should be informative, actionable, and reflect current best practices in the industry.`
          },
          {
            role: "user", 
            content: `Write a comprehensive blog post on the topic: "${topic}". 
            
            The blog MUST BE LIMITED TO 750 WORDS MAXIMUM.
            
            Format the content as HTML with proper headings (h1, h2, h3), paragraphs, and lists. 
            Include 3-4 sections with meaningful subheadings.
            
            For technical topics, include relevant code examples or snippets that demonstrate the concepts.
            For design topics, include descriptions of design principles and visual elements.
            For all topics, include practical applications and real-world examples where appropriate.
            
            The content should be:
            - Informative and educational
            - Well-structured with clear sections
            - Include practical tips and best practices
            - Reference current trends and technologies
            - Avoid overly technical jargon unless necessary
            - Include a brief introduction and conclusion
            
            The output should be clean HTML that can be directly included in a JSON field.
            Wrap the entire content in <html><head><title>TITLE</title></head><body>CONTENT</body></html> tags.
            Do not include any JavaScript.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000  // Reduce this to help enforce the word limit
      });
      
      const blogContent = blogResponse.choices[0].message.content.trim();
      
      // Generate tags
      const tagsResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: "You are an expert in SEO and content categorization. Generate relevant tags for a blog post."
          },
          {
            role: "user", 
            content: `Generate 6-8 relevant tags for a blog post with this title: "${topic}". 
            Return only the tags as a comma-separated list with no additional text.`
          }
        ],
        temperature: 0.7
      });
      
      const tagsString = tagsResponse.choices[0].message.content.trim();
      const tags = tagsString.split(',').map(tag => tag.trim());
      
      // Generate categories
      const categoriesResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system", 
            content: "You are an expert in content categorization. Generate relevant categories for a blog post."
          },
          {
            role: "user", 
            content: `Generate 2-3 broad categories for a blog post with this title: "${topic}". 
            Choose from these options: 
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
            
            Return only the categories as a comma-separated list with no additional text.`
          }
        ],
        temperature: 0.7
      });
      
      const categoriesString = categoriesResponse.choices[0].message.content.trim();
      const categories = categoriesString.split(',').map(category => category.trim());
      
      // Extract title from the blog content
      let title = topic;
      const titleMatch = blogContent.match(/<title>(.*?)<\/title>/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
      }
      
      // Create the new blog post object
      const newBlogPost = {
        title: title,
        body: blogContent,
        postedOn: formatDate(),
        tags: tags,
        categories: categories,
        author: "UI UX Powerhouse",
        bannerImage: generateImageName(title)
      };
      
      // Add to existing titles for future similarity checks in this batch
      existingTitles.push(title);
      
      // Instead of writing to file each time, just add to the blogs array
      if (Array.isArray(blogs)) {
        blogs.push(newBlogPost);
        console.log(`Blog post ${i+1} added to memory!`);
      } else {
        throw new Error('Invalid blogs.json format: not an array');
      }
    }
    
    // Write the updated array with all new posts to the file once
    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 4), 'utf8');
    console.log(`All ${NUM_POSTS_TO_GENERATE} blog posts added successfully!`);
    
  } catch (error) {
    console.error('Error generating blog posts:', error);
    process.exit(1);
  }
}

// Call the new function instead
generateMultiplePosts();