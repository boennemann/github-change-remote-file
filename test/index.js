const nock = require('nock')
const { test } = require('tap')

const githubChangeRemoteFile = require('../')

const user = 'jane'
const repo = 'doe'
const access_token = 'secret'

const branch = 'master'
const filename = 'package.json'
const pr_title = 'title'

const heads_master_sha = 'abc'
const file_sha = 'def'
const tree_sha = 'ghi'
const new_tree_sha = 'jkl'

nock('https://api.github.com')

.get(`/repos/${user}/${repo}/git/refs/heads%2F${branch}`)
.times(4)
.query({access_token})
.reply(200, {
  object: {
    sha: heads_master_sha
  }
})

.get(`/repos/${user}/${repo}/git/trees/${heads_master_sha}`)
.times(4)
.query({access_token})
.reply(200, {
  tree: [{
    path: filename,
    sha: file_sha
  }]
})

.get(`/repos/${user}/${repo}/git/blobs/${file_sha}`)
.times(4)
.query({access_token})
.reply(200, {
  content: 'YWJj',
  encoding: 'base64'
})

.post(`/repos/${user}/${repo}/git/trees`, {
  tree: [{
    path: filename,
    mode: '100644',
    type: 'blob',
    content: 'ABC'
  }],
  base_tree: heads_master_sha
})
.times(4)
.query({access_token})
.reply(201, {
  sha: new_tree_sha
})

.post(`/repos/${user}/${repo}/git/commits`, {
  message: `chore: updated ${filename}`,
  tree: new_tree_sha,
  parents: [heads_master_sha]
})
.times(4)
.query({access_token})
.reply(201, {
  sha: tree_sha
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
    console.log(res)
    t.is(res.object.sha, tree_sha)
  })
})
