require('babel-core/polyfill')

const { defaults } = require('lodash')
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

    const content = await contentFromFilename(github, config)
    const newContent = transform(content)

    var transformedConfig = {}
    if (typeof newContent === 'string') transformedConfig.content = newContent
    else transformedConfig = newContent

    config = defaults(transformedConfig, {sha: content.commit}, config)

    const commit = await updateFileWithContent(github, config)

    const {
      push,
      pr,
      newBranch
    } = config

    if (!(pr || push || newBranch)) return callback(null, commit)

    if (push) {
      return github.gitdata.updateReference(
        defaults({
          ref: `refs/heads/${branch}`,
          sha: commit.sha
        }, config),
        callback
      )
    }

    if (newBranch) {
      await promisify(github.gitdata.createReference)(defaults({
        sha: commit.sha,
        ref: `refs/heads/${newBranch}`
      }, config))
    }

    if (!pr) return callback(null, {commit})

    github.pullRequests.create(defaults(pr, config, {
      base: branch,
      head: config.newBranch || commit.sha
    }), callback)
  } catch (err) {
    callback(err)
  }
}
