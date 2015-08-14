require('babel-core/polyfill')

const { defaults, mapValues } = require('lodash')
const GitHubApi = require('github')
const promisify = require('es6-promisify')

const contentFromFilename = require('./content-from-filename')
const updateFileWithContent = require('./update-file-with-content')

var github = new GitHubApi({
  version: '3.0.0'
})
const gitdata = mapValues(github.gitdata, promisify)

module.exports = async function (config, callback) {
  const {
    branch = 'master',
    token,
    transform
  } = config

  try {
    github.authenticate({type: 'oauth', token})

    const content = await contentFromFilename(gitdata, config)
    const newContent = transform(content.content)

    var transformedConfig = {}
    if (typeof newContent === 'string') transformedConfig.content = newContent
    else transformedConfig = newContent

    config = defaults(transformedConfig, {sha: content.commit}, config)

    const commit = await updateFileWithContent(gitdata, config)

    const {
      push,
      pr
    } = config

    if (!(pr || push)) return callback(null, commit)

    if (push) {
      return github.gitdata.updateReference(
        defaults({
          ref: `heads/${branch}`,
          sha: commit.sha
        }, config),
        callback
      )
    }

    github.pullRequests.create(defaults(pr, config, {
      base: branch,
      head: commit.sha
    }), callback)
  } catch (err) {
    callback(err)
  }
}
