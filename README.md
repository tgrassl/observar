![](https://i.imgsafe.org/4c/4c403200ac.png)

[![npm](https://img.shields.io/npm/v/observar?style=for-the-badge)](https://www.npmjs.com/package/observar)

Watch and act! - `observar` is a simple file watcher and command executor that helps you during development.

## Install 
Install `observar` globally using npm:

```bash
npm install observar -g
```

## Usage 
Once the installation is done, you can run the command inside your project's directory and set the npm command you want to execute on file changes.
```bash
observar -s my_command
```
By default `observar` will watch your current directory but you can also change this setting:

Single folder
```bash
observar folder_name -s my_command
```

Multiple folders
```bash
observar folder_name folder2_name -s my_command
```

Glob Pattern e.g. src/**.js
```bash
observar glob_pattern -s my_command
```

If you want to ignore specific files, directories, etc. add the --ignore or -i argument.

```bash
observar folder_name -s my_command -i folder_name
```

Finally, run this command to see a list of all available options:

```bash
observar --help
```

### Example Usage
```bash
$ observar src/**.js -s format-lint -i dist/
```
