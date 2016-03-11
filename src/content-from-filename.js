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
    const head = await promisify(github.gitdata.getReference)(addRepo({ref: `heads/${branch}`}))

    const { tree } = await promisify(github.gitdata.getTree)(addRepo({sha: head.object.sha}))

    const { sha } = tree.find((object) => object.path === filename)

    if (!sha) return Promise.reject(new Error(`Couldn't find ${filename}.`))

    const blob = await promisify(github.gitdata.getBlob)(addRepo({sha}))

    return Promise.resolve({
      content: (new Buffer(blob.content, 'base64')).toString(),
      commit: head.object.sha
    })
  } catch (err) {
    return Promise.reject(err)
  }
}
