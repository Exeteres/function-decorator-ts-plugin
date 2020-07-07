# Function Decorator TypeScript Plugin

A simple `tsserver` and `ts-patch` plugin that enables function decorators.

## Installation

```shell
npm i function-decorator-ts-plugin -D
# or
yarn add function-decorator-ts-plugin -D
```

## Usage

It is assumed that you will use `ts-patch` instead of `ttypescript`.

Just add this plugin to `tsconfig.json`:

```json
{
    "compilerOptions": {
        "plugins": [{
            "name": "function-decorator-ts-plugin",
            "transform": "function-decorator-ts-plugin/transformer"
        }]
    }
}
```

If you use VSCode, you need to switch the typescript version to local one by adding this setting in `.vscode/settings.json`:

```json
{
    "typescript.tsdk": "node_modules\\typescript\\lib"
}
```

## Limitations

- Decorated functions are not hoisted
- There is no type cheсking in decorator expressions
