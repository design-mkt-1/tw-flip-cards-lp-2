# The shell: header and footer at a glance

Every Top Win landing has the same header and the same footer. They are built
by `js/shell.js` and styled by `css/shell.css`, both shared files. A campaign
does not edit them. It chooses a few things through `campaign.js`.

The rules behind these numbers are in
[`.claude/skills/topwin-lp/references/decisions.md` §5 (header) and §6 (footer)](../.claude/skills/topwin-lp/references/decisions.md).

The breakpoint is **700px**, shared by both bars. Below it is the mobile
layout, at and above it the wide one.

---

## Header

![Header at 1280px](img/header-1280.png)

*1280px, wide layout. Logo at left, the language button at right.*

- **Bar:** 56px tall below 700px, 72px at 700px and above, with a gold hairline under it.
- **Logo:** 36px tall in the bar on wide. Below 700px it leaves the bar and sits
  centred on its own 60px row under it (32px tall). The logo is the brand's own file.
- **Language button:** 44px tall, a globe, the current code (UA / RU / EN), a caret.
- **Вхід / Реєстрація:** 44px tall. "Вхід" is an outline link to `links.login`
  (no `href` while it is empty). "Реєстрація" is the orange button; it calls
  `TW.openForm()`.

![Header at 375px](img/header-375.png)

*375px, mobile layout. The speaker appears here only when the campaign has sound.*

![Language menu open](img/lang-menu-1280.png)

*The language menu. It lists the languages in the order `campaign.js` gives, with a flag, the code and the name. The current one has a tick.*

- **Menu:** a listbox. It sits above the page and below the registration dialog.
- **Speaker:** 44px wide. It is drawn only when `header.mute` is true **and**
  `sounds` is not empty, so a dead speaker is never shown.

### What a campaign may change

| In `campaign.js` | Effect |
|---|---|
| `header.show` | Hides the whole header. |
| `header.lang` | Shows or hides the language button. It is also hidden when `languages` has one entry. |
| `header.mute` | Shows the speaker, if `sounds` has clips. |
| `header.auth` | Shows "Вхід" and "Реєстрація". Default true. |
| `brand.logoAlt` | The logo's alt text. |
| `links.home` | Where the logo goes. Empty means it is not a link. |
| `languages` | The languages and their order. The first is the default. |
| `strings` | The words: `hdr.lang`, `hdr.sound`, `hdr.login`, `hdr.register`, per locale. |

### What a campaign may NOT change

The structure, the sizes, the breakpoint, the icons and the logo artwork. These
live in `js/shell.js` and `css/shell.css`. A change to them is a change to every
landing, so it goes into the template, not into one campaign.

---

## Footer

![Footer at 1280px](img/footer-1280.png)

*Wide layout. Logo at left, then the copyright, then the payments label over the marks.*

![Footer at 375px](img/footer-375.png)

*375px, mobile layout. The payment marks, a rule, then the copyright. There is no logo.*

- **Wide:** one row. Logo (28px, no plate), the copyright right-aligned, then the
  payments column: label above the marks. Padding 48px top and 40px bottom.
- **Mobile:** a column, centred. The payment marks, a rule, then the copyright.
  The logo is left out. Both have a gold hairline on the top edge.
- **Payment marks:** 24px tall in a 36px badge. Visa, Mastercard, Tether and
  Bitcoin, drawn from the shared icons.

### What a campaign may change

| In `campaign.js` | Effect |
|---|---|
| `footer.show` | Hides the whole footer. |
| `brand.payments` | Which marks show, and in what order. |
| `strings` | The label above the marks (`footer.pay`) and the copyright line (`footer.copy`), per locale. |

The copyright year is part of the client's copy, so change it in `strings` and
not in the shell.

### What a campaign may NOT change

The layout, the two arrangements, the mark sizes and the logo.
The footer's logo is the brand's, and so are the payment icons.

---

## Where the rules live

- Structure and copy of both bars: `js/shell.js` (`headerHTML`, `footerHTML`).
- Sizes, the breakpoint and the layouts: `css/shell.css`.
- The reasons: [decisions.md §5](../.claude/skills/topwin-lp/references/decisions.md) and [§6](../.claude/skills/topwin-lp/references/decisions.md).
- Strings: `js/strings.js` (shared defaults) and `campaign.js § strings` (overrides).

Changing a shared file means the template's `CHANGELOG.md` and a `TEMPLATE-REV`
bump first. See `CAMPAIGN.md`, "If you need to change a shared file".
