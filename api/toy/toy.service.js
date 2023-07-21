import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = { name: '' }) {
  try {
    const criteria = _buildCriteria(filterBy)
    const sortCriteria = _buildSortCriteria(filterBy.sortBy)

    const collection = await dbService.getCollection('toy')
    var toys = await collection.find(criteria).sort(sortCriteria).toArray()
    return toys
  } catch (err) {
    logger.error('cannot find toys', err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = collection.findOne({ _id: ObjectId(toyId) })
    return toy
  } catch (err) {
    logger.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.deleteOne({ _id: ObjectId(toyId) })
  } catch (err) {
    logger.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function add(toy) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.insertOne(toy)
    return toy
  } catch (err) {
    logger.error('cannot insert toy', err)
    throw err
  }
}

async function update(toy) {
  try {
    const toyToSave = {
      name: toy.name,
      price: +toy.price,
      labels: toy.labels,
      createdAt: toy.createdAt,
      inStock: toy.inStock,
    }

    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
    return toy
  } catch (err) {
    logger.error(`cannot update toy ${toy._id}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId(toyId) },
      { $push: { msgs: msg } }
    )
    return msg
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.updateOne(
      { _id: ObjectId(toyId) },
      { $pull: { msgs: { id: msgId } } }
    )
    return msgId
  } catch (err) {
    logger.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

export const toyService = {
  remove,
  query,
  getById,
  add,
  update,
  addToyMsg,
  removeToyMsg,
}

function _buildCriteria(filterBy) {
  let criteria = {}

  if (filterBy.name) {
    criteria.name = { $regex: filterBy.name, $options: 'i' }
  }
  if (JSON.parse(filterBy.inStock)) {
    criteria.inStock = JSON.parse(filterBy.inStock)
  }
  if (filterBy.labels.length) {
    criteria.labels = { $in: filterBy.labels }
  }
  return criteria
}

function _buildSortCriteria(sortBy) {
  let sortByCriteria = {}
  switch (sortBy) {
    case 'createdAt -1':
      sortByCriteria = { createdAt: -1 }
      break
    case 'price 1':
      sortByCriteria = { price: 1 }
      break
    case 'price -1':
      sortByCriteria = { price: -1 }
      break
    case 'name 1':
      sortByCriteria = { name: 1 }
      break
    case 'name -1':
      sortByCriteria = { name: -1 }
      break
  }
  return sortByCriteria
}
