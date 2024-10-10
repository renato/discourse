import { registerExporter } from "composer-kit/exporter";
import emoji from "composer-kit/extensions/emoji";
import { registerImporter } from "composer-kit/importer";
import { registerNode } from "composer-kit/nodes";
import { registerShortcut } from "composer-kit/shortcuts";
import { TextAreaAutocomplete } from "discourse/lib/autocomplete";

const COMPOSER_DEFAULT = "default";

const composerImplementations = {
  default: {
    key: COMPOSER_DEFAULT,
    name: "Default", // TODO i18n
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

export function registerComposerExtension(extension) {
  extension.nodes?.forEach(registerNode);

  if (extension.node) {
    registerNode(extension.node);
  }

  if (extension.importer) {
    registerImporter(extension.importer);
  }

  if (extension.exporter) {
    registerExporter(extension.exporter);
  }

  if (extension.shortcut) {
    registerShortcut(extension.shortcut);
  }
}

// Register the default composer extensions

[emoji].forEach(registerComposerExtension);
