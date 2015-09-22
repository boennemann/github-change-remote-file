const { pick } = require('lodash')
const promisify = require('es6-promisify')

const defaultDefault = require('./default-default')

module.exports = async function (repos, github, config) {
  const { content, filename, sha, branch, author, comitter } = config
  const message = config.message || `chore: updated ${filename}`

  const addRepo = defaultDefault(pick(config, ['user', 'repo']))

  try {
    var newBranch = !config.push ? (config.newBranch || sha) : null

    if (newBranch) {
      const head = await promisify(github.gitdata.getReference)(addRepo({ref: `heads/${branch}`}))

      await promisify(github.gitdata.createReference)(addRepo({
        sha: head.object.sha,
        ref: `refs/heads/${newBranch}`
      }))
    }

    const update = await repos.updateFile(addRepo({
      path: filename,
      message,
      content: new Buffer(content).toString('base64'),
      sha,
      branch: newBranch || branch,
      author,
      comitter
    }))

    return Promise.resolve(update)
  } catch (err) {
    return Promise.reject(err)
  }
}
