const nock = require('nock')
const {test} = require('tap')

const githubChangeRemoteFile = require('../')

const user = 'jane'
const repo = 'doe'
const accessToken = 'secret'

const branch = 'master'
const newBranch = 'test-branch'

const filename = 'my/package.json'

const branchSha = 'def'
const fileSha = 'aec'
const newFileSha = 'cea'

nock('https://api.github.com')
.get(`/repos/${user}/${repo}/git/refs/heads%2F${branch}`)
.query({access_token: accessToken})
.times(2)
.reply(200, {
  object: {
    sha: branchSha
  }
})

.post(`/repos/${user}/${repo}/git/refs`, {
  ref: `refs/heads/${newBranch}`,
  sha: branchSha
})
.query({access_token: accessToken})
.times(1)
.reply(201, {})

.patch(`/repos/${user}/${repo}/git/refs/heads%2F${newBranch}`, {
  force: true,
  sha: branchSha
})
.query({access_token: accessToken})
.times(1)
.reply(200, {})

.get(`/repos/${user}/${repo}/contents/${filename.replace('/', '%2F')}`)
.query({access_token: accessToken, ref: branch})
.times(4)
.reply(200, {
  content: 'YWJj',
  type: 'file',
  sha: fileSha
})

.put(`/repos/${user}/${repo}/contents/${filename.replace('/', '%2F')}`, {
  message: `chore: updated ${filename}`,
  content: 'QUJD',
  sha: fileSha
})
.query({access_token: accessToken})
.times(4)
.reply(200, {
  commit: {
    sha: newFileSha
  }
})

test('create branch and commit', (t) => {
  t.plan(1)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    branch,
    newBranch,
    transform: (input) => input.toUpperCase(),
    token: accessToken
  })
  .then(res => t.is(res.sha, newFileSha))
  .catch(t.threw)
})

test('push commit to branch', (t) => {
  t.plan(1)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    branch,
    transform: (input) => input.toUpperCase(),
    token: accessToken
  })
  .then(res => t.is(res.sha, newFileSha))
  .catch(t.threw)
})

test('push commit to branch with force', (t) => {
  t.plan(1)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    branch,
    newBranch,
    force: true,
    transform: (input) => input.toUpperCase(),
    token: accessToken
  })
  .then(res => t.is(res.sha, newFileSha))
  .catch(t.threw)
})

test('create commit and push to master (transform: object)', (t) => {
  t.plan(1)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => {
      return {
        content: input.toUpperCase()
      }
    },
    token: accessToken
  })
  .then(res => t.is(res.sha, newFileSha))
  .catch(t.threw)
})
