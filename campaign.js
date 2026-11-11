/* ═══════════════════════════════════════════════════════════════
   THE CAMPAIGN FILE

   This is the only file a new campaign edits, apart from campaign/main.js
   (the mechanic), campaign/assets/ (its art) and the <main> block in
   index.html.

   Nothing in js/ or css/ should be touched. `python tools/drift.py` fails CI
   if it is, and a change that genuinely belongs to every campaign belongs in
   the template repo, not in a clone — that is exactly how the last two
   landings ended up with four different oranges.

   Every key below ships with a working default and a comment saying what it
   does. Empty string means "not set", and every consumer treats it as an
   absence rather than as an empty value: an unset link is not a dead link,
   an unset endpoint is not a broken form.
   ═══════════════════════════════════════════════════════════════ */

window.TW_CAMPAIGN = {

  /* ── Identity ─────────────────────────────────────────────────
     `id` rides on the form payload as landing_id and on every analytics
     event. Use the repo name. */
  id: 'tw-flip-cards-lp-2',

  /* ── The offer ────────────────────────────────────────────────
     NUMBERS ONLY. The words around them live in `strings` below, once per
     locale, and interpolate {percent} {amount} {currency} {spins}.

     Written here once and never repeated per language. Changing the offer
     from 225% / 15000 to 300% / 20000 is a two-value edit in this block and
     no language table is touched.

     currency: 'UAH' is safe everywhere. '₴' also works — the template ships
     the two one-glyph Noto cuts that carry U+20B4, because Roboto has none at
     any weight and a missing glyph still renders something. If you change
     currency, run `python tools/fonts.py --check`.

     spins: '' hides the "+ N FS" line entirely.

     hero: which figure is drawn large, in Orange Fire, with the rest under it.
     'percent' or 'amount'; leave it out and the percent leads if there is one,
     otherwise the amount. A sportsbook leads with 225%, a casino with
     250.000 ₴ — same card, one key apart. Spins are never the hero.
     The shell drops the hero to a smaller step above five characters, so a
     long amount does not have to be shortened by hand.

     If the amount leads, override `promo.amount` in `strings` below to the
     figure alone — '{amount} {currency}'. The shipped wording is
     'up to {amount} {currency}', which is a qualifier under a headline, not a
     headline. */
  offer: {
    percent:  '',
    amount:   '250\u00a0000',   // non-breaking: "250 000" never splits across lines
    currency: '\u20b4',        // the hryvnia sign, served by the two Noto cuts
    spins:    '250',
    hero:     'amount',
    code:     ''             // NOT sent to IT's platform; see below
  },

  /* offer.code is read by js/form.js § payload() as the field `bonus`, and
     that payload only leaves the page when the form is NOT on the platform:
     form.endpoint, or the console in demo mode. js/platform.js builds its own
     body and sends `promocode` from IT's landing response, so on a connected
     landing the promo code is set by IT, on their CRM landing, and this value
     goes nowhere. Fill it only for a landing that posts to its own endpoint,
     and only with a code the client gave. It is also {code} in `strings`. */

  /* ── Where the buttons go ─────────────────────────────────────
     '' leaves the anchor WITHOUT an href, so it is not a link at all: no tab
     stop, nothing announced, nothing to click. Never write href="#" — a mark
     that takes focus and then does nothing reads as a broken control.

       home     header logo
       login    "Already have an account? Log in", under the CTA  ← platform
       terms    consent sentence, first link                       ← platform
       privacy  consent sentence, second link                      ← platform
       cta      the done screen's "GO TO WEBSITE" button

     With the platform connected, terms, privacy and login come from IT's
     landing response (`rules`, `policy`, `login`; js/platform.js § applyLinks)
     and IT does nothing for them. The values here are only a fallback for when
     the landing call fails; '' then leaves the anchor without an href.

     A landing that is NOT on the platform has no other source: there terms
     and privacy block go-live, because the page collects an 18+ consent and
     dead consent links on a gambling registration form are a compliance
     problem, not a cosmetic one. */
  links: {
    home:    '',
    login:   '',
    terms:   '',
    privacy: '',
    cta:     ''
  },

  /* ── Tracking and affiliate ───────────────────────────────────
     `params` is appended to every URL in `links` above and copied into the
     form payload.

     `passthrough` names query parameters on THIS page's URL that ride through
     to the outbound click. That is how an affiliate click id survives the
     landing page: the ad network puts ?click_id=… on the landing URL, and the
     visitor arrives at the operator with the same id attached. Neither of the
     two earlier landings had this and the ids were lost. */
  params: {
    // utm_source:   'facebook',
    // utm_medium:   'cpc',
    // utm_campaign: 'demo-225'
  },
  passthrough: ['click_id', 'sub1', 'sub2', 'gclid', 'fbclid', 'ttclid'],

  /* ── Analytics ────────────────────────────────────────────────
     With the IT platform connected (js/platform.js), the analytics IDs come
     from the landing response: GA, Yandex Metrika and GTM load from there, as
     IT's own LP loads them, and the CSP in index.html allows those origins.
     Leave gtmId and metaPixelId empty unless a tag is needed that IT does not
     load, and check the console for a tag that loads twice.

     debug: true logs every TW.track() call instead of needing a tag
     assistant. */
  analytics: {
    gtmId:       '',
    metaPixelId: '',
    debug:       false
  },

  /* ── The registration form ────────────────────────────────────
     endpoint '' is the shipped default and means nothing is sent: the
     validated payload goes to console.info and, with demoDone true, the
     confirmation screen is walked anyway. The page is fully demoable before
     the platform exists, and it cannot silently half-ship.

     When IT is ready they set `endpoint` and the form POSTs JSON to it. A
     response carrying { login, password } fills the confirmation screen.
     `onRegister(payload)` is the escape hatch for anything more involved; it
     returns a promise and overrides `endpoint`.

     The password is in the payload, because a registration hook without one
     is useless — which means `endpoint` must point at the operator's own
     TLS endpoint and nowhere else.

     dialFlag is an SVG file, not an emoji: Windows renders 🇺🇦 as the
     letters "UA". */
  form: {
    endpoint:     '',
    /* js/platform.js owns the registration: config, landing, reCAPTCHA, the
       POST and the SSO redirect. It overrides `endpoint`, which stays empty.
       Remove this line only if the campaign connects to a different API, and
       then set `endpoint` (or this function) to that API instead. */
    onRegister:   function (payload) { return window.TWPlatform.register(payload); },
    /* landing_id is NOT here: the platform's numeric id comes from config.json
       (or platform.dev), and a string of ours would only compete with it.
       Anything put here is copied onto the request body BEFORE the platform's
       own fields, so it can add a field but never overwrite one. */
    hiddenFields: {},
    demoDone:     true,
    dialCode:     '+380',
    dialFlag:     'assets/img/icons/flag-ua.svg',
    phoneDigits:  9,
    passwordMin:  8
  },

  /* ── The IT platform (js/platform.js) ─────────────────────────
     In production the page reads `configUrl` from its own root, one file per
     landing, written on the server and never committed (see CAMPAIGN.md,
     "Connect to IT"):
       { "id": <number>, "email_registration": "<url>", "landing": "<url>" }
     Without that file the page is NOT connected: the form walks the demo
     confirmation screen and logs a warning to the console. Nothing on screen
     says so, which is why the first deploy must be checked in the console.

     `dev` is for a TopWin development landing, which IT has not issued yet.
     Ask IT for its id and its two URLs and fill all three in. It is used
     ONLY on localhost, 127.0.0.1 or an origin starting with https://land-crm,
     and only when all three are set. While they are empty, localhost runs
     the demo path (no request) and land-crm reads config.json. Never put
     another brand's landing here (topwin-lp skill, decision 21).

     supportEmail is shown on the "unavailable" card: support@top-win.com
     (owner, 2026-11-11). If it is ever emptied, the card shows no address
     and uses pl.off.textNoMail, a sentence without "write to us". */
  platform: {
    configUrl:    'config.json',
    supportEmail: 'support@top-win.com',
    dev: {
      id: null,
      email_registration: '',
      landing:            ''
    }
  },

  /* ── Languages ────────────────────────────────────────────────
     Order is the order of the header menu. THE FIRST ENTRY IS THE DEFAULT
     AND THE FALLBACK, so its tables have to be complete.

     Every code listed needs an entry in js/strings.js (TW_STRINGS and
     TW_LOCALES) and in `strings` below. tools/smoke.py fails on any key that
     renders as its own key.

     languageUrls: leave it empty and this landing is ONE HTML file whose
     table swaps in place, the choice persists in localStorage, and ?lang=ru
     forces a language for a media buyer's creative.

     Fill it and each language is its own file instead: the menu navigates,
     <html lang> on the file decides the language, and neither a saved choice
     nor ?lang can override it. That is for a landing that has to serve three
     indexable URLs with hreflang between them, the way tw-flip-cards-lp
     does. It costs the runtime switch and buys the three pages.

       languageUrls: { ua: './index.html', ru: './ru.html', en: './en.html' }
  */
  languages: ['ua', 'ru', 'en'],
  languageUrls: {},

  /* ── Brand and chrome ─────────────────────────────────────────
     These are the same in every TopWin campaign and are here only because a
     campaign occasionally needs one of them: header.mute should be false for
     a campaign with no audio, so the bar does not render a dead speaker. */
  brand: {
    logo:       'assets/img/logo-topwin.svg',
    logoAlt:    'Top Win',
    themeColor: '#040412',                    // --navy-950
    payments:   ['visa', 'mastercard', 'tether', 'bitcoin']
  },
  /* header.auth: the "Вхід" (links.login) and "Реєстрація" (opens the card)
     buttons in the bar. Default true; false leaves both out.
     header.loginOpensForm: default false ("Вхід" is a link to links.login, no
     href while unset). true makes "Вхід" a <button> that calls TW.openForm(),
     the same as "Реєстрація". The in-form "Already have an account? Log in"
     link is not affected. ON in this LP only. */
  header: { show: true, mute: false, lang: true, auth: true, loginOpensForm: true },

  /* ── Sound ────────────────────────────────────────────────────
     name -> file, and empty is the shipped default: no Audio element is made,
     and the header renders no speaker even if header.mute above is true.

     The mechanic plays a clip with TW.sound('name', 0.9). js/audio.js owns the
     rest -- nothing loads until the visitor's first gesture, the mute state
     persists, and a file that fails to load simply never plays.

       sounds: {
         flip: 'campaign/assets/audio/flip.mp3',
         win:  'campaign/assets/audio/win.mp3'
       }

     Set header.mute to true alongside this, or the visitor cannot turn it off. */
  sounds: {},
  footer: { show: true },

  /* ── Campaign copy, per locale ────────────────────────────────
     ONLY the strings this campaign owns. Everything the header, the footer
     and the registration dialog say lives in js/strings.js and is never
     copied here — this table is merged OVER that one, so anything repeated
     here is a fork waiting to happen.

     Override a shell key deliberately if a campaign needs different words
     (a casino campaign wanting 'promo.title' to say casino rather than
     sports), and only then.

     \n is a real line break in the rendered text. Do not put markup in a
     string; if a sentence needs a link inside it, split it the way
     agree.pre / agree.terms / agree.mid / agree.privacy / agree.post are
     split in js/strings.js. */
  strings: {
    ua: {
      'title':       'Top Win — Вітальний бонус',
      'kicker':        'ПЕРЕВЕРНИ КАРТКИ',
      'headline':      'ЗАБЕРИ СВІЙ БОНУС!',
      'counter':       'Відкрито {n} з 9',
      'status.start':  'Відкривай карти по одній та збери 3 однакові',
      'status.good':   'Чудовий старт! Шукай ще такі карти',
      'status.almost': 'Майже! Наступна карта може стати виграшною',
      'status.win':    'Вітаємо! 3 однакові — бонус твій!',
      'claim':         'Забери {amount} {currency} + {spins} FS',
      'card.back':     'Закрита картка {n} з 9',
      'card.face':     'Картка {n} з 9: {prize}',
      'card.win':      'Картка {n} з 9, виграшна: {prize}',
      'promo.title':   'Вітальний бонус',
      'promo.amount':  '{amount} {currency}',
      'promo.spins':   '+ {spins} фріспінів',
      'pl.off.title':   'Сторінка тимчасово недоступна',
      'pl.off.text':    'Реєстрація зараз закрита. Спробуйте пізніше або напишіть нам:',
      'pl.off.textNoMail': 'Реєстрація зараз закрита. Спробуйте пізніше.',
      'err.exists':     'Цей email уже зареєстровано. Увійдіть в акаунт',
      'err.recaptcha':  'Не вдалося пройти перевірку безпеки. Спробуйте ще раз'
    },
    ru: {
      'title':       'Top Win — Приветственный бонус',
      'kicker':        'ПЕРЕВЕРНИ КАРТЫ',
      'headline':      'ЗАБЕРИ СВОЙ БОНУС!',
      'counter':       'Открыто {n} из 9',
      'status.start':  'Открывай карты по одной и собери 3 одинаковые',
      'status.good':   'Отличный старт! Ищи ещё такие карты',
      'status.almost': 'Почти! Следующая карта может стать выигрышной',
      'status.win':    'Поздравляем! 3 одинаковые — бонус твой!',
      'claim':         'Забери {amount} {currency} + {spins} FS',
      'card.back':     'Закрытая карта {n} из 9',
      'card.face':     'Карта {n} из 9: {prize}',
      'card.win':      'Карта {n} из 9, выигрышная: {prize}',
      'promo.title':   'Приветственный бонус',
      'promo.amount':  '{amount} {currency}',
      'promo.spins':   '+ {spins} фриспинов',
      'pl.off.title':   'Страница временно недоступна',
      'pl.off.text':    'Регистрация сейчас закрыта. Попробуйте позже или напишите нам:',
      'pl.off.textNoMail': 'Регистрация сейчас закрыта. Попробуйте позже.',
      'err.exists':     'Этот email уже зарегистрирован. Войдите в аккаунт',
      'err.recaptcha':  'Не удалось пройти проверку безопасности. Попробуйте ещё раз'
    },
    en: {
      'title':       'Top Win — Welcome bonus',
      'kicker':        'FLIP THE CARDS',
      'headline':      'CLAIM YOUR BONUS!',
      'counter':       '{n} of 9 opened',
      'status.start':  'Open the cards one by one and match 3',
      'status.good':   'Great start! Look for more like it',
      'status.almost': 'Almost! The next card could be the winner',
      'status.win':    'Congratulations! 3 of a kind — the bonus is yours!',
      'claim':         'Claim {amount} {currency} + {spins} FS',
      'card.back':     'Face-down card {n} of 9',
      'card.face':     'Card {n} of 9: {prize}',
      'card.win':      'Card {n} of 9, winning: {prize}',
      'promo.title':   'Welcome bonus',
      'promo.amount':  '{amount} {currency}',
      'promo.spins':   '+ {spins} free spins',
      'pl.off.title':   'This page is temporarily unavailable',
      'pl.off.text':    'Registration is closed right now. Please try again later or write to us:',
      'pl.off.textNoMail': 'Registration is closed right now. Please try again later.',
      'err.exists':     'This email is already registered. Please log in',
      'err.recaptcha':  'The security check failed. Please try again'
    }
  }
};
