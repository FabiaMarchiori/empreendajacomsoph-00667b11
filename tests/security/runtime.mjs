import ts from "typescript";
export function withoutConsole(source, path) {
  source = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
      removeComments: true,
    },
  }).outputText;
  const file = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith("tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const result = ts.transform(file, [
    (context) => {
      const visit = (node) => {
        if (
          ts.isExpressionStatement(node) &&
          ts.isCallExpression(node.expression) &&
          ts.isPropertyAccessExpression(node.expression.expression) &&
          node.expression.expression.expression.getText(file) === "console"
        )
          return undefined;
        return ts.visitEachChild(node, visit, context);
      };
      return (n) => ts.visitNode(n, visit);
    },
  ]);
  const text = ts
    .createPrinter({ removeComments: true })
    .printFile(result.transformed[0]);
  result.dispose();
  return text;
}
// Compiler-normalized runtime text; the vendored function retains source formatting.
export function canonicalRuntime(source, path) {
  return withoutConsole(source, path);
}
