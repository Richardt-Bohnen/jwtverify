const Blog = require('../models/blog.js');
const User = require('../models/user.js');
require('dotenv').config();

// NOTE: user prop is commented for testing when no user given when creating a blog.
const initialBlogs = [
	{
		_id: '5a422a851b54a676234d17f7',
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7,
		// user: '669fafb31568af3e6ac97cf3'
	}
];

const usersInDb = async () => {
	const users = await User.find({});
	return users.map(user => user.toJSON());
};

const blogsInDb = async () => {
	const blogs = await Blog.find({});
	return blogs.map(blog => blog.toJSON());
};

module.exports = {
	initialBlogs,
	blogsInDb,
	usersInDb
};