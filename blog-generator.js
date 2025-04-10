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

async function generateBlogPost() {
  try {
    console.log('Generating blog post...');
    
    // Get topics from UI/UX and AI
    const topicResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "You are an expert in UI/UX design and AI technologies. Generate an interesting, cutting-edge topic for a blog post that discusses the intersection of AI and UI/UX design."
        },
        {
          role: "user", 
          content: "Generate a compelling blog post topic related to UI/UX and artificial intelligence that would be interesting for designers and developers."
        }
      ],
      temperature: 0.8
    });
    
    const topic = topicResponse.choices[0].message.content.trim();
    console.log(`Topic generated: ${topic}`);
    
    // Generate full blog post
    const blogResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: `You are an expert content writer for uiuxpowerhouse.com, creating in-depth, valuable blog posts about UI/UX design and AI technology. Write in a professional but engaging tone. Include practical insights and forward-thinking ideas.`
        },
        {
          role: "user", 
          content: `Write a comprehensive, detailed blog post on the topic: "${topic}". 
          
          Format the content as HTML with proper headings (h1, h2, h3), paragraphs, and lists. 
          Include at least 5 sections with meaningful subheadings.
          The blog should be at least 1500 words and cover the topic thoroughly.
          Include relevant examples, case studies, or practical applications where appropriate.
          
          The output should be clean HTML that can be directly included in a JSON field.
          Wrap the entire content in <html><head><title>TITLE</title></head><body>CONTENT</body></html> tags.
          Do not include any JavaScript.`
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
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
          Choose from these options: Design, Technology, Web Development, User Experience, AI, Research, Collaboration, Animation, UI/UX.
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
    
    // Read the existing blogs.json file
    const blogsFilePath = path.join(process.cwd(), 'blogs', 'blogs.json');
    const blogsData = fs.readFileSync(blogsFilePath, 'utf8');
    
    // Parse the JSON
    const blogs = JSON.parse(blogsData);
    
    // Add the new blog post
    if (Array.isArray(blogs)) {
      blogs.push(newBlogPost);
      
      // Write the updated JSON back to the file
      fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 4), 'utf8');
      console.log('Blog post added successfully!');
    } else {
      throw new Error('Invalid blogs.json format: not an array');
    }
    
  } catch (error) {
    console.error('Error generating blog post:', error);
    process.exit(1);
  }
}

// Run the function
generateBlogPost();