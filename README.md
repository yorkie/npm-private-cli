
NPM-PRIVATE-CLI(1) - NPM Extend Tool for your github private repo
===========

### Installation
```sh
$ npm install -g npm-private-cli
```

### Usage

1. Add the `privateDenpendencies` to your `package.json`:
```
  "privateDenpendencies": {
    "Owner/repo-name": ">=0.0.1"
  }
}
```

2. Add a pre-install script to pipeline your workflow:
```
  "scripts": {
    "pre-install": "npm-private -u yorkie -p your-password"
  }
}
```

Conguratulations to you, then you could publish your private packages by git/github, and define your dependencies like public packages.

### License

MIT

