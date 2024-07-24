const bcrypt = require('bcryptjs');
const usersRouter = require('express').Router();
const User = require('../models/user');
require('dotenv').config();

usersRouter.post('/', async (request, response) => {
	const { username, name, password } = request.body;

	if (username.length < 3) {
		return response.status(400).json({
			error: 'username is too short.'
		});
	}

	if (password.length < 3) {
		return response.status(400).json({
			error: 'password is too short.'
		});
	}

	const usersInDb = await User.find({});
	usersInDb.map(user => user.toJSON());

	const usernameExists = Boolean(usersInDb.find(user => username === user.username));

	if (usernameExists) {
		return response.status(400).json({
			error: 'username already exists.'
		});
	}

	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	const user = new User({
		username,
		name,
		passwordHash,
	});

	const savedUser = await user.save();

	response.status(201).json(savedUser);
});

usersRouter.get('/', async (request, response) => {
	const users = await User
		.find({}).populate('blogs', {
			title: 1,
			author: 1,
			url: 1,
			likes: 1
		});
	response.json(users);
});

module.exports = usersRouter;