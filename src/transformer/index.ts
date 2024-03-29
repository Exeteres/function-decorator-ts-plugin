import ts from "typescript";

function createDecoratorChain(expression: ts.Expression, decorators: ts.Decorator[]) {
    if (!decorators.length) {
        return expression;
    }
    const decorator = decorators.pop();
    return ts.createCall(decorator.expression, undefined, [
        createDecoratorChain(expression, decorators)
    ]);
}

function hasFlag(node: ts.Declaration, flag: ts.ModifierFlags) {
    return (ts.getCombinedModifierFlags(node) & flag) === flag;
}

const transformer = (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
        if (sourceFile.isDeclarationFile) {
            return sourceFile;
        }
        function visitor(node: ts.Node) {
            if (!ts.isFunctionDeclaration(node) || !node.decorators) {
                return ts.visitEachChild(node, visitor, ctx);
            }
            const result: ts.Node[] = [];
            const variableStatement = ts.createVariableStatement(
                undefined,
                ts.createVariableDeclarationList(
                    [
                        ts.createVariableDeclaration(
                            node.name,
                            undefined,
                            createDecoratorChain(
                                ts.createFunctionExpression(
                                    undefined,
                                    node.asteriskToken,
                                    node.name,
                                    node.typeParameters,
                                    node.parameters,
                                    node.type,
                                    node.body
                                ),
                                Array.from(node.decorators)
                            )
                        )
                    ],
                    ts.NodeFlags.Const
                )
            );
            result.push(variableStatement);

            if (hasFlag(node, ts.ModifierFlags.ExportDefault)) {
                const exportDefault = ts.createExportDefault(node.name);
                result.push(exportDefault);
            } else if (hasFlag(node, ts.ModifierFlags.Export)) {
                const exportDeclaration = ts.createExportDeclaration(
                    undefined,
                    undefined,
                    ts.createNamedExports([ts.createExportSpecifier(undefined, node.name)])
                );
                result.push(exportDeclaration);
            }

            return result;
        }

        return ts.visitEachChild(sourceFile, visitor, ctx);
    };
};

export default function (program: ts.Program, host: ts.CompilerHost | undefined) {
    const sourceFiles = program.getSourceFiles() as ts.SourceFile[];
    const result = ts.transform(sourceFiles, [transformer]).transformed;
    const options = program.getCompilerOptions();
    if (!host) {
        host = ts.createCompilerHost(options);
    }
    host.getSourceFile = fileName => {
        const file = result.find(x => x.fileName === fileName);
        if(!file) return;
        const updated = ts.updateSourceFileNode(file, [...file.statements]);
        if (!updated["ambientModuleNames"]) {
            updated["ambientModuleNames"] = updated["original"]["ambientModuleNames"] ?? [];
        }
        return updated;
    };
    return ts.createProgram(program.getRootFileNames(), options, host, program);
}
