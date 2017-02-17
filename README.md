# github-change-remote-file

[![Greenkeeper badge](https://badges.greenkeeper.io/boennemann/github-change-remote-file.svg)](https://greenkeeper.io/)

| [![Build Status](https://travis-ci.org/boennemann/github-change-remote-file.svg?branch=master)](https://travis-ci.org/boennemann/github-change-remote-file) | [![Coverage Status](https://coveralls.io/repos/boennemann/github-change-remote-file/badge.svg?branch=master&service=github)](https://coveralls.io/github/boennemann/github-change-remote-file?branch=master) | [![Dependency Status](https://david-dm.org/boennemann/github-change-remote-file/master.svg)](https://david-dm.org/boennemann/github-change-remote-file/master) | [![devDependency Status](https://david-dm.org/boennemann/github-change-remote-file/master/dev-status.svg)](https://david-dm.org/boennemann/github-change-remote-file/master#info=devDependencies) | [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard) |
| --- | --- | --- | --- | --- |

This module allows you to change a single file in a repository on GitHub and create a new commit or pull-request from that change. This has little to no overhead, because it doesn't work with a local copy of the git repository – everything is done via the GitHub API.

## Examples

Create a new branch and commit on top of it:

```js
githubChangeRemoteFile({
  user: 'boennemann',
  repo: 'animals',
  filename: 'package.json',
  newBranch: 'upgrade-standard',
  transform: pkg => {
    const parsedPkg = JSON.parse(pkg)
    pkg.devDependencies.standard = semver.inc(parsedPkg.devDependencies.standard, 'major')
    return JSON.stringify(parsedPkg, null, 2)
  },
  token: '<github access token with sufficent rights>'
})
.then(res => console.log(res))
.catch(console.log)
```

Create a new commit and push it on top of the (master) branch:

```js
githubChangeRemoteFile({
  user: 'boennemann',
  repo: 'animals',
  filename: 'package.json',
  transform: pkg => {
    const parsedPkg = JSON.parse(pkg)
    pkg.devDependencies.standard = semver.inc(parsedPkg.devDependencies.standard, 'major')
    return JSON.stringify(parsedPkg, null, 2)
  },
  token: '<github access token with sufficent rights>'
})
.then(res => console.log(res))
.catch(console.log)
```
