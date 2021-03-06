// const { NotificationDbService } = require('../../db-service')
// const { getStartEndTimeForUser } = require('./notificationTime')
const { Notification } = require('../../db-service/database/mongooseSchema')

const notificationExists = async (user, article) => {
	try {
		// const todaysTimeFrame = getStartEndTimeForUser(user.timeZone)
		// const todaysNotifications = await NotificationDbService.getNotifications({
		// 	createdAt: { $gte: todaysTimeFrame.startTime, $lt: todaysTimeFrame.endTime },
		// })
		// const hasSent = todaysNotifications.find(
		// 	(notification) => String(notification.user) === String(user._id) && String(notification.article) === String(article._id),
		// )

		// return !!hasSent

		const isExist = await Notification.countDocuments({ article: article._id, user: user._id })
		if (isExist > 0) {
			return true
		} else {
			return false
		}
	} catch (error) {
		console.log('could not get todays notification', error)
	}
}

const createUserWithNotification = (article, user) => {
	return {
		notification: {
			title: article.title,
			body: article.shortDescription.substring(0, 100) + '...',
		},
		to: user.fcmToken,
		data: {
			_id: article._id,
		},
	}
}

const createUserWithCoronaNotification = (stats, user) => {
	return {
		notification: {
			title: 'कोरोना तथ्याङ्क',
			body: `कुल संक्रमित : ${convertNumbertoNepali(stats.totalCases)}, नयाँ संक्रमित : ${convertNumbertoNepali(
				stats.newCases,
			)}, कुल मृत्यु : ${convertNumbertoNepali(stats.totalDeaths)}, नयाँ मृत्यु : ${convertNumbertoNepali(stats.newDeaths)}`,
		},
		to: user.fcmToken,
		data: {
			notifType: 'corona',
		},
	}
}

const convertNumbertoNepali = (num) => {
	const nepaliNumbers = ['o', '१', '२', '३', '४', '५', '६', '७', '८', '९']
	const numStr = num.toString().split('')
	let newNepaliNumber = ''
	numStr.map((str) => {
		newNepaliNumber += nepaliNumbers[str]
	})
	return newNepaliNumber
}

module.exports = {
	notificationExists,
	createUserWithNotification,
	createUserWithCoronaNotification,
}
