import { textAreaManipulationImpl } from "discourse/lib/autocomplete";

const composerImplementations = {
  default: {
    key: "default",
    name: "Default", // TODO i18n
    handleExtension() {},
    textManipulationImpl: textAreaManipulationImpl,
    allowPreview: true,
  },
};

export function registerComposer(implementation) {
  if (implementation.key === "default") {
    throw new Error("Cannot register a composer with the key 'default'");
  }

  composerImplementations[implementation.key] = implementation;
}

export function registerComposerExtension(composerKey, extension) {
  composerImplementations[composerKey]?.handleExtension?.(extension);
}

export function getComposerImplementation(composerKey) {
  return composerImplementations[composerKey];
}

export function getComposerImplementationCount() {
  return Object.keys(composerImplementations).length;
}

export function getComposerImplementationList() {
  return Object.values(composerImplementations);
}
