# molgenis-js-rsql
[![codecov](https://codecov.io/gh/molgenis/molgenis-js-rsql/branch/master/graph/badge.svg)](https://codecov.io/gh/molgenis/molgenis-js-rsql)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

RSQL javascript tools for transforming, encoding and parsing of strings to RSQL and vice versa

## Develop
You can run ```yarn unit``` to run tests. It will trigger codecoverage which will be placed in ```test/unit/coverage```.

### How to commit
We use conventional commits to generate changelogs and release notes. Please check: https://www.conventionalcommits.org/

**Example**
```
git commit file.ext -m "fix(file.ext): fixes something"
```

### How to publish
Each time a PR is merged a release will be done to NPM. The CHANGELOG.md and GitHub release will be ammended. 

The version of the package is based upon convential commits. Check: http://commitizen.github.io/cz-cli/.
