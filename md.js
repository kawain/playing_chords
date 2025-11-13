import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

const markdownText = `


`

const html = md.render(markdownText)

console.log(html)
