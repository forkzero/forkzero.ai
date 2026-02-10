import { describe, it, expect } from 'vitest'
import { renderContent, renderInline } from './BlogPage'

describe('renderInline', () => {
  it('renders plain text', () => {
    const result = renderInline('hello world')
    expect(result).toBeTruthy()
  })

  it('renders bold text', () => {
    const result = renderInline('some **bold** text')
    expect(result).toBeTruthy()
  })

  it('renders italic text', () => {
    const result = renderInline('some *italic* text')
    expect(result).toBeTruthy()
  })

  it('renders inline code', () => {
    const result = renderInline('use `lattice init` to start')
    expect(result).toBeTruthy()
  })

  it('renders links', () => {
    const result = renderInline('visit [GitHub](https://github.com)')
    expect(result).toBeTruthy()
  })
})

describe('renderContent', () => {
  it('renders a paragraph', () => {
    const blocks = renderContent('Hello world.')
    expect(blocks).toHaveLength(1)
  })

  it('renders a heading', () => {
    const blocks = renderContent('## My heading')
    expect(blocks).toHaveLength(1)
  })

  it('renders a code block', () => {
    const blocks = renderContent('```\nconst x = 1\n```')
    expect(blocks).toHaveLength(1)
  })

  it('renders bullet lists', () => {
    const blocks = renderContent('- one\n- two\n- three')
    expect(blocks).toHaveLength(1)
  })

  it('renders numbered lists', () => {
    const blocks = renderContent('1. one\n2. two\n3. three')
    expect(blocks).toHaveLength(1)
  })

  it('renders horizontal rules', () => {
    const blocks = renderContent('---')
    expect(blocks).toHaveLength(1)
  })

  it('renders blockquotes', () => {
    const blocks = renderContent('> This is a quote\n> — Author Name')
    expect(blocks).toHaveLength(1)
  })

  it('renders blockquotes without attribution', () => {
    const blocks = renderContent('> Just a plain quote')
    expect(blocks).toHaveLength(1)
  })

  it('renders insight callout blocks', () => {
    const blocks = renderContent(':::insight\nKey insight here.\n:::')
    expect(blocks).toHaveLength(1)
  })

  it('renders non-insight callout blocks', () => {
    const blocks = renderContent(':::note\nA note.\n:::')
    expect(blocks).toHaveLength(1)
  })

  it('renders callout with empty lines', () => {
    const blocks = renderContent(':::insight\n\nSome text after blank.\n:::')
    expect(blocks).toHaveLength(1)
  })

  it('renders diagram marker', () => {
    const blocks = renderContent('<!-- diagram:lattice-flow -->')
    expect(blocks).toHaveLength(1)
  })

  it('skips empty lines', () => {
    const blocks = renderContent('\n\n\n')
    expect(blocks).toHaveLength(0)
  })

  it('renders multiple block types together', () => {
    const content = [
      '## Heading',
      '',
      'A paragraph.',
      '',
      '> A quote',
      '> — Source',
      '',
      ':::insight',
      'An insight.',
      ':::',
      '',
      '<!-- diagram:lattice-flow -->',
      '',
      '- item one',
      '- item two',
    ].join('\n')
    const blocks = renderContent(content)
    expect(blocks.length).toBeGreaterThanOrEqual(5)
  })
})
