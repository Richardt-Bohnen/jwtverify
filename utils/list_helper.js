const Blog = require('../models/blog.js');
const User = require('../models/user.js');

const dummy = () => {
	return 1;
};

const totalLikes = (blogs) => {
	return blogs.reduce(
		(accumulator, currentValue, index) => {
			return accumulator + blogs[index].likes;
		}, 0);
};

const favoriteBlog = (blogs) => {
	let mostLiked = blogs.reduce((most, blog) => most.likes > blog.likes ? most : blog);
	const { author, title, likes } = mostLiked;
	const result = { author, title, likes };
	return result;
};

const mostBlogs = (blogs) => {
	const authorsMap = new Map();

	for (const blog of blogs) {
		const currentAuthor = authorsMap.get(blog.author) || 0;
		authorsMap.set(blog.author, currentAuthor + 1);
	}

	let mostBlogAuthor = { author: '', blogs: -1 };
	for (const [key, value] of authorsMap.entries()) {
		if (value > mostBlogAuthor.blogs) {
			mostBlogAuthor = { author: key, blogs: value };
		}
	}

	return mostBlogAuthor;
};

const mostLikes = (blogs) => {
	const authorsMap = new Map();

	for (const blog of blogs) {
		const currentAuthorLikes = authorsMap.get(blog.author) || 0;
		authorsMap.set(blog.author, currentAuthorLikes + blog.likes);
	}

	let mostBlogAuthor = { author: '', likes: -1 };
	for (const [key, value] of authorsMap.entries()) {
		if (value > mostBlogAuthor.likes) {
			mostBlogAuthor = { author: key, likes: value };
		}
	}

	return mostBlogAuthor;
};

const usersInDb = async () => {
	const users = await User.find({});
	return users.map(user => user.toJSON());
};

const blogsInDb = async () => {
	const blogs = await Blog.find({});
	return blogs.map(blog => blog.toJSON());
};

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes,
	usersInDb,
	blogsInDb
};