require('dotenv').config()
const Agenda = require('agenda')
const logger = require('../../config/logger')

const newsFetcher = require('../newsFetcher')
const quoteFetcher = require('../quoteFetcher')
const allStocksFetcher = require('../allStocksFetcher')

module.exports = async function () {
	logger.info('starting jobs')

	const agenda = new Agenda({ db: { address: process.env.DATABASE_URL } })

	agenda.define('Refresh stock news', async () => {
		logger.info('stocks refresh job started')
		newsFetcher()
	})

	agenda.define('Quote Fetcher', async () => {
		logger.info('stocks refresh job started')
		quoteFetcher()
	})

	agenda.define('All Stocks List Fetcher', async () => {
		logger.info('All Stocks List job started')
		allStocksFetcher()
	})

	await agenda.start()

	await agenda.every('1 day', 'Refresh stock news')
	await agenda.every('0 9-17 * * 1-5', 'Quote Fetcher')
	await agenda.every('1 week', 'All Stocks List Fetcher')
}
