const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(url)
	.then(() => {
		console.log('connected to MongoDB');
		const blogSchema = new mongoose.Schema({
			title: String,
			author: String,
			url: String,
			likes: Number,
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			}
		});

		const Blog = mongoose.model('Blog', blogSchema);

		Blog.find({}).then(result => {
			result.forEach(blog => {
				console.log(blog);
			});
			mongoose.connection.close();
		});
	});