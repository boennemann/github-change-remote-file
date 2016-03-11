const nock = require('nock')
const { test } = require('tap')

const githubChangeRemoteFile = require('../')

const user = 'jane'
const repo = 'doe'
const access_token = 'secret'

const branch = 'master'
const filename = 'package.json'
const pr_title = 'title'

const file_sha = 'def'
const tree_sha = 'ghi'

nock('https://api.github.com')

.get(`/repos/${user}/${repo}/contents/${filename}`)
.times(4)
.query({
  access_token,
  ref: branch
})
.reply(200, {
  content: 'YWJj',
  sha: file_sha
})

.put(`/repos/${user}/${repo}/contents/${filename}`, {
  message: `chore: updated ${filename}`,
  content: 'ABC',
  sha: file_sha
})
.times(4)
.query({access_token})
.reply(201, {
  commit: {
    sha: tree_sha
  }
})

.post(`/repos/${user}/${repo}/pulls`, {
  title: pr_title,
  base: branch,
  head: tree_sha
})
.query({access_token})
.reply(201, {
  title: pr_title
})

.patch(`/repos/${user}/${repo}/git/refs/heads%2F${branch}`, {
  sha: tree_sha
})
.times(2)
.query({access_token})
.reply(201, {
  object: {
    sha: tree_sha
  }
})

test('create commit', (t) => {
  t.plan(2)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => input.toUpperCase(),
    token: access_token
  }, (err, res) => {
    t.error(err)
    t.is(res.sha, tree_sha)
  })
})

test('create commit and send pr', (t) => {
  t.plan(2)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => input.toUpperCase(),
    token: access_token,
    pr: {
      title: pr_title
    }
  }, (err, res) => {
    t.error(err)
    t.is(res.title, pr_title)
  })
})

test('create commit and push to master (transform: string)', (t) => {
  t.plan(2)

  githubChangeRemoteFile({
    user,
    repo,
    filename,
    transform: (input) => input.toUpperCase(),
    token: access_token,
    push: true
  }, (err, res) => {
    t.error(err)
    t.is(res.object.sha, tree_sha)
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
    token: access_token
  }, (err, res) => {
    t.error(err)
    t.is(res.object.sha, tree_sha)
  })
})
