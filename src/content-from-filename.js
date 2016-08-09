const {defaults, pick} = require('lodash')
const {promisify} = require('bluebird')

module.exports = async function contentFromFilename (github, config) {
  const {
    branch = 'master',
    filename
  } = config

  const blob = await promisify(github.repos.getContent)(defaults({
    path: filename,
    ref: branch
  }, pick(config, ['user', 'repo'])))

  if (blob.type !== 'file') throw new Error('Type is not a file')

  return {
    content: (new Buffer(blob.content, 'base64')).toString(),
    commit: blob.sha
  }
}
