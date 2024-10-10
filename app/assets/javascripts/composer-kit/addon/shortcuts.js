const SHORTCUTS = [];

export function getShortcuts() {
  return SHORTCUTS;
}

export function registerShortcut(shortcut) {
  SHORTCUTS.push(shortcut);
}
