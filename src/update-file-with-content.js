const { pick } = require('lodash')
const promisify = require('es6-promisify')

const defaultDefault = require('./default-default')

module.exports = async function (github, config) {
  const { branch, content, filename, sha, author, committer } = config
  const message = config.message || `chore: updated ${filename}`

  const addRepo = defaultDefault(pick(config, ['user', 'repo']))

  try {
    const response = await promisify(github.repos.updateFile)(addRepo({
      path: filename,
      message,
      content: (new Buffer(content, 'utf8')).toString('base64'),
      sha,
      branch,
      committer,
      author
    }))

    return Promise.resolve(response.commit)
  } catch (err) {
    return Promise.reject(err)
  }
}
