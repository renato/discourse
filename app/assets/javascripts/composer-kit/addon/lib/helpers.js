export function getDOMRange(nativeSelection, rootElement) {
  const domRange = nativeSelection.getRangeAt(0);

  let range;

  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild;
    }
    range = inner;
  } else {
    range = domRange;
  }

  return range;
}
