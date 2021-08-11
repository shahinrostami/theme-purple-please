![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)

***

Snyk helps you find, fix and monitor for known vulnerabilities in your dependencies, both on an ad hoc basis and as part of your CI (Build) system.

| :information_source: This repository is only a plugin to be used with the Snyk CLI tool. To use this plugin to test and fix vulnerabilities in your project, install the Snyk CLI tool first. Head over to [snyk.io](https://github.com/snyk/snyk) to get started. |
| --- |

# Support

- ❌ Not supported
- ❓ No issues expected but not regularly tested
- ✅ Supported and verified with tests

## Supported OS

| OS     |  Supported |
|--------|------------|
| Windows| ✅          |
| Linux  | ✅          |
| OSX    | ️✅          |

## Supported Node versions

| Node  |  Supported |
|-------|------------|
| 10    | ✅          |
| 12    | ✅          |
| 14    | ✅          |

## Supported Pip & Python versions (requirements.txt)

| Pip / Python   |2.7|3.6|3.7|3.8|3.9|
|----------------|---|---|---|---|---|
| 9.0.3          | ✅ | ✅ | ✅ | ✅ | ✅ |
| 10.0.0         | ✅ | ✅ | ✅ | ✅ | ✅ |
| 18.1.0         | ✅ | ✅ | ✅ | ✅ | ✅ |

## Supported Poetry versions (`pyproject.toml` and `poetry.lock`)
All known versions are expected to be supported (current latest version is 1.1.6)

## Snyk Python CLI Plugin

This plugin provides dependency metadata for Python projects that use one of the following dependency management methods:

* `pip` with a `requirements.txt` file
* `pipenv` with a `Pipfile` file
* `poetry` with `pyproject.toml` and `poetry.lock`

There's a special `only-provenance` mode that allows extracting of top-level dependencies with
their corresponding positions in the original manifest file.

## Contributing

[Guide](https://github.com/snyk/snyk-python-plugin/blob/master/.github/CONTRIBUTING.md)

### Developing and Testing

Prerequisites:
- Node.js 8+
- Python 2.7 or 3.6+
- Installed outside of any virtualenv:
    - [pip](https://pip.pypa.io/en/stable/installing/)
    - the contents of `dev-requirements.txt`:
      ```
      pip install --user -r dev-requirements.txt
      ```
- if in linux, `python-dev` installed with apt, or see [here](https://stackoverflow.com/a/21530768).

Tests can be run against multiple python versions by using tox:

```
pip install tox
tox
```

Linting and testing:
```
npm i
npm run lint
npm test
```
