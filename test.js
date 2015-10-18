var githubChangeRemoteFile = require('./')

githubChangeRemoteFile({
  user: 'boennemann',
  repo: 'animals',
  filename: 'package.json',
  transform: function (pkg) {
    return 'wat'
  },
  token: 'c793b5969319e5e64e71703a337dd3f9eb7c0b3c',
  message: ':wave: @boennemann',
  newBranch: 'branch-name',
  pr: {
    title: 'testing, don\'t mind me'
  }
}, console.log)
