const {defaults} = require('lodash')
const {promisify} = require('bluebird')

module.exports = async function (github, config) {
  const {
    message = `chore: updated ${config.filename}`,
    content,
    filename,
    committer,
    author
  } = config

  const response = await promisify(github.repos.updateFile)(defaults({
    path: filename,
    message,
    content: Buffer.from(content).toString('base64'),
    committer: committer || author
  }, config))

  return response.commit
}
