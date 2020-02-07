![](https://i.ibb.co/LJVnKvd/observar-repo-banner-2.png)

[![npm](https://flat.badgen.net/npm/v/observar)](https://www.npmjs.com/package/observar)
[![install size](https://flat.badgen.net/packagephobia/install/observar)](https://packagephobia.now.sh/result?p=observar)

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

__Single folder__
```bash
observar folder_name -s my_command
```

__Multiple folders__
```bash
observar folder_name folder2_name -s my_command
```

__Glob Pattern e.g. src/**.js__
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
$ observar src/**.js -s format-lint -i src/ignore-this-folder/
```

## License
Code released under the [MIT License](https://github.com/tgrassl/observar/blob/master/LICENSE).

Enjoy ⭐️
