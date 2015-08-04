const { defaults, pick } = require('lodash')
const defaultDefault = require('./default-default')

module.exports = async function contentFromFilename (gitdata, config) {
  config = defaults(config, {
    branch: 'master'
  })

  const { branch, filename } = config

  const addRepo = defaultDefault(pick(config, ['user', 'repo']))

  try {
    const head = await gitdata.getReference(addRepo({ref: `heads/${branch}`}))

    const { tree } = await gitdata.getTree(addRepo({sha: head.object.sha}))

    const { sha } = tree.find((object) => object.path === filename)

    if (!sha) return Promise.reject(new Error(`Couldn't find ${filename}.`))

    const blob = await gitdata.getBlob(addRepo({sha}))

    return Promise.resolve({
      content: (new Buffer(blob.content, 'base64')).toString(),
      commit: head.object.sha
    })
  } catch (err) {
    return Promise.reject(err)
  }
}
