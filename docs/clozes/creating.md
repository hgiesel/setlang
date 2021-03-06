---
layout: doc
title: Creating clozes
nav_order: 1
permalink: clozes/creating
parent: Clozes
---

{% include toc-doc.md %}

---
## Unnumbered Clozes

Clozes are surrounded by `c` tags.
By default, an unnumbered cloze will always be considered [inactive](/clozes#active-and-inactive-clozes).

{% include codeDisplay.md content=cloze.first_example setups="default_cloze,assign_categories" buttons=buttons.frontBack %}

Wow. As you can see, absolutely nothing happens.
This is the specified behavior: the tag is inactive, and the default behavior for inactive clozes of this kind is to show their content.

You can make this more interesting by either using [numbered clozes](#numbered-clozes), or by using [hiding or revealing clozes](#showing-hiding-and-revealing-clozes).

---
## Numbered Clozes

Numbered clozes are go along with the notion of [active clozes](/clozes#active-and-inactive-clozes).
Depending on the _context_, the card will be displayed differently.

In Anki, this context is provided for us in the form of card types.
Closet will use this information and render the card accordingly.

{% include codeDisplay.md content=cloze.numbered_cloze setups="default_cloze" buttons=buttons.twoCards %}

### Zero Clozes

Another way to have active clozes is by using _zero clozes_.
The counting for tag indices starts at __1__.
If you provide a __0__ instead, it signals that this cloze is always supposed to be active.

This way you can use clozes even outside of Note Types which are specifically set up to work with clozes.

{% include codeDisplay.md content=cloze.zero_cloze setups="default_cloze" buttons=buttons.frontBack %}

---
## Showing, Hiding, and Revealing Clozes

In the above examples non-current clozes simply displayed their content.
These are called _showing clozes_.

To avoid interference, you might want to hide the content, or only hide the content on the front and show on the back.
For the first case, you'd use _hiding clozes_, for the second case you'd use _revealing clozes_.

{% include codeDisplay.md content=cloze.hiding_cloze setups="default_cloze" buttons=buttons.threeCards %}

In this example you can see how each cloze type acts differently.

You can also this cloze subtypes to generally hide undesirable context on flash cards.

{% include codeDisplay.md content=cloze.hide_context setups="default_cloze" buttons=buttons.frontBack %}

---
## Hints

Rather than showing the ellipsis symbol, you can also provide a _hint_ instead.
This hint is provided as the second parameter in the tag.

{% include codeDisplay.md content=cloze.hints setups="default_cloze" buttons=buttons.threeCards %}

This is only one of the possible behaviors of how cards can act in the _test context_.
For more examples, see the [next chapter](/clozes/blanking-obscuring).
