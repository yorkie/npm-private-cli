#!/usr/bin/env node

var fs = require('fs');
var util = require('util');
var path = require('path');
var async = require('async');
var semver = require('semver');
var GitHubApi = require('github');
var argv = require('minimist')(process.argv.slice(2));

var pkgPath = path.join(process.cwd(), './package.json');
var pkg = require(pkgPath);

var username = argv.u || argv.user || argv.username;
var password = argv.p || argv.pass || argv.password;

if (!username || !password) {
  throw new Error('username and password required');
}

async.forEach(Object.keys(pkg.privateDependencies) || [],
  function (name, done) {
    getTarbar(name, pkg.privateDependencies[name], function(err, release) {
      var url = util.format('https://%s:%s@github.com/%s/%s/archive/%s.tar.gz',
        username, password, release.org, release.repo, release.version);
      
      // if `dependencies` not exists
      if (typeof pkg.dependencies !== 'object') {
        pkg.dependencies = {};
      }
      pkg.dependencies[release.repo] = url;
      done(null);
    });
  },
  function () {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    process.exit();
  });

function getTarbar(name, version, callback) {
  var _name = name.split('/');
  if (!_name || _name.length <= 1) {
    throw new Error('package name error');
  }
  getReleases(_name[0], _name[1], function(err, vers, releases) {
    var ret;
    for (var i = 0; i < vers.length; i++) {
      if (semver.satisfies(vers[i], version)) {
        ret = vers[i];
        break;
      }
    }

    if (!ret) {
      throw new Error('unmatch version');
    }
    if (!callback || typeof callback !== 'function') {
      throw new Error('callback required');
    }
    callback(null, releases[ret]);
  });
}

function getReleases(org, repo, callback) {
  var github = new GitHubApi({
    version: '3.0.0',
    timeout: 5000
  });
  github.authenticate({
    type: 'basic',
    username: username,
    password: password
  })
  github.repos.getTags({
    user: org,
    repo: repo
  }, function _onrelease(err, releases) {
    onreleases(err, org, repo, releases, callback);
  });
}

function onreleases(err, org, repo, releases, callback) {
  if (err) {
    throw err;
  }
  var releasesObject = {};
  var ret = releases.filter(function(release) {
    return semver.valid(release.name);
  }).map(function(release) {
    releasesObject[release.name] = {
      org: org,
      repo: repo,
      version: release.name
    };
    return release.name;
  });
  if (!callback || typeof callback !== 'function') {
    throw new Error('callback required');
  }
  callback(null, ret, releasesObject);
};
