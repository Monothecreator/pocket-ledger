export function publicError(message: string) {
  return { error: message };
}

export function logServerError(context: string, error: unknown) {
  const name = error instanceof Error ? error.name : "UnknownError";
  console.error(`[pocket-ledger:${context}] ${name}`);
}
