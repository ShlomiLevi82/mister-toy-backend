import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

const PAGE_SIZE = 5
export const toyService = {
  query,
  getById,
  remove,
  save,
}

const toys = utilService.readJsonFile('data/toy.json')

function query({ name, inStock, labels, sortBy }) {
  let filteredToys = toys

  const regex = new RegExp(name, 'i')
  filteredToys = filteredToys.filter((toy) => regex.test(toy.name))

  if (inStock) {
    filteredToys = filteredToys.filter((toy) => toy.inStock)
  }

  if (labels) {
    filteredToys = filteredToys.filter((toy) => {
      return labels.every((label) => toy.labels.includes(label))
    })
  }

  return Promise.resolve(filteredToys)
}

function getById(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex((toy) => toy._id === toyId)
  toys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy) {
  console.log('🚀 ~ file: toy.service.js:46 ~ save ~ toy:', toy)

  if (toy._id) {
    const idx = toys.findIndex((currToy) => currToy._id === toy._id)
    if (idx === -1) return Promise.reject('No such toy')
    toys[idx] = toy
  } else {
    toy._id = utilService.makeId()
    toys.push(toy)
  }

  return _saveToysToFile().then(() => toy)
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(toys, null, 2)
    fs.writeFile('data/toy.json', data, (err) => {
      if (err) {
        loggerService.error('Cannot write to toys file', err)
        return reject(err)
      }
      resolve()
    })
  })
}
