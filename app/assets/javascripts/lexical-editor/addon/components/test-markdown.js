export const test1 = `# Title

> This chunk of text is in a block quote. Its multiple lines will all be
> indented a bit from the rest of the text.
>
> > Multiple levels of block quotes also work.

    Code fences

>     Code fences

# This is H1
## This is H2
### This is H3 with some extra pounds ###
#### You get the idea ####
##### I don't need extra pounds at the end
###### H6 is the max

# Links

Bare URL: <https://www.github.com>.
Next is an inline link to [Google](https://www.google.com).
Lastly, here's a pretty link to [YahoO].

[Yahoo]: https://www.yahoo.com

Title attribute [inline link](https://www.bing.com "Bing").
You can also go to [W3C] [2] and maybe visit a [friend].

[2]: https://w3c.org (The W3C puts out specs for web-based things)
[Friend]: https://facebook.com "Facebook!"

Email addresses in plain text: test@example.com.
Email addresses in angle brackets: <test@example.com>.

# Lists

* This is a bulleted list
* Great for shopping lists
- You can also use hyphens
+ Or plus symbols

The above is an "unordered" list. Now, on for a bit of order.

1. Numbered lists are also easy
2. Just start with a number
3738762. However, the actual number doesn't matter when converted to HTML.
1. This will still show up as 4.

You might want a few advanced lists:

- This top-level list is wrapped in paragraph tags
- This generates an extra space between each top-level item.

- You do it by adding a blank line

- This nested list also has blank lines between the list items.

- How to create nested lists
  1. Start your regular list
  2. Indent nested lists with two spaces
  3. Further nesting means you should indent with two more spaces
    * This line is indented with four spaces.

- List items can be quite lengthy. You can keep typing and either continue
them on the next line with no indentation.

- Alternately, if that looks ugly, you can also
  indent the next line a bit for a prettier look.

- You can put large blocks of text in your list by just indenting with two spaces.

  This is formatted the same as code, but it's not.

  You can keep adding more and more paragraphs.

  You really only need to indent the first line,
but that looks ugly.

- Lists support blockquotes

  > Just like this example here. By the way, you can
  > nest lists inside blockquotes!
  > - Fantastic!

- Lists support preformatted text

      You just need to indent an additional four spaces.

# Horizontal Rule


---
****************************
_ _ _ _ _ _ _

# Images

![Google Logo](https://www.google.com/images/errors/logo_sm.gif) and ![Happy].

[Happy]: https://wpclipart.com/smiley/happy/simple_colors/smiley_face_simple_green_small.png ("Smiley face")

# Inline HTML

<strike>crazy</strike> HTML. Span-level HTML <u>can *still* use markdown</u>.

<div style='font-family: "Comic Sans MS", "Comic Sans", cursive;'>
Another HTML test
</div>`;


export const test2 = `# Title
## Subtitle
### Sub-subtitle
<div data-theme-toc="true"> </div>

* item a
* item b

1. item 1
2. item 2

- # A header
  with some text
- and next item

[date=2024-01-26 timezone="America/Sao_Paulo"]

[date-range from=2024-01-26T11:30:00 to=2024-01-27T12:30:00 timezone="America/Sao_Paulo"]

![alt text|498x280|thumbnail](https://media.tenor.com/yRmBAzuk6hkAAAAC/impressed-youre-good.gif "title")

> | Column 1 | Column 2 | Column 3 | Column 4|
> |--- | --- | --- | ---|
> |a | b | c | d|
> |1 | 2 | 3 | 4|

[spoiler]This text will be blurred[/spoiler]

[poll type=regular results=always public=true chartType=bar]
* Title
* Option 1
* Option 2
[/poll]

---

* \`\`\`
  Code block inside list :tada:
  \`\`\`
* > Quote inside ~~list~~, **b** *em* [link](https://example.com) \`code inline\`

> \`\`\`
> Code block inside quote
> \`\`\`
> * List inside quote :tada:
> * List inside quote
>
> 2. List inside quote
> 3. List inside quote, with a #tag

[wrap=toc name="single quote's" id='1"2']taco[/wrap]

:tada:

BBCode [b]b[/b] [i]i[/i] [u]u[/u] [s]s[/s]

[details="**Details** title"]
this is a details section
[/details]

^[this is a footnote]

[quote="sam, post:1, topic:1, full:true"]
hello
> quote inside quote
> multiline and
> \`\`\`js
> with code
> \`\`\`
[details="**Details** title"]
this is a details section
\`\`\`js
this is code inside details inside quote
\`\`\`
[/details]
[/quote]`;

export const test3 = `- # A header
  with some text`;
