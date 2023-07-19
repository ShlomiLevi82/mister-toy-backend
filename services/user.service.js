import fs from 'fs'
import Cryptr from 'cryptr'
import { utilService } from './util.service.js'

const cryptr = new Cryptr('secret-puk-1234')

const users = utilService.readJsonFile('data/user.json')

export const userService = {
	query,
	getById,
	remove,
	save,
	checkLogin,
	getLoginToken,
	validateToken,
}

function query() {
	return Promise.resolve(users)
}

function getLoginToken(user) {
	const str = JSON.stringify(user)
	const encryptedStr = cryptr.encrypt(str)
	return encryptedStr
	// return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(token) {
	const str = cryptr.decrypt(token)
	const user = JSON.parse(str)
	return user
}

function checkLogin({ username, password }) {
	let user = users.find((user) => {
		return user.username === username && user.password === password
	})

	if (user) {
		user = {
			_id: user._id,
			fullname: user.fullname,
			isAdmin: user.isAdmin,
		}
		return Promise.resolve(user)
	}
	return Promise.reject('Invalid login')
}

function save({ fullname, username, password }) {
	let user = {
		_id: utilService.makeId(),
		fullname,
		username,
		password,
		isAdmin: false,
	}

	users.push(user)

	return _saveUsersToFile().then(() => {
		console.log('🚀 ~ file: user.service.js:61 ~ return_saveUsersToFile ~ user:', user)
		user = {
			_id: user._id,
			fullname: user.fullname,
			isAdmin: false,
		}
		return user
	})
}

function remove(userId) {
	const idx = users.findIndex((user) => user._id === userId)
	if (idx === -1) return Promise.reject('User not found!')

	users.splice(idx, 1)
	return _saveUsersToFile()
}

function getById(userId) {
	const user = users.find((user) => user._id === userId)
	if (!user) return Promise.reject('User not found!')
	return Promise.resolve(user)
}

function _saveUsersToFile() {
	return new Promise((resolve, reject) => {
		const content = JSON.stringify(users, null, 2)
		fs.writeFile('./data/user.json', content, (err) => {
			if (err) {
				console.error(err)
				return reject(err)
			}
			resolve()
		})
	})
}
