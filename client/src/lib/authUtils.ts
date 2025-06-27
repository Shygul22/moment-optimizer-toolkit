export function isUnauthorizedError(error: Error): boolean {
  return (
    /^401: .*Unauthorized/.test(error.message) ||
    error.message.includes('401') || 
    error.message.includes('Unauthorized') ||
    (error as any).status === 401
  );
}