const { categories } = require('../config/category')
const { User, ReadArticle } = require('./database/mongooseSchema')

module.exports = {
	getUsers: async () => {
		const users = await User.find().lean()
		return users
	},

	removeUnRegisteredUser: async (fcmToken) => {
		const response = await User.findOneAndUpdate({ fcmToken }, { status: 'inactive' }, { useFindAndModify: false })
		return response
	},

	calculateUserSpecificWeight: async (nid) => {
		if (!nid) return []
		const userReadArticles = await ReadArticle.findOne({ nid })
		if (!userReadArticles) return []
		const myArticles = userReadArticles.article || []
		const readArticleLength = myArticles.length
		let catWeightArr = []
		categories.forEach((category) => {
			let catArticlesLength = myArticles.filter((x) => x.category == category.name).length
			let weight = (catArticlesLength / readArticleLength) * 10
			catWeightArr.push({ category: category.name, weight })
		})
		return catWeightArr
	},
}
