const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');
const { testBlogs } = require('./blogsForTest.js');

test('dummy returns one', () => {
	const blogs = [];
	const result = listHelper.dummy(blogs);
	assert.strictEqual(result, 1);
});

describe('total likes', () => {
	const listOfBlogs = [...testBlogs];
	test('returns sum of all likes', () => {
		const result = listHelper.totalLikes(listOfBlogs);
		assert.strictEqual(result, 36);
	});
});

describe('most liked', () => {
	const listOfBlogs = [...testBlogs];
	test('returns most liked blog', () => {
		const result = listHelper.favoriteBlog(listOfBlogs);
		assert.deepStrictEqual(result.likes, 12);
	});
});

describe('most blogs', () => {
	const listOfBlogs = [...testBlogs];
	const comparisonEqual = {
		author: 'Robert C. Martin',
		blogs: 3
	};
	test('returns author with most blogs', () => {
		const result = listHelper.mostBlogs(listOfBlogs);
		assert.deepStrictEqual(result, comparisonEqual);
	});
});

describe('most likes', () => {
	const listOfBlogs = [...testBlogs];
	const comparisonEqual = {
		author: 'Edsger W. Dijkstra',
		likes: 17
	};
	test('returns author who has the largest amount of likes', () => {
		const result = listHelper.mostLikes(listOfBlogs);
		assert.deepStrictEqual(result, comparisonEqual);
	});
});