const TEMPLATE_EXPRESSION = /\{\{([^{}]{2,256})\}\}/g;
const BRACKET_SEGMENT = /\[(?:"([^"]+)"|'([^']+)'|(\d+))\]/g;
const SAFE_PATH = /^[A-Za-z_$][\w$]*(?:\.(?:[A-Za-z_$][\w$]*|\d+))*$/;

export function valuefyTemplate(text: string, context: unknown): string {
  return text.replace(TEMPLATE_EXPRESSION, (match, expression) => {
    const value = resolveTemplatePath(String(expression), context);

    if (value === undefined || value === null) {
      return "";
    }

    return String(value);
  });
}

function resolveTemplatePath(expression: string, context: unknown): unknown {
  const normalizedPath = expression
    .trim()
    .replace(/^this\./, "")
    .replace(BRACKET_SEGMENT, (_, doubleQuoted, singleQuoted, numeric) => {
      return `.${doubleQuoted || singleQuoted || numeric}`;
    });

  if (!SAFE_PATH.test(normalizedPath)) {
    return undefined;
  }

  return normalizedPath.split(".").reduce<unknown>((current, segment) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, context);
}
