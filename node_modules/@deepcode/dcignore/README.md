# dcignore
This repository offers a default implementation of the .dcignore file and an automatic generator based on common .gitignore patterns found in https://github.com/github/gitignore

# CLI usage
1. Clone this repository
2. Copy the `full.dcignore` file into the root of your project and rename it `.dcignore`

# Module usage
1. `npm install @deepcode/dcignore`
2. Import the module.
3. Use the `DefaultDCIgnore` string to fill a standard .dcignore file.
4. Use the `CustomDCIgnore` string if you need to initialize an empty .dcignore with some content.

### Javascript
```javascript
const { DefaultDCIgnore, CustomDCIgnore } = require('@deepcode/dcignore');
```

### Typescript
```javascript
import { DefaultDCIgnore, CustomDCIgnore } from "@deepcode/dcignore";
```
