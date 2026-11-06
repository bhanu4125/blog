/**
 * Determines whether a given navigation target matches or is parent to the current URL pathname.
 */
export function isNavActive(currentPath: string, targetPath: string): boolean {
  // Strip query parameters and hashes if present
  const cleanPath = currentPath.split("?")[0].split("#")[0];

  if (targetPath === "/") {
    return cleanPath === "/";
  }

  return cleanPath === targetPath || cleanPath.startsWith(`${targetPath}/`);
}
