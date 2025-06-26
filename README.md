# client-side

An Electron application with React

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```
In order to test with multiple instances, set `NODE_APP_INSTANCE=N`, and configure `local-n.json` in the config folder.
Usage: 
```bash
#Instance 1
$ npm run dev
```
```bash
#Instance 2
$ NODE_APP_INSTANCE=2 npm run dev
```
### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
