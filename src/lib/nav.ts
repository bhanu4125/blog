/**
 * Determines whether a given navigation target matches or is parent to the current URL pathname.
 */
export function isNavActive(currentPath: string, targetPath: string): boolean {
  if (targetPath === "/") {
    return currentPath === "/";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}
