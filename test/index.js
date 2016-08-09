const nock = require('nock')
const { test } = require('tap')

const githubChangeRemoteFile = require('../')

const user = 'jane'
const repo = 'doe'
const accessToken = 'secret'

const branch = 'master'
const filename = 'package.json'
const prTitle = 'title'

const fileSha = 'def'
const treeSha = 'ghi'

nock('https://api.github.com')

.get(`/repos/${user}/${repo}/contents/${filename}`)
.times(4)
.query({
  accessToken,
  ref: branch
})
.reply(200, {
  content: 'YWJj',
  sha: fileSha
})

.put(`/repos/${user}/${repo}/contents/${filename}`, {
  message: `chore: updated ${filename}`,
  content: 'ABC',
  sha: fileSha
})
.times(4)
.query({accessToken})
.reply(201, {
  commit: {
    sha: treeSha
  }
})

.post(`/repos/${user}/${repo}/pulls`, {
  title: prTitle,
  base: branch,
  head: treeSha
})
.query({accessToken})
.reply(201, {
  title: prTitle
})

.patch(`/repos/${user}/${repo}/git/refs/heads%2F${branch}`, {
  sha: treeSha
})
.times(2)
.query({accessToken})
.reply(201, {
  object: {
    sha: treeSha
  }
})

test('create commit', (t) => {
  t.plan(2)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => input.toUpperCase(),
    token: accessToken
  }, (err, res) => {
    t.error(err)
    t.is(res.sha, treeSha)
  })
})

test('create commit and send pr', (t) => {
  t.plan(2)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => input.toUpperCase(),
    token: accessToken,
    pr: {
      title: prTitle
    }
  }, (err, res) => {
    t.error(err)
    t.is(res.title, prTitle)
  })
})

test('create commit and push to master (transform: string)', (t) => {
  t.plan(2)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => input.toUpperCase(),
    token: accessToken,
    push: true
  }, (err, res) => {
    t.error(err)
    t.is(res.object.sha, treeSha)
  })
})

test('create commit and push to master (transform: object)', (t) => {
  t.plan(2)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => {
      return {
        content: input.toUpperCase(),
        push: true
      }
    },
    token: accessToken
  }, (err, res) => {
    t.error(err)
    t.is(res.object.sha, treeSha)
  })
})
