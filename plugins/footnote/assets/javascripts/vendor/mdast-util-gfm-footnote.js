/* eslint-disable */

/*! mdast-util-gfm-footnote 2.0.0 https://github.com/syntax-tree/mdast-util-gfm-footnote @license MIT */

/**
 * @typedef {import('mdast').FootnoteDefinition} FootnoteDefinition
 * @typedef {import('mdast').FootnoteReference} FootnoteReference
 * @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
 * @typedef {import('mdast-util-to-markdown').Map} Map
 * @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
 */

/**
 * Create an extension for `mdast-util-to-markdown` to enable GFM footnotes
 * in markdown.
 *
 * @returns {ToMarkdownExtension}
 *   Extension for `mdast-util-to-markdown`.
 */
export function gfmFootnoteToMarkdown() {
  return {
    // This is on by default already.
    unsafe: [{character: '[', inConstruct: ['phrasing', 'label', 'reference']}],
    handlers: {footnoteDefinition, footnoteReference}
  }
}

/**
 * @type {ToMarkdownHandle}
 * @param {FootnoteReference} node
 */
function footnoteReference(node, _, state, info) {
  const tracker = state.createTracker(info)
  let value = tracker.move('[^')
  const exit = state.enter('footnoteReference')
  const subexit = state.enter('reference')
  value += tracker.move(
    state.safe(state.associationId(node), {
      ...tracker.current(),
      before: value,
      after: ']'
    })
  )
  subexit()
  exit()
  value += tracker.move(']')
  return value
}

/**
 * @type {ToMarkdownHandle}
 * @param {FootnoteDefinition} node
 */
function footnoteDefinition(node, _, state, info) {
  const tracker = state.createTracker(info)
  let value = tracker.move('[^')
  const exit = state.enter('footnoteDefinition')
  const subexit = state.enter('label')
  value += tracker.move(
    state.safe(state.associationId(node), {
      ...tracker.current(),
      before: value,
      after: ']'
    })
  )
  subexit()
  value += tracker.move(
    ']:' + (node.children && node.children.length > 0 ? ' ' : '')
  )
  tracker.shift(4)
  value += tracker.move(
    state.indentLines(state.containerFlow(node, tracker.current()), map)
  )
  exit()

  return value
}

/** @type {Map} */
function map(line, index, blank) {
  if (index === 0) {
    return line
  }

  return (blank ? '' : '    ') + line
}
