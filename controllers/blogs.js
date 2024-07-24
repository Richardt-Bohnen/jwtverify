const blogsRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');
const middleware = require('../utils/middleware.js');
require('dotenv').config();

blogsRouter.post('/', middleware.tokenExtractor, async (request, response) => {
	const decodedToken = jwt.verify(request.token, process.env.SECRET); // invalid signature

	if (!decodedToken.id) {
		return response.status(401).jason({ error: 'token invalid' });
	}

	const body = request.body;
	let user = request.user;

	// assign first user, assuming there is a user in db
	if (!user) {
		const usersInDb = await User.find({});
		user = usersInDb[0];
	}

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: user._id
	});

	user.blogs = user.blogs.concat(blog);
	await user.save();

	const savedBlog = await blog.save();

	response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', middleware.tokenExtractor, async (request, response) => {
	const decodedToken = jwt.verify(request.token, process.env.JWT_SECRET);

	if (!decodedToken.id) {
		return response.status(401).jason({ error: 'token invalid' });
	}

	(request, response) => {
		const decodedToken = jwt.verify(request.token, process.env.SECRET);

		if (!decodedToken.id) {
			return response.status(401).jason({ error: 'token invalid' });
		}
	};

	const userid = await User.findById(decodedToken.id);

	const blog = await Blog.findById(request.params.id);
	console.log('- blog.user._id :>> ', blog.user._id.toString());


	if (blog.user.toString() !== userid.id.toString()) {
		return response.status(401).json({ error: 'Not an authenticated user' });
	}

	await Blog.findByIdAndDelete(request.params.id);

	response.status(204).end();

});

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog
		.find({}).populate('user', { username: 1, name: 1 });
	response.json(blogs);
});

blogsRouter.get('/:id', async (request, response) => {
	const blog = await Blog.findById(request.params.id);
	if (blog) {
		response.json(blog);
	} else {
		response.status(404).end();
	}
});

module.exports = blogsRouter;