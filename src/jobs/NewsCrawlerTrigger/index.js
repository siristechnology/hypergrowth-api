const NewsCrawler = require('news-crawler')
const { saveArticles } = require('../../db-service/newsDbService')
const SourceConfig = require('../../config/news-source-config.json')
const logger = require('../../config/logger')
const { getTagsFromArticle } = require('./helper')
const { Article, TrendingTopic } = require('../../db-service/database/mongooseSchema')

module.exports = async function () {
	const ipAddress = require('ip').address()

	try {
		let articles = await NewsCrawler(SourceConfig, { headless: true })
		articles = articles.filter((a) => a.imageLink !== null)

		const trendingTopics = await TrendingTopic.find()
		const savedArticles = await Article.find({ createdDate: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
		const articleWithTags = []

		const nonHeadlineArticles = articles.filter((x) => x.category !== 'headline')
		const savedHeadlineArticles = savedArticles.filter((x) => x.category === 'headline')
		for (const article of nonHeadlineArticles) {
			const repeated = savedHeadlineArticles.filter((x) => x.link === article.link)
			if (repeated.length > 0) {
				await Article.findOneAndUpdate({ link: repeated[0].link }, { category: article.category })
			}
		}

		for (const article of articles) {
			if (savedArticles.filter((x) => x.title === article.title).length === 0) {
				if (trendingTopics.length > 0) {
					article.tags = getTagsFromArticle(trendingTopics[0].topics, article.content)
				}
				articleWithTags.push(article)
			}
		}

		const checkWithOldArticles = articleWithTags.filter((article) => !savedArticles.some((sa) => sa.link === article.link))

		checkWithOldArticles.forEach((x) => (x.hostIp = ipAddress))
		await saveArticles(checkWithOldArticles)

		logger.info(`News Crawler ran! Articles Saved: ${checkWithOldArticles.length}`, { date: new Date().toISOString() })
	} catch (error) {
		logger.error('Error while crawling:', error)
	}
}
