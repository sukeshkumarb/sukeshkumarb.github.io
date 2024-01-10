var blogsData = []; // Holds the fetched blog data
$(document).ready(function () {

    // Utility function to create a URL-friendly slug from a title
    function createSlug(title) {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Registers Handlebars helpers
    Handlebars.registerHelper('slugify', function (title) {
        return createSlug(title);
    });

    Handlebars.registerHelper('join', function (context, options) {
        return context.join(options.hash.separator);
    });

    // Register a Handlebars helper for date formatting
    Handlebars.registerHelper('formatDate', function (dateString) {
        return formatDate(dateString);
    });

    // Utility function to format dates
    function formatDate(dateString) {
        var options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    Handlebars.registerHelper('each_upto', function (array, max, options) {
        if (!array || array.length == 0)
            return options.inverse(this);

        var result = [];
        for (var i = 0; i < max && i < array.length; ++i)
            result.push(options.fn(array[i]));
        return result.join('');
    });


    // Fetches blog data, adds slug for each blog, and renders it
    function fetchBlogsData(callback) {
        $.getJSON('blogs/blogs.json', function (data) {
            blogsData = data.map(function (blog) {
                blog.slug = createSlug(blog.title); // Add slug property to each blog
                return blog;
            });

            // Sort blogs by date in descending order
            blogsData.sort(function (a, b) {
                return new Date(b.postedOn) - new Date(a.postedOn);
            });

            if (typeof callback === "function") {
                callback(); // Callback to handle query parameters after data is loaded
            }
            renderBlogs(blogsData); // Render all blogs by default
        });
    }

    // Renders blogs using Handlebars
    function renderBlogs(blogs) {
        var template = $('#blog-template').html();

        var compiledTemplate = Handlebars.compile(template);
        var renderedHTML = compiledTemplate({ blogs: blogs });
        $('#blog-posts').html(renderedHTML);
    }

    // Renders a single blog detail based on the slug
    function renderBlogDetail(slug) {
        var blogDetail = blogsData.find(blog => blog.slug === slug);
        if (blogDetail) {
            var detailTemplate = $('#blog-detail-template').html();
            var compiledDetailTemplate = Handlebars.compile(detailTemplate);
            var detailHTML = compiledDetailTemplate(blogDetail);
            $('#blog-detail').html(detailHTML).show();
            $('#blog-posts').hide();
        } else {
            console.error('Blog not found:', slug);
        }
    }

    // Function to get URL parameter by name
    function getQueryParam(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : results[1];
    }

    // Check if a specific blog needs to be displayed based on the slug
    function checkForBlogDetail() {
        var blogSlug = getQueryParam('title');
        if (blogSlug) {
            renderBlogDetail(blogSlug);
        }
    }

    // Function to fetch and render recent posts
    function fetchAndRenderRecentPosts() {
        // Replace 'path/to/recent-posts.json' with the path to your recent posts data
        $.getJSON('blogs/blogs.json', function (data) {
            // Sort posts by date in descending order and take the first three
            var recentPosts = data.sort(function (a, b) {
                // Assumes 'postedOn' is in a format that can be compared directly, like 'YYYY-MM-DD'
                return new Date(b.postedOn) - new Date(a.postedOn);
            }).slice(0, 3);

            var recentPostsTemplate = $('#recent-posts-template').html();
            var compiledTemplate = Handlebars.compile(recentPostsTemplate);
            var renderedHTML = compiledTemplate({ recentPosts: recentPosts });
            $('#recent-posts-list').html(renderedHTML);
        });
    }

    // Function to render blogs by category
    function renderBlogsByCategory(category) {
        // Filter blogs by category
        var filteredBlogs = blogsData.filter(function (blog) {
            return blog.categories.includes(category);
        });
        console.log(filteredBlogs)
        renderBlogs(filteredBlogs);
    }

    // Function to fetch and render categories
    function fetchAndRenderCategories() {
        // Assuming categories are calculated from blogs.json
        $.getJSON('blogs/blogs.json', function (data) {
            // Calculate category counts
            var categories = data.reduce(function (acc, blog) {
                blog.categories.forEach(function (category) {
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(blog);
                });
                return acc;
            }, {});

            var categoryTemplate = $('#category-template').html();
            var compiledTemplate = Handlebars.compile(categoryTemplate);
            var renderedHTML = compiledTemplate({ categories: categories });
            $('#category-list').html(renderedHTML);
        });
    }


    // Calls the initial fetch of blog data and checks for a specific blog detail
    fetchBlogsData(checkForBlogDetail);
    fetchAndRenderRecentPosts();
    fetchAndRenderCategories();


    // Listens for clicks on blog titles or "Read More" buttons
    $(document).on('click', '.blog-title-link, .btn-read-more', function (e) {
        e.preventDefault();
        var slug = $(this).data('slug');
        history.pushState(null, '', '?title=' + slug); // Update the URL with the slug
        renderBlogDetail(slug);
    });

    // Handle category clicks
    $(document).on('click', '.category-item', function () {
        var category = $(this).data('category');
        renderBlogsByCategory(category);
        // Optionally update the URL or page content to reflect the category filter
    });


});
