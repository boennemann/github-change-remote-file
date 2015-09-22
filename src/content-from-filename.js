const { defaults, pick } = require('lodash')
const defaultDefault = require('./default-default')

module.exports = async function contentFromFilename (repos, config) {
  config = defaults(config, {
    branch: 'master'
  })

  const { branch, filename } = config

  const addRepo = defaultDefault(pick(config, ['user', 'repo']))

  try {

    const { content, sha } = await repos.getContent(addRepo({
      ref: branch,
      path: filename
    }))

    if (!sha) return Promise.reject(new Error(`Couldn't find ${filename}.`))

    return Promise.resolve({
      content: (new Buffer(content, 'base64')).toString(),
      sha: sha
    })
  } catch (err) {
    return Promise.reject(err)
  }
}
