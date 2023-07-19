import fs from 'fs'
import PDFDocument from 'pdfkit'

import { loggerService } from './logger.service.js'

export const fileService = {
  createFile,
  deleteFile,
}

function createFile(toys) {
  const toysToExport = toys.map(
    ({ _id, name, description }) =>
      `Toy id : '${_id}' - '${name}' - ${description}`
  )
  return new Promise((res, rej) => {
    const doc = new PDFDocument()
    const date = new Date().toLocaleDateString('he-IL').replace(/\./g, '-')
    const filePath = `todos-${date}.pdf`
    const stream = fs.createWriteStream(filePath)
    doc.pipe(stream)
    doc
      .fontSize(25)
      .text('Toys List')
      .fontSize(16)
      .font('Helvetica')
      .list(toysToExport, {
        bulletRadius: 2,
      })
    doc.end()
    stream.on('finish', () => res(filePath))
  })
}

function deleteFile(filePath) {
  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) {
      loggerService.error('Failed to delete the generated file', unlinkErr)
    }
  })
}
