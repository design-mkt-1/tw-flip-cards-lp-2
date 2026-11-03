/* ═══════════════════════════════════════════════════════════════
   THE MECHANIC — flip cards 2

   Nine cards face down. Prizes are dealt by CLICK ORDER, not by position:
   whichever card the visitor turns next shows the next face of a script that
   was drawn once, at page load. The visitor always wins, on the 4th or the
   5th card (a coin flip per page load), with three 250 000 UAH cards.

     winAt = 4   opens 1..3 hold two 250k and one 100%, shuffled; open 4 = 250k
     winAt = 5   opens 1..4 hold two 250k, one 100% and one 250%, shuffled;
                 open 5 = 250k

   Rules the script keeps, by construction: exactly two 250k before the win,
   so a third one can only be the win; 650% never shows before the win (it is
   reserved for the reveal of the unopened cards, where it reads as "what you
   could have found").

   Win sequence (timings in timing()):
     lock the board -> the three matches take the win state -> after a beat
     the opened non-matches dim and the unopened cards flip dimmed -> the claim
     button appears. TW.track('game_win') fires with the win state, and
     TW.openForm() is called once, automatically, 1500 ms after the last flip
     begins. The claim button always opens the form and stays on screen.

   Refresh = new game. Nothing persists.

   Ported from tw-flip-cards-lp/js/flip.js: shuffle, flipCard, setPips,
   announce, revealRest, onGridClick, the lock and the reduced-motion timings.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var TOTAL = 9;
  var AUTO_FORM_MS = 1500;

  /* 250 000 and 250 FS come from campaign.js § offer so the card, the claim
     button and the form hero can never disagree. Non-breaking spaces keep
     "250 000 ₴" on one line inside the card. */
  var NB = ' ';

  function grouped(n) { return String(n).replace(/\s+/g, NB); }

  function prizes(offer) {
    return {
      k250: { big: grouped(offer.amount) + NB + offer.currency, fs: offer.spins + ' FS', big_cls: 'is-amount' },
      p650: { big: '650%', fs: '250 FS' },
      p250: { big: '250%', fs: '50 FS' },
      p100: { big: '100%', fs: '10 FS' }
    };
  }

  /* Fisher-Yates. Shuffles the PRIZES, never the DOM nodes: tab order stays
     the reading order. */
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  /* The deck: what the 1st, 2nd ... winAt-th open will show. */
  function buildScript(winAt) {
    var before = winAt === 4 ? ['k250', 'k250', 'p100']
                             : ['k250', 'k250', 'p100', 'p250'];
    var s = shuffle(before);
    s.push('k250');
    return s;
  }

  var REVEAL_CYCLE = ['p650', 'p250', 'p100'];

  function reducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* flip: the rotation (or the crossfade); hold: the beat between the last
     card landing and the board reacting; reveal: extra beat before the rest
     of the board turns. Same numbers as v1. */
  function timing() {
    return reducedMotion()
      ? { flip: 220, hold:  80, reveal:   0 }
      : { flip: 520, hold: 240, reveal: 240 };
  }

  TW.ready(function () {
    var grid    = document.getElementById('cmp-grid');
    var dots    = document.getElementById('cmp-dots');
    var counter = document.getElementById('cmp-counter');
    var hint    = document.getElementById('cmp-hint');
    var claim   = document.getElementById('cmp-claim');
    var live    = document.getElementById('cmp-live');
    var pill    = document.querySelector('.cmp-pill');
    if (!grid || !claim) return;

    var cells = Array.prototype.slice.call(grid.querySelectorAll('.cmp-cell'));
    var P = prizes(TW.config.offer || {});

    var winAt  = Math.random() < 0.5 ? 4 : 5;
    var script = buildScript(winAt);

    var state = {
      opened: 0,          /* cards turned by the visitor */
      locked: false,
      won: false,
      status: 'start',    /* start | good | almost | win */
      lastCard: null,
      formOpened: false
    };

    /* ── text ────────────────────────────────────────────────── */

    function prizeText(key) { return P[key].big + ' + ' + P[key].fs; }

    function setLabel(cell) {
      var btn = cell.querySelector('.cmp-card');
      var n = cells.indexOf(cell) + 1;
      var label;
      if (cell.dataset.face !== 'front') {
        label = TW.t('card.back', { n: n });
      } else {
        label = TW.t(cell.hasAttribute('data-win') ? 'card.win' : 'card.face',
                     { n: n, prize: prizeText(cell.dataset.prize) });
      }
      btn.setAttribute('aria-label', label);
    }

    function announce(text) {
      /* Cleared first so an identical sentence is announced again. */
      live.textContent = '';
      window.setTimeout(function () { live.textContent = text; }, 30);
    }

    function setPips(n) {
      var pips = dots.children;
      for (var i = 0; i < pips.length; i++) {
        if (i < n) pips[i].setAttribute('data-on', '');
        else pips[i].removeAttribute('data-on');
      }
    }

    function render() {
      counter.textContent = TW.t('counter', { n: state.opened });
      hint.textContent = TW.t('status.' + state.status);
      setPips(state.opened);
      cells.forEach(setLabel);
    }

    /* ── the face ────────────────────────────────────────────── */

    function img(cls, src) {
      var el = document.createElement('img');
      el.className = cls;
      el.src = 'campaign/assets/' + src;
      el.alt = '';
      el.setAttribute('aria-hidden', 'true');
      el.decoding = 'async';
      return el;
    }

    /* Built when the card is turned, so the markup that paints first carries
       nine backs and nothing else. aria-hidden: the button's own label says
       what the card shows. */
    function buildFace(key) {
      var face = document.createElement('span');
      face.className = 'cmp-face cmp-face--front';
      face.setAttribute('aria-hidden', 'true');

      face.appendChild(img('cmp-face__bg', 'card-face-bg.svg'));
      face.appendChild(img('cmp-face__rays', 'card-face-rays.svg'));
      face.appendChild(img('cmp-face__glow', 'card-face-glow.svg'));
      ['tl', 'tr', 'bl', 'br'].forEach(function (c) {
        face.appendChild(img('cmp-face__corner cmp-face__corner--' + c, 'card-face-corner-' + c + '.svg'));
      });
      face.appendChild(img('cmp-face__orn cmp-face__orn--top', 'card-face-orn-top.svg'));
      face.appendChild(img('cmp-face__orn cmp-face__orn--bottom', 'card-face-orn-bottom.svg'));

      var sheen = document.createElement('span');
      sheen.className = 'cmp-face__sheen';
      face.appendChild(sheen);

      var text = document.createElement('span');
      text.className = 'cmp-face__text' + (P[key].big_cls ? ' ' + P[key].big_cls : '');
      [['big', P[key].big], ['plus', '+'], ['fs', P[key].fs]].forEach(function (l) {
        var line = document.createElement('span');
        line.className = 'cmp-face__' + l[0];
        line.textContent = l[1];
        text.appendChild(line);
      });
      face.appendChild(text);
      return face;
    }

    function turn(cell, key, dim) {
      var btn = cell.querySelector('.cmp-card');
      cell.dataset.prize = key;
      cell.querySelector('.cmp-flip').appendChild(buildFace(key));
      if (dim) cell.setAttribute('data-dim', '');
      /* One frame with the face in the tree and the card still showing its
         back, then the attribute the transition runs on. */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          cell.dataset.face = 'front';
          btn.setAttribute('aria-pressed', 'true');
          setLabel(cell);
        });
      });
    }

    /* ── the game ────────────────────────────────────────────── */

    function flipCard(cell) {
      var key = script[state.opened];
      var isWin = state.opened === winAt - 1;

      /* Lock before the winning flip starts, so a fast clicker cannot turn a
         tenth card while the win sequence runs. */
      if (isWin) state.locked = true;

      state.opened += 1;
      state.lastCard = cell.querySelector('.cmp-card');
      cell.setAttribute('data-opened', '');
      turn(cell, key, false);

      if (isWin) {
        runWinSequence();
      } else {
        /* "Almost" only when the very next card is the win: two 250k are
           open AND this was the open before the win. */
        state.status = state.opened === winAt - 1 ? 'almost' : 'good';
        render();
        announce(counter.textContent + '. ' + hint.textContent);
      }
    }

    function revealRest() {
      var rest = cells.filter(function (c) { return c.dataset.face !== 'front'; });
      var step = Math.round(timing().flip / 8);
      rest.forEach(function (cell, i) {
        window.setTimeout(function () {
          turn(cell, REVEAL_CYCLE[i % REVEAL_CYCLE.length], true);
        }, i * step);
      });
    }

    function showClaim() {
      claim.hidden = false;
      pill.hidden = true;     /* the claim takes the pill's row; the win line stays above it */
      /* hidden -> visible is a two-step: display cannot transition. */
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { claim.classList.add('is-on'); });
      });
    }

    function runWinSequence() {
      var T = timing();

      /* 1. the flip lands, the three matches take the win state */
      window.setTimeout(function () {
        cells.forEach(function (c) {
          if (c.dataset.prize === 'k250') c.setAttribute('data-win', '');
          setLabel(c);
        });
        state.won = true;
        state.status = 'win';
        render();
        announce(counter.textContent + '. ' + hint.textContent);
        TW.track('game_win', { mechanic: 'flip-cards-2', opens: winAt });
      }, T.flip);

      /* 2. after a beat: non-matches dim, the unopened cards turn, claim */
      window.setTimeout(function () {
        cells.forEach(function (c) {
          if (c.hasAttribute('data-opened') && !c.hasAttribute('data-win')) c.setAttribute('data-dim', '');
        });
        grid.setAttribute('data-phase', 'reveal');
        revealRest();
        showClaim();
      }, T.flip + T.hold + T.reveal);

      /* 3. the form, once, unless the visitor already opened it */
      window.setTimeout(function () {
        if (!state.formOpened) openForm();
      }, T.flip + AUTO_FORM_MS);
    }

    function openForm() {
      state.formOpened = true;
      /* js/form.js hands focus back to whatever held it when the card
         opened. Give it the last turned card, not <body>. */
      if (state.lastCard) state.lastCard.focus({ preventScroll: true });
      TW.openForm();
    }

    grid.addEventListener('click', function (ev) {
      var cell = ev.target.closest ? ev.target.closest('.cmp-cell') : null;
      if (!cell || !grid.contains(cell)) return;
      if (state.locked || cell.dataset.face === 'front') return;
      flipCard(cell);
    });

    /* The claim button always opens the form, before and after the auto-open
       and after the form closes. It is not the "once" in the auto-open. */
    claim.addEventListener('click', function () {
      state.formOpened = true;
      TW.openForm();
    });

    TW.on('lang', render);
    render();
  });
}());
