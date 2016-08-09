var githubChangeRemoteFile = require('./')

githubChangeRemoteFile({
  user: 'user',
  repo: 'repo',
  filename: 'package.json',
  transform: function (pkg) {
    return 'test'
  },
  token: '***',
  message: ':banana: :zap: :apple:',
  branch: 'test-branch',
  newBranch: 'test-branch2',
  force: true,
  committer: {
    name: 'greenkeeperio-bot',
    email: 'support@greenkeeper.io'
  }
})
.then(console.log)
.catch(console.log)
