const {defaults} = require('lodash')
const {promisify} = require('bluebird')

module.exports = async function contentFromFilename (github, config) {
  const {
    branch = 'master',
    filename
  } = config

  const blob = await promisify(github.repos.getContent)(defaults({
    path: filename,
    ref: branch
  }, config))

  if (blob.type !== 'file') throw new Error('Type is not a file')

  return {
    content: Buffer.from(blob.content, 'base64').toString(),
    commitSha: blob.sha
  }
}
