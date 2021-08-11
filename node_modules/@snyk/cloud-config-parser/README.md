![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)

***
# Snyk cloud-config-parser

A utility library for identifying the issue path in a YAML/JSON/HCL file and returning the relevant line number in order to highlight the relevant line to the users in their files.

This library is being used as part of snyk cloud configuration product.

## How it works

The library has two main methods:
1. `getTrees` - this function receives a fileType and a configuration fileContent and builds the relevant tree (FileStructureTree). An example tree would look like this:
```   
   '0': {
      nodes: [
         {
            key: 'apiVersion',
            lineLocation: {
            columnEnd: 14,
            columnStart: 4,
            line: 2,
         },
         values: [...],
         {...},
      ],
   '1': {...}
   ...
   },
   ```
2. `getLineNumber`- this function receives a path (array of strings) , a fileType (YAML/JSON/HCL), and a tree and returns the number of the line which is the closest to the path received.
   In case that the full path does not exist, the returned line number will correspond to the deepest entry in the path array that was found.

The function `issuesToLineNumbers` invokes both of them: it will build the tree by parsing the fileContent and then return the lineNumber.

## Examples:  

---

For the received path: 

- ```['spec', 'template', 'spec', 'containers[0]', 'nonExistingResource', 'securityContext', 'capabilities']``` 

It will return the line number of the first element in the containers array (because nonExistingResource does not exist).

For the received path: 

- ```['spec', 'template', 'spec', 'containers[0]', 'resources', 'securityContext', 'capabilities']```

It will return the line number of 'capabilities'.


### Elements with array:
---

Until now, the paths received in the Cloud Config issues were `containers[snyky1]`, where `snyky1` was the value of the `name` property in one of the objects in `containers`.  

We are supporting both `containers[snyky1]` and `containers[0]`, while the new issues will be in the format of `containers[0]`.

The piece of code that creates the paths is creating elements like `containers[0]`, but in cases of `containers[snyky1]`, it goes over the elements of the array and looks for a sub-element with key: `name` and value `snyky1`.  


### **Paths starting with 'input'**  
---

For example:  

```['input', 'spec', 'template', 'spec', 'containers[0]', 'resources', 'securityContext', 'capabilities']```

The input value will be removed and the path we are looking for will be like this:  

```['spec', 'template', 'spec', 'containers[0]', 'resources', 'securityContext', 'capabilities']```

### **Yaml DocId:**
---

- In the case that the files are JSON or single Yaml - the `DocId` will be `0`.  
- In the case of a multi-document file - the `DocId` will be according to the order of the documets.


### Line numbers
---
Are 1 based!


### Keys - not value
---

We are looking for the key in the path and not the value.

For example , `drop` may have multiple values as an array of strings. We can show `drop[0]` as the first array of values but not `drop['192.168.0.1']`.
