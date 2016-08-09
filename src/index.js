const {defaults} = require('lodash')
const GitHubApi = require('github')
const {promisify} = require('bluebird')

const contentFromFilename = require('./content-from-filename')
const updateFileWithContent = require('./update-file-with-content')

module.exports = async function (config) {
  const {
    branch = 'master',
    newBranch,
    token,
    transform,
    force
  } = config

  let github = config.github

  if (!github) {
    github = new GitHubApi()
    github.authenticate({type: 'oauth', token})
  }

  const reference = await promisify(github.gitdata.getReference)(defaults({
    ref: `heads/${branch}`
  }, config))

  await promisify(github.gitdata[force ? 'updateReference' : 'createReference'])(defaults({
    sha: reference.object.sha,
    ref: (force ? '' : 'refs/') + `heads/${newBranch}`,
    force
  }, config))

  const content = await contentFromFilename(github, config)
  const newContent = transform(content.content)

  var transformedConfig = {}
  if (typeof newContent === 'string') transformedConfig.content = newContent
  else transformedConfig = newContent

  const commit = await updateFileWithContent(github, defaults(transformedConfig, {sha: content.commit}, config))

  return commit
}
