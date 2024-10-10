const TRANSFORMERS = {};

export function getTransformers() {
  return TRANSFORMERS;
}

export function registerExporter(transformer) {
  Object.assign(TRANSFORMERS, transformer);
}
