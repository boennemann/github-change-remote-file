const { pick } = require('lodash')
const promisify = require('es6-promisify')

const defaultDefault = require('./default-default')

module.exports = async function (github, config) {
  const { content, filename, sha, author, committer } = config
  const message = config.message || `chore: updated ${filename}`

  const addRepo = defaultDefault(pick(config, ['user', 'repo']))

  try {
    const tree = await promisify(github.gitdata.createTree)(addRepo({
      base_tree: sha,
      tree: [{
        path: filename,
        mode: '100644',
        type: 'blob',
        content
      }]
    }))

    const commit = await promisify(github.gitdata.createCommit)(addRepo({
      message,
      tree: tree.sha,
      parents: [sha],
      author,
      committer
    }))

    return Promise.resolve(commit)
  } catch (err) {
    return Promise.reject(err)
  }
}
