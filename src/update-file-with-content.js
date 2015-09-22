const { pick } = require('lodash')

const defaultDefault = require('./default-default')

module.exports = async function (gitdata, config) {
  const { content, filename, sha } = config
  const message = config.message || `chore: updated ${filename}`

  const addRepo = defaultDefault(pick(config, ['user', 'repo']))

  try {
    const tree = await gitdata.createTree(addRepo({
      base_tree: sha,
      tree: [{
        path: filename,
        mode: '100644',
        type: 'blob',
        content
      }]
    }))

    const commit = await gitdata.createCommit(addRepo({
      message,
      tree: tree.sha,
      parents: [sha]
    }))

    return Promise.resolve(commit)
  } catch (err) {
    return Promise.reject(err)
  }
}
