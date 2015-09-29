require('babel-core/polyfill')

const { defaults, mapValues } = require('lodash')
const GitHubApi = require('github')
const promisify = require('es6-promisify')

const contentFromFilename = require('./content-from-filename')
const updateFileWithContent = require('./update-file-with-content')

module.exports = async function (config, callback) {
  const {
    branch = 'master',
    token,
    transform
  } = config

  try {
    const github = new GitHubApi({
      version: '3.0.0'
    })

    github.authenticate({type: 'oauth', token})

    const repos = mapValues(github.repos, promisify)
    const { content, sha } = await contentFromFilename(repos, config)
    const newContent = transform(content)

    var transformedConfig = {}
    if (typeof newContent === 'string') transformedConfig.content = newContent
    else transformedConfig = newContent

    config = defaults(transformedConfig, {sha: sha}, config)

    const update = await updateFileWithContent(repos, github, config)

    const {
      push,
      pr
    } = config

    if (push || !pr) return callback(null, update)

    github.pullRequests.create(defaults(pr, config, {
      base: branch,
      head: config.newBranch || update.commit.sha
    }), callback)
  } catch (err) {
    callback(err)
  }
}
