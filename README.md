![Plotapi](https://plotapi.com/wp-content/uploads/2021/08/1500x500.jpeg)

# @shahinrostami/theme-purple-please

A JupyterLab theme extension which provides the Purple Please theme.

![Screenshot of Purple Please in action](screenshot.png)

**Note:** I put this together for myself for dealing with Python, it's essentially a modification of the default template. You may see some colours from the old template appear in cases I haven't encountered yet. Please raise an issue and I'll take a look.

## Funding

Please consider sponsoring this work with [Github Sponsor https://github.com/sponsors/shahinrostami](https://github.com/sponsors/shahinrostami).

## Prerequisites

- JupyterLab (v1, v2, or v3)

## Installation

```bash
jupyter labextension install @shahinrostami/theme-purple-please
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

Inspired by the [shades-of-purple](https://github.com/ahmadawais/shades-of-purple-vscode) theme for VSCode.
