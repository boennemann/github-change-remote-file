const {defaults, pick} = require('lodash')
const {promisify} = require('bluebird')

module.exports = async function (github, config) {
  const {newBranch, content, filename, sha, committer, author} = config
  const message = config.message || `chore: updated ${filename}`

  const response = await promisify(github.repos.updateFile)(defaults({
    path: filename,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch: newBranch,
    committer: committer || author
  }, pick(config, ['user', 'repo'])))

  return response.commit
}
