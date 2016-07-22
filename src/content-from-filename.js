const { defaults, pick } = require('lodash')
const promisify = require('es6-promisify')
const defaultDefault = require('./default-default')

module.exports = async function contentFromFilename (github, config) {
  config = defaults(config, {
    branch: 'master'
  })

  const { branch, filename } = config

  const addRepo = defaultDefault(pick(config, ['user', 'repo']))

  try {
    const blob = await promisify(github.repos.getContent)(addRepo({path: filename, ref: branch}))

    if (blob.type !== 'file') return Promise.reject(new Error('Type is not a file'))

    return Promise.resolve({
      content: (new Buffer(blob.content, 'base64')).toString(),
      commit: blob.sha
    })
  } catch (err) {
    return Promise.reject(err)
  }
}
