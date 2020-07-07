type TS = typeof import("typescript/lib/tsserverlibrary");

function init(modules: { typescript: TS }) {
    function create(info: ts.server.PluginCreateInfo) {
        // Set up decorator
        const proxy: ts.LanguageService = Object.create(null);
        for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
            const x = info.languageService[k];
            proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
        }

        // Remove specified entries from diagnostic list
        proxy.getSemanticDiagnostics = fileName => {
            const errors = info.languageService.getSemanticDiagnostics(fileName);
            const result: ts.Diagnostic[] = [];
            for (const error of errors) {
                if (error.code !== 1206) {
                    result.push(error);
                    continue;
                }

                // TODO perform type checking here
            }

            return result;
        };

        return proxy;
    }

    return { create };
}

export = init;
