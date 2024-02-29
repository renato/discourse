import { TextAreaAutocomplete } from "discourse/lib/autocomplete";

const COMPOSER_DEFAULT = "default";

const composerImplementations = {
  default: {
    key: COMPOSER_DEFAULT,
    name: "Default", // TODO i18n
    handleExtension() {},
    textManipulationImpl: TextAreaAutocomplete,
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

export function getDefaultComposerImplementation() {
  return getComposerImplementation(COMPOSER_DEFAULT);
}
