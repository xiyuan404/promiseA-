const fs = require('fs')
const Promise = require('./promise')

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      resolve(JSON.parse(data))
    })
  })
}

module.exports = {
  readFile,
}
