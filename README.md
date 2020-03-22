<a href='https://ko-fi.com/L3L71J8NI' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://az743702.vo.msecnd.net/cdn/kofi5.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

# @shahinrostami/theme-purple-please

A JupyterLab theme extension which provides the Purple Please theme, inspired by the [shades-of-purple](https://github.com/ahmadawais/shades-of-purple-vscode) theme for VSCode.

**Note:** I put this together for myself for dealing with Python, it's essentially a modification of the default template. You may see some colours from the old template appear in cases I haven't encountered yet. Please raise an issue and I'll take a look.

![Screenshot of Purple Please in action](screenshot.png)

## Prerequisites

* JupyterLab

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
