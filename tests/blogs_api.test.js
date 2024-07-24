const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const bcrypt = require('bcryptjs');
require('dotenv').config();

const helper = require('./test_helper.js');
const User = require('../models/user');
const Blog = require('../models/blog');

// TODO FOR FUTURE EXERCISE: Fix all erros. most are due to lack of authorization.
// Suggestion: move `beforeEach` to beggining of file and populate
// with an initial user and blog

describe('BlogTests: When initial blogs exist', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		await Blog.insertMany(helper.initialBlogs);
	});

	test('blogs are returned as json', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/);
	});

	test('there are two blogs', async () => {
		const response = await api.get('/api/blogs');
		assert.strictEqual(response.body.length, 2);
	});

	test('the first blog is about React patterns', async () => {
		const response = await api.get('/api/blogs');
		const contents = response.body.map(blog => blog.title);
		assert(contents.includes('React patterns'));
	});

	test('Succeeds with valid id', async () => {
		const blogsBefore = await helper.blogsInDb();
		const blogToValidate = blogsBefore[0];

		const resultBlog = await api
			.get(`/api/blogs/${blogToValidate.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/);

		assert.deepStrictEqual(resultBlog.body, blogToValidate);
	});
});

describe('BlogTests: addition of a new blog', () => {
	beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('SecretePassword', 10);
		const user = new User({ username: 'Alpha', passwordHash });

		await user.save();
		await Blog.deleteMany({});

		await Blog.insertMany(helper.initialBlogs);
		await User.insertMany(helper.initialUsers);
	});

	test('succeeds with valid data', async () => {
		const newBlog = {
			title: 'Delta Title',
			author: 'Delta author',
			url: 'Delta url',
			likes: 2
		};

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const blogsAfter = await helper.blogsInDb();
		assert.strictEqual(blogsAfter.length, helper.initialBlogs.length + 1);

		const blogTitles = blogsAfter.map(blog => blog.title);
		assert(blogTitles.includes('Delta Title'));
	});

	test('Succeeds with valid id', async () => {
		const blogsBefore = await helper.blogsInDb();

		const blogToValidate = blogsBefore[0];

		const resultBlog = await api
			.get(`/api/blogs/${blogToValidate.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/);

		assert.deepStrictEqual(resultBlog.body, blogToValidate);
	});
});

describe('BlogTest: deletion of blog', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		await Blog.insertMany(helper.initialBlogs);
	});

	test('succeeds with status code 204 if blog is deleted', async () => {
		const blogsBefore = await helper.blogsInDb();
		const blogToDelete = blogsBefore[0];

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.expect(204);

		const blogsAfter = await helper.blogsInDb();

		assert.strictEqual(blogsAfter.length, helper.initialBlogs.length - 1);

		const blogTitles = blogsAfter.map(blog => blog.title);
		assert(!blogTitles.includes(blogToDelete.title));
	});
});

describe('UserTest: when there is initially one user in db', () => {
	beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('SecretePassword', 10);
		const user = new User({ username: 'Alpha', passwordHash });

		await user.save();
	});

	test('creation succeeds with a new username', async () => {
		const usersBefore = await helper.usersInDb();

		const newUser = {
			username: 'Bravo username',
			name: 'Bravo name',
			password: 'Bravo password',
		};

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const usersAfter = await helper.usersInDb();
		assert.strictEqual(usersAfter.length, usersBefore.length + 1);

		const usernames = usersAfter.map(user => user.username);
		assert(usernames.includes(newUser.username));
	});

	// Note: this test depends on Mongoose validation, which is not ideal.
	test('creation fails with 400 statuscode and message if username already taken', async () => {
		const usersBefore = await helper.usersInDb();

		const newUser = {
			username: 'Alpha',
			name: 'Bravo name',
			password: 'Bravo password',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAfter = await helper.usersInDb();
		assert(result.body.error.includes('username already exists.'));

		assert.strictEqual(usersAfter.length, usersBefore.length);
	});

	test('non-magnoose validation creation fails with 400 if name field less than 3', async () => {
		const usersBefore = await helper.usersInDb();

		const newUser = {
			username: 'A',
			name: 'Alphaname',
			password: 'Alphapassword',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAfter = await helper.usersInDb();
		assert(result.body.error.includes('username is too short.'));

		assert.strictEqual(usersAfter.length, usersBefore.length);
	});

	test('non-magnoose validation creation fails with 400 if password field less than 3', async () => {
		const usersBefore = await helper.usersInDb();

		const newUser = {
			username: 'ALphausername',
			name: 'Alphaname',
			password: 'A',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAfter = await helper.usersInDb();
		assert(result.body.error.includes('password is too short.'));

		assert.strictEqual(usersAfter.length, usersBefore.length);
	});

	test('no given userId prop for blog assigns first user in db Id', async () => {
		const blogsBefore = await helper.blogsInDb();

		const newBlog = {
			title: 'AlphaBlogAnyUser',
			author: 'AlphaAuthorAnyUser',
			url: 'AlphaUrlAnyUser',
			likes: 1
		};

		await api
			.post('/api/blogs')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const blogsAfter = await helper.blogsInDb();
		assert.strictEqual(blogsAfter.length, blogsBefore.length + 1);

		const blogUsers = blogsAfter.map(blog => blog.user);
		assert(blogUsers.includes(newBlog.blogUsers));

		assert.strictEqual(blogsAfter.length, blogsBefore.length + 1);
	});
});

after(async () => {
	await User.deleteMany({});
	await mongoose.connection.close();
});