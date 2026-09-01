#!/usr/bin/env bun
// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// ../../node_modules/.bun/sisteransi@1.0.5/node_modules/sisteransi/src/index.js
var require_src = __commonJS((exports, module) => {
  var ESC2 = "\x1B";
  var CSI2 = `${ESC2}[`;
  var beep = "\x07";
  var cursor = {
    to(x, y) {
      if (!y)
        return `${CSI2}${x + 1}G`;
      return `${CSI2}${y + 1};${x + 1}H`;
    },
    move(x, y) {
      let ret = "";
      if (x < 0)
        ret += `${CSI2}${-x}D`;
      else if (x > 0)
        ret += `${CSI2}${x}C`;
      if (y < 0)
        ret += `${CSI2}${-y}A`;
      else if (y > 0)
        ret += `${CSI2}${y}B`;
      return ret;
    },
    up: (count = 1) => `${CSI2}${count}A`,
    down: (count = 1) => `${CSI2}${count}B`,
    forward: (count = 1) => `${CSI2}${count}C`,
    backward: (count = 1) => `${CSI2}${count}D`,
    nextLine: (count = 1) => `${CSI2}E`.repeat(count),
    prevLine: (count = 1) => `${CSI2}F`.repeat(count),
    left: `${CSI2}G`,
    hide: `${CSI2}?25l`,
    show: `${CSI2}?25h`,
    save: `${ESC2}7`,
    restore: `${ESC2}8`
  };
  var scroll = {
    up: (count = 1) => `${CSI2}S`.repeat(count),
    down: (count = 1) => `${CSI2}T`.repeat(count)
  };
  var erase = {
    screen: `${CSI2}2J`,
    up: (count = 1) => `${CSI2}1J`.repeat(count),
    down: (count = 1) => `${CSI2}J`.repeat(count),
    line: `${CSI2}2K`,
    lineEnd: `${CSI2}K`,
    lineStart: `${CSI2}1K`,
    lines(count) {
      let clear = "";
      for (let i = 0;i < count; i++)
        clear += this.line + (i < count - 1 ? cursor.up() : "");
      if (count)
        clear += cursor.left;
      return clear;
    }
  };
  module.exports = { cursor, scroll, erase, beep };
});

// ../../node_modules/.bun/@clack+core@1.4.3/node_modules/@clack/core/dist/index.mjs
import { styleText } from "util";
import { stdout, stdin } from "process";
import l__default from "readline";

// ../../node_modules/.bun/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/utils.js
var getCodePointsLength = (() => {
  const SURROGATE_PAIR_RE = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return (input) => {
    let surrogatePairsNr = 0;
    SURROGATE_PAIR_RE.lastIndex = 0;
    while (SURROGATE_PAIR_RE.test(input)) {
      surrogatePairsNr += 1;
    }
    return input.length - surrogatePairsNr;
  };
})();
var isFullWidth = (x) => {
  return x === 12288 || x >= 65281 && x <= 65376 || x >= 65504 && x <= 65510;
};
var isWideNotCJKTNotEmoji = (x) => {
  return x === 8987 || x === 9001 || x >= 12272 && x <= 12287 || x >= 12289 && x <= 12350 || x >= 12441 && x <= 12543 || x >= 12549 && x <= 12591 || x >= 12593 && x <= 12686 || x >= 12688 && x <= 12771 || x >= 12783 && x <= 12830 || x >= 12832 && x <= 12871 || x >= 12880 && x <= 19903 || x >= 65040 && x <= 65049 || x >= 65072 && x <= 65106 || x >= 65108 && x <= 65126 || x >= 65128 && x <= 65131 || x >= 127488 && x <= 127490 || x >= 127504 && x <= 127547 || x >= 127552 && x <= 127560 || x >= 131072 && x <= 196605 || x >= 196608 && x <= 262141;
};

// ../../node_modules/.bun/fast-string-truncated-width@3.0.3/node_modules/fast-string-truncated-width/dist/index.js
var ANSI_RE = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]|\u001b\]8;[^;]*;.*?(?:\u0007|\u001b\u005c)/y;
var CONTROL_RE = /[\x00-\x08\x0A-\x1F\x7F-\x9F]{1,1000}/y;
var CJKT_WIDE_RE = /(?:(?![\uFF61-\uFF9F\uFF00-\uFFEF])[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Tangut}]){1,1000}/yu;
var TAB_RE = /\t{1,1000}/y;
var EMOJI_RE = /[\u{1F1E6}-\u{1F1FF}]{2}|\u{1F3F4}[\u{E0061}-\u{E007A}]{2}[\u{E0030}-\u{E0039}\u{E0061}-\u{E007A}]{1,3}\u{E007F}|(?:\p{Emoji}\uFE0F\u20E3?|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation})(?:\u200D(?:\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F\u20E3?))*/yu;
var LATIN_RE = /(?:[\x20-\x7E\xA0-\xFF](?!\uFE0F)){1,1000}/y;
var MODIFIER_RE = /\p{M}+/gu;
var NO_TRUNCATION = { limit: Infinity, ellipsis: "" };
var getStringTruncatedWidth = (input, truncationOptions = {}, widthOptions = {}) => {
  const LIMIT = truncationOptions.limit ?? Infinity;
  const ELLIPSIS = truncationOptions.ellipsis ?? "";
  const ELLIPSIS_WIDTH = truncationOptions?.ellipsisWidth ?? (ELLIPSIS ? getStringTruncatedWidth(ELLIPSIS, NO_TRUNCATION, widthOptions).width : 0);
  const ANSI_WIDTH = 0;
  const CONTROL_WIDTH = widthOptions.controlWidth ?? 0;
  const TAB_WIDTH = widthOptions.tabWidth ?? 8;
  const EMOJI_WIDTH = widthOptions.emojiWidth ?? 2;
  const FULL_WIDTH_WIDTH = 2;
  const REGULAR_WIDTH = widthOptions.regularWidth ?? 1;
  const WIDE_WIDTH = widthOptions.wideWidth ?? FULL_WIDTH_WIDTH;
  const PARSE_BLOCKS = [
    [LATIN_RE, REGULAR_WIDTH],
    [ANSI_RE, ANSI_WIDTH],
    [CONTROL_RE, CONTROL_WIDTH],
    [TAB_RE, TAB_WIDTH],
    [EMOJI_RE, EMOJI_WIDTH],
    [CJKT_WIDE_RE, WIDE_WIDTH]
  ];
  let indexPrev = 0;
  let index = 0;
  let length = input.length;
  let lengthExtra = 0;
  let truncationEnabled = false;
  let truncationIndex = length;
  let truncationLimit = Math.max(0, LIMIT - ELLIPSIS_WIDTH);
  let unmatchedStart = 0;
  let unmatchedEnd = 0;
  let width = 0;
  let widthExtra = 0;
  outer:
    while (true) {
      if (unmatchedEnd > unmatchedStart || index >= length && index > indexPrev) {
        const unmatched = input.slice(unmatchedStart, unmatchedEnd) || input.slice(indexPrev, index);
        lengthExtra = 0;
        for (const char of unmatched.replaceAll(MODIFIER_RE, "")) {
          const codePoint = char.codePointAt(0) || 0;
          if (isFullWidth(codePoint)) {
            widthExtra = FULL_WIDTH_WIDTH;
          } else if (isWideNotCJKTNotEmoji(codePoint)) {
            widthExtra = WIDE_WIDTH;
          } else {
            widthExtra = REGULAR_WIDTH;
          }
          if (width + widthExtra > truncationLimit) {
            truncationIndex = Math.min(truncationIndex, Math.max(unmatchedStart, indexPrev) + lengthExtra);
          }
          if (width + widthExtra > LIMIT) {
            truncationEnabled = true;
            break outer;
          }
          lengthExtra += char.length;
          width += widthExtra;
        }
        unmatchedStart = unmatchedEnd = 0;
      }
      if (index >= length) {
        break outer;
      }
      for (let i = 0, l = PARSE_BLOCKS.length;i < l; i++) {
        const [BLOCK_RE, BLOCK_WIDTH] = PARSE_BLOCKS[i];
        BLOCK_RE.lastIndex = index;
        if (BLOCK_RE.test(input)) {
          lengthExtra = BLOCK_RE === CJKT_WIDE_RE ? getCodePointsLength(input.slice(index, BLOCK_RE.lastIndex)) : BLOCK_RE === EMOJI_RE ? 1 : BLOCK_RE.lastIndex - index;
          widthExtra = lengthExtra * BLOCK_WIDTH;
          if (width + widthExtra > truncationLimit) {
            truncationIndex = Math.min(truncationIndex, index + Math.floor((truncationLimit - width) / BLOCK_WIDTH));
          }
          if (width + widthExtra > LIMIT) {
            truncationEnabled = true;
            break outer;
          }
          width += widthExtra;
          unmatchedStart = indexPrev;
          unmatchedEnd = index;
          index = indexPrev = BLOCK_RE.lastIndex;
          continue outer;
        }
      }
      index += 1;
    }
  return {
    width: truncationEnabled ? truncationLimit : width,
    index: truncationEnabled ? truncationIndex : length,
    truncated: truncationEnabled,
    ellipsed: truncationEnabled && LIMIT >= ELLIPSIS_WIDTH
  };
};
var dist_default = getStringTruncatedWidth;

// ../../node_modules/.bun/fast-string-width@3.0.2/node_modules/fast-string-width/dist/index.js
var NO_TRUNCATION2 = {
  limit: Infinity,
  ellipsis: "",
  ellipsisWidth: 0
};
var fastStringWidth = (input, options = {}) => {
  return dist_default(input, NO_TRUNCATION2, options).width;
};
var dist_default2 = fastStringWidth;

// ../../node_modules/.bun/fast-wrap-ansi@0.2.2/node_modules/fast-wrap-ansi/lib/main.js
var ESC = "\x1B";
var CSI = "\x9B";
var END_CODE = 39;
var ANSI_ESCAPE_BELL = "\x07";
var ANSI_CSI = "[";
var ANSI_OSC = "]";
var ANSI_SGR_TERMINATOR = "m";
var ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;
var GROUP_REGEX = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`, "y");
var getClosingCode = (openingCode) => {
  if (openingCode >= 30 && openingCode <= 37)
    return 39;
  if (openingCode >= 90 && openingCode <= 97)
    return 39;
  if (openingCode >= 40 && openingCode <= 47)
    return 49;
  if (openingCode >= 100 && openingCode <= 107)
    return 49;
  if (openingCode === 1 || openingCode === 2)
    return 22;
  if (openingCode === 3)
    return 23;
  if (openingCode === 4)
    return 24;
  if (openingCode === 7)
    return 27;
  if (openingCode === 8)
    return 28;
  if (openingCode === 9)
    return 29;
  if (openingCode === 0)
    return 0;
  return;
};
var wrapAnsiCode = (code) => `${ESC}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
var wrapAnsiHyperlink = (url) => `${ESC}${ANSI_ESCAPE_LINK}${url}${ANSI_ESCAPE_BELL}`;
var wrapWord = (rows, word, columns) => {
  const characters = word[Symbol.iterator]();
  let isInsideEscape = false;
  let isInsideLinkEscape = false;
  let lastRow = rows.at(-1);
  let visible = lastRow === undefined ? 0 : dist_default2(lastRow);
  let currentCharacter = characters.next();
  let nextCharacter = characters.next();
  let rawCharacterIndex = 0;
  while (!currentCharacter.done) {
    const character = currentCharacter.value;
    const characterLength = dist_default2(character);
    if (visible + characterLength <= columns) {
      rows[rows.length - 1] += character;
    } else {
      rows.push(character);
      visible = 0;
    }
    if (character === ESC || character === CSI) {
      isInsideEscape = true;
      isInsideLinkEscape = word.startsWith(ANSI_ESCAPE_LINK, rawCharacterIndex + 1);
    }
    if (isInsideEscape) {
      if (isInsideLinkEscape) {
        if (character === ANSI_ESCAPE_BELL) {
          isInsideEscape = false;
          isInsideLinkEscape = false;
        }
      } else if (character === ANSI_SGR_TERMINATOR) {
        isInsideEscape = false;
      }
    } else {
      visible += characterLength;
      if (visible === columns && !nextCharacter.done) {
        rows.push("");
        visible = 0;
      }
    }
    currentCharacter = nextCharacter;
    nextCharacter = characters.next();
    rawCharacterIndex += character.length;
  }
  lastRow = rows.at(-1);
  if (!visible && lastRow !== undefined && lastRow.length && rows.length > 1) {
    rows[rows.length - 2] += rows.pop();
  }
};
var stringVisibleTrimSpacesRight = (string) => {
  const words = string.split(" ");
  let last = words.length;
  while (last) {
    if (dist_default2(words[last - 1])) {
      break;
    }
    last--;
  }
  if (last === words.length) {
    return string;
  }
  return words.slice(0, last).join(" ") + words.slice(last).join("");
};
var exec = (string, columns, options = {}) => {
  if (options.trim !== false && string.trim() === "") {
    return "";
  }
  let returnValue = "";
  let escapeCode;
  let escapeUrl;
  const words = string.split(" ");
  let rows = [""];
  let rowLength = 0;
  for (let index = 0;index < words.length; index++) {
    const word = words[index];
    if (options.trim !== false) {
      const row = rows.at(-1) ?? "";
      const trimmed = row.trimStart();
      if (row.length !== trimmed.length) {
        rows[rows.length - 1] = trimmed;
        rowLength = dist_default2(trimmed);
      }
    }
    if (index !== 0) {
      if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
        rows.push("");
        rowLength = 0;
      }
      if (rowLength || options.trim === false) {
        rows[rows.length - 1] += " ";
        rowLength++;
      }
    }
    const wordLength = dist_default2(word);
    if (options.hard && wordLength > columns) {
      const remainingColumns = columns - rowLength;
      const breaksStartingThisLine = 1 + Math.floor((wordLength - remainingColumns - 1) / columns);
      const breaksStartingNextLine = Math.floor((wordLength - 1) / columns);
      if (breaksStartingNextLine < breaksStartingThisLine) {
        rows.push("");
      }
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    if (rowLength + wordLength > columns && rowLength && wordLength) {
      if (options.wordWrap === false && rowLength < columns) {
        wrapWord(rows, word, columns);
        rowLength = dist_default2(rows.at(-1) ?? "");
        continue;
      }
      rows.push("");
      rowLength = 0;
    }
    if (rowLength + wordLength > columns && options.wordWrap === false) {
      wrapWord(rows, word, columns);
      rowLength = dist_default2(rows.at(-1) ?? "");
      continue;
    }
    rows[rows.length - 1] += word;
    rowLength += wordLength;
  }
  if (options.trim !== false) {
    rows = rows.map((row) => stringVisibleTrimSpacesRight(row));
  }
  const preString = rows.join(`
`);
  let inSurrogate = false;
  for (let i = 0;i < preString.length; i++) {
    const character = preString[i];
    returnValue += character;
    if (!inSurrogate) {
      inSurrogate = character >= "\uD800" && character <= "\uDBFF";
      if (inSurrogate) {
        continue;
      }
    } else {
      inSurrogate = false;
    }
    if (character === ESC || character === CSI) {
      GROUP_REGEX.lastIndex = i + 1;
      const groupsResult = GROUP_REGEX.exec(preString);
      const groups = groupsResult?.groups;
      if (groups?.code !== undefined) {
        const code = Number.parseFloat(groups.code);
        escapeCode = code === END_CODE ? undefined : code;
      } else if (groups?.uri !== undefined) {
        escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
      }
    }
    if (preString[i + 1] === `
`) {
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink("");
      }
      const closingCode = escapeCode ? getClosingCode(escapeCode) : undefined;
      if (escapeCode && closingCode) {
        returnValue += wrapAnsiCode(closingCode);
      }
    } else if (character === `
`) {
      if (escapeCode && getClosingCode(escapeCode)) {
        returnValue += wrapAnsiCode(escapeCode);
      }
      if (escapeUrl) {
        returnValue += wrapAnsiHyperlink(escapeUrl);
      }
    }
  }
  return returnValue;
};
var CRLF_OR_LF = /\r?\n/;
function wrapAnsi(string, columns, options) {
  return String(string).normalize().split(CRLF_OR_LF).map((line) => exec(line, columns, options)).join(`
`);
}

// ../../node_modules/.bun/@clack+core@1.4.3/node_modules/@clack/core/dist/index.mjs
var import_sisteransi = __toESM(require_src(), 1);
function findCursor(s, o, l) {
  if (!l.some((r) => !r.disabled))
    return s;
  const t = s + o, n = Math.max(l.length - 1, 0), e = t < 0 ? n : t > n ? 0 : t;
  return l[e]?.disabled ? findCursor(e, o < 0 ? -1 : 1, l) : e;
}
function findTextCursor(s, o, l, i) {
  const t = i.split(`
`);
  let n = 0, e = s;
  for (const r of t) {
    if (e <= r.length)
      break;
    e -= r.length + 1, n++;
  }
  for (n = Math.max(0, Math.min(t.length - 1, n + l)), e = Math.min(e, t[n].length) + o;e < 0 && n > 0; )
    n--, e += t[n].length + 1;
  for (;e > t[n].length && n < t.length - 1; )
    e -= t[n].length + 1, n++;
  e = Math.max(0, Math.min(t[n].length, e));
  let h = 0;
  for (let r = 0;r < n; r++)
    h += t[r].length + 1;
  return h + e;
}
var a$1 = ["up", "down", "left", "right", "space", "enter", "cancel"];
var t = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var settings = {
  actions: new Set(a$1),
  aliases: /* @__PURE__ */ new Map([
    ["k", "up"],
    ["j", "down"],
    ["h", "left"],
    ["l", "right"],
    ["\x03", "cancel"],
    ["escape", "cancel"]
  ]),
  messages: {
    cancel: "Canceled",
    error: "Something went wrong"
  },
  withGuide: true,
  date: {
    monthNames: [...t],
    messages: {
      required: "Please enter a valid date",
      invalidMonth: "There are only 12 months in a year",
      invalidDay: (n, e) => `There are only ${n} days in ${e}`,
      afterMin: (n) => `Date must be on or after ${n.toISOString().slice(0, 10)}`,
      beforeMax: (n) => `Date must be on or before ${n.toISOString().slice(0, 10)}`
    }
  }
};
function isActionKey(n, e) {
  if (typeof n == "string")
    return settings.aliases.get(n) === e;
  for (const s of n)
    if (s !== undefined && isActionKey(s, e))
      return true;
  return false;
}
function diffLines(i, s) {
  if (i === s)
    return;
  const e = i.split(`
`), t2 = s.split(`
`), r = Math.max(e.length, t2.length), f = [];
  for (let n = 0;n < r; n++)
    e[n] !== t2[n] && f.push(n);
  return {
    lines: f,
    numLinesBefore: e.length,
    numLinesAfter: t2.length,
    numLines: r
  };
}
var R = globalThis.process.platform.startsWith("win");
var CANCEL_SYMBOL = Symbol("clack:cancel");
function isCancel(e) {
  return e === CANCEL_SYMBOL;
}
function setRawMode(e, r) {
  const o = e;
  o.isTTY && o.setRawMode(r);
}
var getRows = (e) => ("rows" in e) && typeof e.rows == "number" ? e.rows : 20;
function runValidation(e, n) {
  if ("~standard" in e) {
    const a = e["~standard"].validate(n);
    if (a instanceof Promise)
      throw new TypeError("Schema validation must be synchronous. Update `validate()` and remove any asynchronous logic.");
    return a.issues?.at(0)?.message;
  }
  return e(n);
}

class V {
  input;
  output;
  _abortSignal;
  rl;
  opts;
  _render;
  _track = false;
  _prevFrame = "";
  _subscribers = /* @__PURE__ */ new Map;
  _cursor = 0;
  state = "initial";
  error = "";
  value;
  userInput = "";
  constructor(t2, e = true) {
    const { input: i = stdin, output: n = stdout, render: s, signal: r, ...o } = t2;
    this.opts = o, this.onKeypress = this.onKeypress.bind(this), this.close = this.close.bind(this), this.render = this.render.bind(this), this._render = s.bind(this), this._track = e, this._abortSignal = r, this.input = i, this.output = n;
  }
  unsubscribe() {
    this._subscribers.clear();
  }
  setSubscriber(t2, e) {
    const i = this._subscribers.get(t2) ?? [];
    i.push(e), this._subscribers.set(t2, i);
  }
  on(t2, e) {
    this.setSubscriber(t2, { cb: e });
  }
  once(t2, e) {
    this.setSubscriber(t2, { cb: e, once: true });
  }
  emit(t2, ...e) {
    const i = this._subscribers.get(t2) ?? [], n = [];
    for (const s of i)
      s.cb(...e), s.once && n.push(() => i.splice(i.indexOf(s), 1));
    for (const s of n)
      s();
  }
  prompt() {
    return new Promise((t2) => {
      if (this._abortSignal) {
        if (this._abortSignal.aborted)
          return this.state = "cancel", this.close(), t2(CANCEL_SYMBOL);
        this._abortSignal.addEventListener("abort", () => {
          this.state = "cancel", this.close();
        }, { once: true });
      }
      this.rl = l__default.createInterface({
        input: this.input,
        tabSize: 2,
        prompt: "",
        escapeCodeTimeout: 50,
        terminal: true
      }), this.rl.prompt(), this.opts.initialUserInput !== undefined && this._setUserInput(this.opts.initialUserInput, true), this.input.on("keypress", this.onKeypress), setRawMode(this.input, true), this.output.on("resize", this.render), this.render(), this.once("submit", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(this.value);
      }), this.once("cancel", () => {
        this.output.write(import_sisteransi.cursor.show), this.output.off("resize", this.render), setRawMode(this.input, false), t2(CANCEL_SYMBOL);
      });
    });
  }
  _isActionKey(t2, e) {
    return t2 === "\t";
  }
  _shouldSubmit(t2, e) {
    return true;
  }
  _setValue(t2) {
    this.value = t2, this.emit("value", this.value);
  }
  _setUserInput(t2, e) {
    this.userInput = t2 ?? "", this.emit("userInput", this.userInput), e && this._track && this.rl && (this.rl.write(this.userInput), this._cursor = this.rl.cursor);
  }
  _clearUserInput() {
    this.rl?.write(null, { ctrl: true, name: "u" }), this._setUserInput("");
  }
  onKeypress(t2, e) {
    if (this._track && e.name !== "return" && (e.name && this._isActionKey(t2, e) && this.rl?.write(null, { ctrl: true, name: "h" }), this._cursor = this.rl?.cursor ?? 0, this._setUserInput(this.rl?.line)), this.state === "error" && (this.state = "active"), e?.name && (!this._track && settings.aliases.has(e.name) && this.emit("cursor", settings.aliases.get(e.name)), settings.actions.has(e.name) && this.emit("cursor", e.name)), t2 && (t2.toLowerCase() === "y" || t2.toLowerCase() === "n") && this.emit("confirm", t2.toLowerCase() === "y"), this.emit("key", t2, e), e?.name === "return" && this._shouldSubmit(t2, e)) {
      if (this.opts.validate) {
        const i = runValidation(this.opts.validate, this.value);
        i && (this.error = i instanceof Error ? i.message : i, this.state = "error", this.rl?.write(this.userInput));
      }
      this.state !== "error" && (this.state = "submit");
    }
    isActionKey([t2, e?.name, e?.sequence], "cancel") && (this.state = "cancel"), (this.state === "submit" || this.state === "cancel") && this.emit("finalize"), this.render(), (this.state === "submit" || this.state === "cancel") && this.close();
  }
  close() {
    this.input.unpipe(), this.input.removeListener("keypress", this.onKeypress), this.output.write(`
`), setRawMode(this.input, false), this.rl?.close(), this.rl = undefined, this.emit(`${this.state}`, this.value), this.unsubscribe();
  }
  restoreCursor() {
    const t2 = wrapAnsi(this._prevFrame, process.stdout.columns, { hard: true, trim: false }).split(`
`).length - 1;
    this.output.write(import_sisteransi.cursor.move(-999, t2 * -1));
  }
  render() {
    const t2 = wrapAnsi(this._render(this) ?? "", process.stdout.columns, {
      hard: true,
      trim: false
    });
    if (t2 !== this._prevFrame) {
      if (this.state === "initial")
        this.output.write(import_sisteransi.cursor.hide);
      else {
        const e = diffLines(this._prevFrame, t2), i = getRows(this.output);
        if (this.restoreCursor(), e) {
          const n = Math.max(0, e.numLinesAfter - i), s = Math.max(0, e.numLinesBefore - i);
          let r = e.lines.find((o) => o >= n);
          if (r === undefined) {
            this._prevFrame = t2;
            return;
          }
          if (e.lines.length === 1) {
            this.output.write(import_sisteransi.cursor.move(0, r - s)), this.output.write(import_sisteransi.erase.lines(1));
            const o = t2.split(`
`);
            this.output.write(o[r]), this._prevFrame = t2, this.output.write(import_sisteransi.cursor.move(0, o.length - r - 1));
            return;
          } else if (e.lines.length > 1) {
            if (n < s)
              r = n;
            else {
              const h = r - s;
              h > 0 && this.output.write(import_sisteransi.cursor.move(0, h));
            }
            this.output.write(import_sisteransi.erase.down());
            const f = t2.split(`
`).slice(r);
            this.output.write(f.join(`
`)), this._prevFrame = t2;
            return;
          }
        }
        this.output.write(import_sisteransi.erase.down());
      }
      this.output.write(t2), this.state === "initial" && (this.state = "active"), this._prevFrame = t2;
    }
  }
}
function p$1(l, e) {
  if (l === undefined || e.length === 0)
    return 0;
  const i = e.findIndex((s) => s.value === l);
  return i !== -1 ? i : 0;
}
function g(l, e) {
  return (e.label ?? String(e.value)).toLowerCase().includes(l.toLowerCase());
}
function m(l, e) {
  if (e)
    return l ? e : e[0];
}
var T$1 = class T extends V {
  filteredOptions;
  multiple;
  isNavigating = false;
  selectedValues = [];
  focusedValue;
  #e = 0;
  #s = "";
  #t;
  #i;
  #n;
  get cursor() {
    return this.#e;
  }
  get userInputWithCursor() {
    if (!this.userInput)
      return styleText(["inverse", "hidden"], "_");
    if (this._cursor >= this.userInput.length)
      return `${this.userInput}\u2588`;
    const e = this.userInput.slice(0, this.cursor), t2 = this.userInput.slice(this.cursor, this.cursor + 1), i = this.userInput.slice(this.cursor + 1);
    return `${e}${styleText("inverse", t2)}${i}`;
  }
  get options() {
    return typeof this.#i == "function" ? this.#i() : this.#i;
  }
  constructor(e) {
    super(e), this.#i = e.options, this.#n = e.placeholder;
    const t2 = this.options;
    this.filteredOptions = [...t2], this.multiple = e.multiple === true, this.#t = typeof e.options == "function" ? e.filter : e.filter ?? g;
    let i;
    if (e.initialValue && Array.isArray(e.initialValue) ? this.multiple ? i = e.initialValue : i = e.initialValue.slice(0, 1) : !this.multiple && this.options.length > 0 && (i = [this.options[0]?.value]), i)
      for (const s of i) {
        const n = t2.findIndex((o) => o.value === s);
        n !== -1 && (this.toggleSelected(s), this.#e = n);
      }
    this.focusedValue = this.options[this.#e]?.value, this.on("key", (s, n) => this.#l(s, n)), this.on("userInput", (s) => this.#u(s));
  }
  _isActionKey(e, t2) {
    return e === "\t" || this.multiple && this.isNavigating && t2.name === "space" && e !== undefined && e !== "";
  }
  #l(e, t2) {
    const i = t2.name === "up", s = t2.name === "down", n = t2.name === "return", o = this.userInput === "" || this.userInput === "\t", u = this.#n, a = this.options, f = u !== undefined && u !== "" && a.some((r) => !r.disabled && (this.#t ? this.#t(u, r) : true));
    if (t2.name === "tab" && o && f) {
      this.userInput === "\t" && this._clearUserInput(), this._setUserInput(u, true), this.isNavigating = false;
      return;
    }
    i || s ? (this.#e = findCursor(this.#e, i ? -1 : 1, this.filteredOptions), this.focusedValue = this.filteredOptions[this.#e]?.value, this.multiple || (this.selectedValues = [this.focusedValue]), this.isNavigating = true) : n ? this.value = m(this.multiple, this.selectedValues) : this.multiple ? this.focusedValue !== undefined && (t2.name === "tab" || this.isNavigating && t2.name === "space") ? this.toggleSelected(this.focusedValue) : this.isNavigating = false : (this.focusedValue && (this.selectedValues = [this.focusedValue]), this.isNavigating = false);
  }
  deselectAll() {
    this.selectedValues = [];
  }
  toggleSelected(e) {
    this.filteredOptions.length !== 0 && (this.multiple ? this.selectedValues.includes(e) ? this.selectedValues = this.selectedValues.filter((t2) => t2 !== e) : this.selectedValues = [...this.selectedValues, e] : this.selectedValues = [e]);
  }
  #u(e) {
    if (e !== this.#s) {
      this.#s = e;
      const t2 = this.options;
      e && this.#t ? this.filteredOptions = t2.filter((n) => this.#t?.(e, n)) : this.filteredOptions = [...t2];
      const i = p$1(this.focusedValue, this.filteredOptions);
      this.#e = findCursor(i, 0, this.filteredOptions);
      const s = this.filteredOptions[this.#e];
      s && !s.disabled ? this.focusedValue = s.value : this.focusedValue = undefined, this.multiple || (this.focusedValue !== undefined ? this.toggleSelected(this.focusedValue) : this.deselectAll());
    }
  }
};
var _ = {
  Y: { type: "year", len: 4 },
  M: { type: "month", len: 2 },
  D: { type: "day", len: 2 }
};
function M(r) {
  return [...r].map((t2) => _[t2]);
}
function P(r) {
  const i = new Intl.DateTimeFormat(r, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(2000, 0, 15)), s = [];
  let n = "/";
  for (const e of i)
    e.type === "literal" ? n = e.value.trim() || e.value : (e.type === "year" || e.type === "month" || e.type === "day") && s.push({ type: e.type, len: e.type === "year" ? 4 : 2 });
  return { segments: s, separator: n };
}
function p(r) {
  return Number.parseInt((r || "0").replace(/_/g, "0"), 10) || 0;
}
function f(r) {
  return {
    year: p(r.year),
    month: p(r.month),
    day: p(r.day)
  };
}
function c(r, t2) {
  return new Date(r || 2001, t2 || 1, 0).getDate();
}
function b(r) {
  const { year: t2, month: i, day: s } = f(r);
  if (!t2 || t2 < 0 || t2 > 9999 || !i || i < 1 || i > 12 || !s || s < 1)
    return;
  const n = new Date(Date.UTC(t2, i - 1, s));
  if (!(n.getUTCFullYear() !== t2 || n.getUTCMonth() !== i - 1 || n.getUTCDate() !== s))
    return { year: t2, month: i, day: s };
}
function C(r) {
  const t2 = b(r);
  return t2 ? new Date(Date.UTC(t2.year, t2.month - 1, t2.day)) : undefined;
}
function T2(r, t2, i, s) {
  const n = i ? {
    year: i.getUTCFullYear(),
    month: i.getUTCMonth() + 1,
    day: i.getUTCDate()
  } : null, e = s ? {
    year: s.getUTCFullYear(),
    month: s.getUTCMonth() + 1,
    day: s.getUTCDate()
  } : null;
  return r === "year" ? { min: n?.year ?? 1, max: e?.year ?? 9999 } : r === "month" ? {
    min: n && t2.year === n.year ? n.month : 1,
    max: e && t2.year === e.year ? e.month : 12
  } : {
    min: n && t2.year === n.year && t2.month === n.month ? n.day : 1,
    max: e && t2.year === e.year && t2.month === e.month ? e.day : c(t2.year, t2.month)
  };
}

class U extends V {
  #i;
  #o;
  #t;
  #h;
  #u;
  #e = { segmentIndex: 0, positionInSegment: 0 };
  #n = true;
  #s = null;
  inlineError = "";
  get segmentCursor() {
    return { ...this.#e };
  }
  get segmentValues() {
    return { ...this.#t };
  }
  get segments() {
    return this.#i;
  }
  get separator() {
    return this.#o;
  }
  get formattedValue() {
    return this.#l(this.#t);
  }
  #l(t2) {
    return this.#i.map((i) => t2[i.type]).join(this.#o);
  }
  #r() {
    this._setUserInput(this.#l(this.#t)), this._setValue(C(this.#t) ?? undefined);
  }
  constructor(t2) {
    const i = t2.format ? { segments: M(t2.format), separator: t2.separator ?? "/" } : P(t2.locale), s = t2.separator ?? i.separator, n = t2.format ? M(t2.format) : i.segments, e = t2.initialValue ?? t2.defaultValue, m2 = e ? {
      year: String(e.getUTCFullYear()).padStart(4, "0"),
      month: String(e.getUTCMonth() + 1).padStart(2, "0"),
      day: String(e.getUTCDate()).padStart(2, "0")
    } : { year: "____", month: "__", day: "__" }, o = n.map((a) => m2[a.type]).join(s);
    super({ ...t2, initialUserInput: o }, false), this.#i = n, this.#o = s, this.#t = m2, this.#h = t2.minDate, this.#u = t2.maxDate, this.#r(), this.on("cursor", (a) => this.#f(a)), this.on("key", (a, u) => this.#y(a, u)), this.on("finalize", () => this.#p(t2));
  }
  #a() {
    const t2 = Math.max(0, Math.min(this.#e.segmentIndex, this.#i.length - 1)), i = this.#i[t2];
    if (i)
      return this.#e.positionInSegment = Math.max(0, Math.min(this.#e.positionInSegment, i.len - 1)), { segment: i, index: t2 };
  }
  #m(t2) {
    this.inlineError = "", this.#s = null;
    const i = this.#a();
    i && (this.#e.segmentIndex = Math.max(0, Math.min(this.#i.length - 1, i.index + t2)), this.#e.positionInSegment = 0, this.#n = true);
  }
  #d(t2) {
    const i = this.#a();
    if (!i)
      return;
    const { segment: s } = i, n = this.#t[s.type], e = !n || n.replace(/_/g, "") === "", m2 = Number.parseInt((n || "0").replace(/_/g, "0"), 10) || 0, o = T2(s.type, f(this.#t), this.#h, this.#u);
    let a;
    e ? a = t2 === 1 ? o.min : o.max : a = Math.max(Math.min(o.max, m2 + t2), o.min), this.#t = {
      ...this.#t,
      [s.type]: a.toString().padStart(s.len, "0")
    }, this.#n = true, this.#s = null, this.#r();
  }
  #f(t2) {
    if (t2)
      switch (t2) {
        case "right":
          return this.#m(1);
        case "left":
          return this.#m(-1);
        case "up":
          return this.#d(1);
        case "down":
          return this.#d(-1);
      }
  }
  #y(t2, i) {
    if (i?.name === "backspace" || i?.sequence === "\x7F" || i?.sequence === "\b" || t2 === "\x7F" || t2 === "\b") {
      this.inlineError = "";
      const n = this.#a();
      if (!n)
        return;
      if (!this.#t[n.segment.type].replace(/_/g, "")) {
        this.#m(-1);
        return;
      }
      this.#t[n.segment.type] = "_".repeat(n.segment.len), this.#n = true, this.#e.positionInSegment = 0, this.#r();
      return;
    }
    if (i?.name === "tab") {
      this.inlineError = "";
      const n = this.#a();
      if (!n)
        return;
      const e = i.shift ? -1 : 1, m2 = n.index + e;
      m2 >= 0 && m2 < this.#i.length && (this.#e.segmentIndex = m2, this.#e.positionInSegment = 0, this.#n = true);
      return;
    }
    if (t2 && /^[0-9]$/.test(t2)) {
      const n = this.#a();
      if (!n)
        return;
      const { segment: e } = n, m2 = !this.#t[e.type].replace(/_/g, "");
      if (this.#n && this.#s !== null && !m2) {
        const h = this.#s + t2, d = { ...this.#t, [e.type]: h }, g2 = this.#g(d, e);
        if (g2) {
          this.inlineError = g2, this.#s = null, this.#n = false;
          return;
        }
        this.inlineError = "", this.#t[e.type] = h, this.#s = null, this.#n = false, this.#r(), n.index < this.#i.length - 1 && (this.#e.segmentIndex = n.index + 1, this.#e.positionInSegment = 0, this.#n = true);
        return;
      }
      this.#n && !m2 && (this.#t[e.type] = "_".repeat(e.len), this.#e.positionInSegment = 0), this.#n = false, this.#s = null;
      const o = this.#t[e.type], a = o.indexOf("_"), u = a >= 0 ? a : Math.min(this.#e.positionInSegment, e.len - 1);
      if (u < 0 || u >= e.len)
        return;
      let l = o.slice(0, u) + t2 + o.slice(u + 1), D = false;
      if (u === 0 && o === "__" && (e.type === "month" || e.type === "day")) {
        const h = Number.parseInt(t2, 10);
        l = `0${t2}`, D = h <= (e.type === "month" ? 1 : 2);
      }
      if (e.type === "year" && (l = (o.replace(/_/g, "") + t2).padStart(e.len, "_")), !l.includes("_")) {
        const h = { ...this.#t, [e.type]: l }, d = this.#g(h, e);
        if (d) {
          this.inlineError = d;
          return;
        }
      }
      this.inlineError = "", this.#t[e.type] = l;
      const y = l.includes("_") ? undefined : b(this.#t);
      if (y) {
        const { year: h, month: d } = y, g2 = c(h, d);
        this.#t = {
          year: String(Math.max(0, Math.min(9999, h))).padStart(4, "0"),
          month: String(Math.max(1, Math.min(12, d))).padStart(2, "0"),
          day: String(Math.max(1, Math.min(g2, y.day))).padStart(2, "0")
        };
      }
      this.#r();
      const S = l.indexOf("_");
      D ? (this.#n = true, this.#s = t2) : S >= 0 ? this.#e.positionInSegment = S : a >= 0 && n.index < this.#i.length - 1 ? (this.#e.segmentIndex = n.index + 1, this.#e.positionInSegment = 0, this.#n = true) : this.#e.positionInSegment = Math.min(u + 1, e.len - 1);
    }
  }
  #g(t2, i) {
    const { month: s, day: n } = f(t2);
    if (i.type === "month" && (s < 0 || s > 12))
      return settings.date.messages.invalidMonth;
    if (i.type === "day" && (n < 0 || n > 31))
      return settings.date.messages.invalidDay(31, "any month");
  }
  #p(t2) {
    const { year: i, month: s, day: n } = f(this.#t);
    if (i && s && n) {
      const e = c(i, s);
      this.#t = {
        ...this.#t,
        day: String(Math.min(n, e)).padStart(2, "0")
      };
    }
    this.value = C(this.#t) ?? t2.defaultValue ?? undefined;
  }
}
var u$2 = class u extends V {
  options;
  cursor = 0;
  #t;
  getGroupItems(t2) {
    return this.options.filter((r) => r.group === t2);
  }
  isGroupSelected(t2) {
    const r = this.getGroupItems(t2), e = this.value;
    return e === undefined ? false : r.every((s) => e.includes(s.value));
  }
  toggleValue() {
    const t2 = this.options[this.cursor];
    if (t2 !== undefined)
      if (this.value === undefined && (this.value = []), t2.group === true) {
        const r = t2.value, e = this.getGroupItems(r);
        this.isGroupSelected(r) ? this.value = this.value.filter((s) => e.findIndex((i) => i.value === s) === -1) : this.value = [...this.value, ...e.map((s) => s.value)], this.value = Array.from(new Set(this.value));
      } else {
        const r = this.value.includes(t2.value);
        this.value = r ? this.value.filter((e) => e !== t2.value) : [...this.value, t2.value];
      }
  }
  constructor(t2) {
    super(t2, false);
    const { options: r } = t2;
    this.#t = t2.selectableGroups !== false, this.options = Object.entries(r).flatMap(([e, s]) => [
      { value: e, group: true, label: e },
      ...s.map((i) => ({ ...i, group: e }))
    ]), this.value = [...t2.initialValues ?? []], this.cursor = Math.max(this.options.findIndex(({ value: e }) => e === t2.cursorAt), this.#t ? 0 : 1), this.on("cursor", (e) => {
      switch (e) {
        case "left":
        case "up": {
          this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1;
          const s = this.options[this.cursor]?.group === true;
          !this.#t && s && (this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1);
          break;
        }
        case "down":
        case "right": {
          this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1;
          const s = this.options[this.cursor]?.group === true;
          !this.#t && s && (this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1);
          break;
        }
        case "space":
          this.toggleValue();
          break;
      }
    });
  }
};
var o = /* @__PURE__ */ new Set(["up", "down", "left", "right"]);

class h extends V {
  #t = false;
  #s;
  focused = "editor";
  get userInputWithCursor() {
    if (this.state === "submit")
      return this.userInput;
    const t2 = this.userInput;
    if (this.cursor >= t2.length)
      return `${t2}\u2588`;
    const s = t2.slice(0, this.cursor), r = t2.slice(this.cursor, this.cursor + 1), i = t2.slice(this.cursor + 1);
    return r === `
` ? `${s}\u2588
${i}` : `${s}${styleText("inverse", r)}${i}`;
  }
  get cursor() {
    return this._cursor;
  }
  #r(t2) {
    if (this.userInput.length === 0) {
      this._setUserInput(t2);
      return;
    }
    this._setUserInput(this.userInput.slice(0, this.cursor) + t2 + this.userInput.slice(this.cursor));
  }
  #i(t2) {
    const s = this.value ?? "";
    switch (t2) {
      case "up":
        this._cursor = findTextCursor(this._cursor, 0, -1, s);
        return;
      case "down":
        this._cursor = findTextCursor(this._cursor, 0, 1, s);
        return;
      case "left":
        this._cursor = findTextCursor(this._cursor, -1, 0, s);
        return;
      case "right":
        this._cursor = findTextCursor(this._cursor, 1, 0, s);
        return;
    }
  }
  _shouldSubmit(t2, s) {
    if (this.#s)
      return this.focused === "submit" ? true : (this.#r(`
`), this._cursor++, false);
    const r = this.#t;
    return this.#t = true, r && this.cursor === this.userInput.length ? (this.userInput[this.cursor - 1] === `
` && (this._setUserInput(this.userInput.slice(0, this.cursor - 1) + this.userInput.slice(this.cursor)), this._cursor--), true) : (this.#r(`
`), this._cursor++, false);
  }
  constructor(t2) {
    const s = t2.initialUserInput ?? t2.initialValue;
    super({
      ...t2,
      initialUserInput: s
    }, false), s !== undefined && (this._cursor = s.length), this.#s = t2.showSubmit ?? false, this.on("key", (r, i) => {
      if (i?.name && o.has(i.name)) {
        this.#t = false, this.#i(i.name);
        return;
      }
      if (r === "\t" && this.#s) {
        this.focused = this.focused === "editor" ? "submit" : "editor";
        return;
      }
      if (i?.name !== "return") {
        if (this.#t = false, i?.name === "backspace" && this.cursor > 0) {
          this._setUserInput(this.userInput.slice(0, this.cursor - 1) + this.userInput.slice(this.cursor)), this._cursor--;
          return;
        }
        if (i?.name === "delete" && this.cursor < this.userInput.length) {
          this._setUserInput(this.userInput.slice(0, this.cursor) + this.userInput.slice(this.cursor + 1));
          return;
        }
        r && (this.#s && this.focused === "submit" && (this.focused = "editor"), this.#r(r ?? ""), this._cursor++);
      }
    }), this.on("userInput", (r) => {
      this._setValue(r);
    }), this.on("finalize", () => {
      this.value || (this.value = t2.defaultValue), this.value === undefined && (this.value = "");
    });
  }
}
var u$1 = class u2 extends V {
  _mask = "\u2022";
  get cursor() {
    return this._cursor;
  }
  get masked() {
    return this.userInput.replaceAll(/./g, this._mask);
  }
  get userInputWithCursor() {
    if (this.state === "submit" || this.state === "cancel")
      return this.masked;
    const t2 = this.userInput;
    if (this.cursor >= t2.length)
      return `${this.masked}${styleText(["inverse", "hidden"], "_")}`;
    const s = this.masked, r = s.slice(0, this.cursor), i = s.slice(this.cursor, this.cursor + 1), o2 = s.slice(this.cursor + 1);
    return `${r}${styleText("inverse", i)}${o2}`;
  }
  clear() {
    this._clearUserInput();
  }
  constructor({ mask: t2, ...s }) {
    super(s), this._mask = t2 ?? "\u2022", this.on("userInput", (r) => {
      this._setValue(r);
    }), this.on("finalize", () => {
      this.value === undefined && (this.value = "");
    });
  }
};
class n extends V {
  get userInputWithCursor() {
    if (this.state === "submit")
      return this.userInput;
    const t2 = this.userInput;
    if (this.cursor >= t2.length)
      return `${this.userInput}\u2588`;
    const r = t2.slice(0, this.cursor), s = t2.slice(this.cursor, this.cursor + 1), e = t2.slice(this.cursor + 1);
    return `${r}${styleText("inverse", s)}${e}`;
  }
  get cursor() {
    return this._cursor;
  }
  constructor(t2) {
    super({
      ...t2,
      initialUserInput: t2.initialUserInput ?? t2.initialValue
    }), this.on("userInput", (r) => {
      this._setValue(r);
    }), this.on("finalize", () => {
      this.value || (this.value = t2.defaultValue), this.value === undefined && (this.value = "");
    });
  }
}

// ../../node_modules/.bun/@clack+prompts@1.7.0/node_modules/@clack/prompts/dist/index.mjs
import { styleText as styleText2, stripVTControlCharacters } from "util";
import process$1 from "process";
var import_sisteransi2 = __toESM(require_src(), 1);
function isUnicodeSupported() {
  if (process$1.platform !== "win32") {
    return process$1.env.TERM !== "linux";
  }
  return Boolean(process$1.env.CI) || Boolean(process$1.env.WT_SESSION) || Boolean(process$1.env.TERMINUS_SUBLIME) || process$1.env.ConEmuTask === "{cmd::Cmder}" || process$1.env.TERM_PROGRAM === "Terminus-Sublime" || process$1.env.TERM_PROGRAM === "vscode" || process$1.env.TERM === "xterm-256color" || process$1.env.TERM === "alacritty" || process$1.env.TERMINAL_EMULATOR === "JetBrains-JediTerm";
}
var unicode = isUnicodeSupported();
var unicodeOr = (o2, e) => unicode ? o2 : e;
var S_STEP_ACTIVE = unicodeOr("\u25C6", "*");
var S_STEP_CANCEL = unicodeOr("\u25A0", "x");
var S_STEP_ERROR = unicodeOr("\u25B2", "x");
var S_STEP_SUBMIT = unicodeOr("\u25C7", "o");
var S_BAR_START = unicodeOr("\u250C", "T");
var S_BAR = unicodeOr("\u2502", "|");
var S_BAR_END = unicodeOr("\u2514", "\u2014");
var S_BAR_START_RIGHT = unicodeOr("\u2510", "T");
var S_BAR_END_RIGHT = unicodeOr("\u2518", "\u2014");
var S_RADIO_ACTIVE = unicodeOr("\u25CF", ">");
var S_RADIO_INACTIVE = unicodeOr("\u25CB", " ");
var S_CHECKBOX_ACTIVE = unicodeOr("\u25FB", "[\u2022]");
var S_CHECKBOX_SELECTED = unicodeOr("\u25FC", "[+]");
var S_CHECKBOX_INACTIVE = unicodeOr("\u25FB", "[ ]");
var S_PASSWORD_MASK = unicodeOr("\u25AA", "\u2022");
var S_BAR_H = unicodeOr("\u2500", "-");
var S_CORNER_TOP_RIGHT = unicodeOr("\u256E", "+");
var S_CONNECT_LEFT = unicodeOr("\u251C", "+");
var S_CORNER_BOTTOM_RIGHT = unicodeOr("\u256F", "+");
var S_CORNER_BOTTOM_LEFT = unicodeOr("\u2570", "+");
var S_CORNER_TOP_LEFT = unicodeOr("\u256D", "+");
var S_INFO = unicodeOr("\u25CF", "\u2022");
var S_SUCCESS = unicodeOr("\u25C6", "*");
var S_WARN = unicodeOr("\u25B2", "!");
var S_ERROR = unicodeOr("\u25A0", "x");
var symbol = (o2) => {
  switch (o2) {
    case "initial":
    case "active":
      return styleText2("cyan", S_STEP_ACTIVE);
    case "cancel":
      return styleText2("red", S_STEP_CANCEL);
    case "error":
      return styleText2("yellow", S_STEP_ERROR);
    case "submit":
      return styleText2("green", S_STEP_SUBMIT);
  }
};
var MULTISELECT_INSTRUCTIONS = [
  `${styleText2("dim", "\u2191/\u2193")} to navigate`,
  `${styleText2("dim", "Space:")} select`,
  `${styleText2("dim", "Enter:")} confirm`
];
var cancel = (o2 = "", t2) => {
  const i = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR_END)}  ` : "";
  i.write(`${e}${styleText2("red", o2)}

`);
};
var intro = (o2 = "", t2) => {
  const i = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR_START)}  ` : "";
  i.write(`${e}${o2}
`);
};
var outro = (o2 = "", t2) => {
  const i = t2?.output ?? process.stdout, e = t2?.withGuide ?? settings.withGuide ? `${styleText2("gray", S_BAR)}
${styleText2("gray", S_BAR_END)}  ` : "";
  i.write(`${e}${o2}

`);
};
var password = (r2) => new u$1({
  validate: r2.validate,
  mask: r2.mask ?? S_PASSWORD_MASK,
  signal: r2.signal,
  input: r2.input,
  output: r2.output,
  render() {
    const e = r2.withGuide ?? settings.withGuide, o2 = `${e ? `${styleText2("gray", S_BAR)}
` : ""}${symbol(this.state)}  ${r2.message}
`, c2 = this.userInputWithCursor, i = this.masked;
    switch (this.state) {
      case "error": {
        const s = e ? `${styleText2("yellow", S_BAR)}  ` : "", n2 = e ? `${styleText2("yellow", S_BAR_END)}  ` : "", l = i ?? "";
        return r2.clearOnError && this.clear(), `${o2.trim()}
${s}${l}
${n2}${styleText2("yellow", this.error)}
`;
      }
      case "submit": {
        const s = e ? `${styleText2("gray", S_BAR)}  ` : "", n2 = i ? styleText2("dim", i) : "";
        return `${o2}${s}${n2}`;
      }
      case "cancel": {
        const s = e ? `${styleText2("gray", S_BAR)}  ` : "", n2 = i ? styleText2(["strikethrough", "dim"], i) : "";
        return `${o2}${s}${n2}${i && e ? `
${styleText2("gray", S_BAR)}` : ""}`;
      }
      default: {
        const s = e ? `${styleText2("cyan", S_BAR)}  ` : "", n2 = e ? styleText2("cyan", S_BAR_END) : "";
        return `${o2}${s}${c2}
${n2}
`;
      }
    }
  }
}).prompt();
var u4 = {
  light: unicodeOr("\u2500", "-"),
  heavy: unicodeOr("\u2501", "="),
  block: unicodeOr("\u2588", "#")
};
var SELECT_INSTRUCTIONS = [
  `${styleText2("dim", "\u2191/\u2193")} to navigate`,
  `${styleText2("dim", "Enter:")} confirm`
];
var i = `${styleText2("gray", S_BAR)}  `;
var text = (e) => new n({
  validate: e.validate,
  placeholder: e.placeholder,
  defaultValue: e.defaultValue,
  initialValue: e.initialValue,
  output: e.output,
  signal: e.signal,
  input: e.input,
  render() {
    const i2 = e?.withGuide ?? settings.withGuide, s = `${`${i2 ? `${styleText2("gray", S_BAR)}
` : ""}${symbol(this.state)}  `}${e.message}
`, c2 = e.placeholder && e.placeholder.length > 0 ? styleText2("inverse", e.placeholder[0]) + styleText2("dim", e.placeholder.slice(1)) : styleText2(["inverse", "hidden"], "_"), o2 = this.userInput ? this.userInputWithCursor : c2, l = this.value ?? "";
    switch (this.state) {
      case "error": {
        const n2 = this.error ? `  ${styleText2("yellow", this.error)}` : "", r2 = i2 ? `${styleText2("yellow", S_BAR)}  ` : "", d = i2 ? styleText2("yellow", S_BAR_END) : "";
        return `${s.trim()}
${r2}${o2}
${d}${n2}
`;
      }
      case "submit": {
        const n2 = l ? `  ${styleText2("dim", l)}` : "", r2 = i2 ? styleText2("gray", S_BAR) : "";
        return `${s}${r2}${n2}`;
      }
      case "cancel": {
        const n2 = l ? `  ${styleText2(["strikethrough", "dim"], l)}` : "", r2 = i2 ? styleText2("gray", S_BAR) : "";
        return `${s}${r2}${n2}${l.trim() ? `
${r2}` : ""}`;
      }
      default: {
        const n2 = i2 ? `${styleText2("cyan", S_BAR)}  ` : "", r2 = i2 ? styleText2("cyan", S_BAR_END) : "";
        return `${s}${n2}${o2}
${r2}
`;
      }
    }
  }
}).prompt();

// src/args.ts
var USAGE = `Usage:
  nonlocalhost [start] <port> [--subdomain <name>] [options]
  nonlocalhost [start] --port <n> [--subdomain <name>] [options]
  nonlocalhost login [--token <token>] [--server <host>] [--subdomain <name>] [--port <n>]

Options:
      --port <n>            port to expose (or pass it positionally, reused from saved project config if omitted)
  -s, --subdomain <name>   public subdomain (reused from saved project config if omitted)
      --token <token>      auth token (falls back to NONLOCALHOST_TOKEN, then saved login)
      --server <host>      tunnel server host (falls back to NONLOCALHOST_SERVER, then saved login)
      --local-host <host>  host to forward to (default: localhost)
      --insecure           use ws/http instead of wss/https
      --save               remember port/subdomain in the saved project config (and token/server via login)
  -h, --help               show this help`;
function parsePort(raw) {
  const port = Number(raw);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`invalid port: ${raw}
${USAGE}`);
  }
  return port;
}
function parseArgs(argv) {
  const positional = [];
  let portFlag;
  let subdomain;
  let token;
  let server;
  let localHost;
  let insecure = false;
  let save = false;
  for (let i2 = 0;i2 < argv.length; i2++) {
    const arg = argv[i2];
    switch (arg) {
      case "--port":
        portFlag = parsePort(argv[++i2]);
        break;
      case "--subdomain":
      case "-s":
        subdomain = argv[++i2];
        break;
      case "--token":
        token = argv[++i2];
        break;
      case "--server":
        server = argv[++i2];
        break;
      case "--local-host":
        localHost = argv[++i2];
        break;
      case "--insecure":
        insecure = true;
        break;
      case "--save":
        save = true;
        break;
      case "--help":
      case "-h":
        console.log(USAGE);
        process.exit(0);
        break;
      default:
        positional.push(arg);
    }
  }
  const port = positional.length > 0 ? parsePort(positional[0]) : portFlag;
  return { port, subdomain, token, server, localHost, insecure, save };
}

// src/config.ts
import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { chmod } from "fs/promises";
import { homedir } from "os";
import { join, resolve } from "path";
var CONFIG_DIR = join(homedir(), ".config", "nonlocalhost");
var CONFIG_PATH = join(CONFIG_DIR, "config.json");
var PROJECTS_DIR = join(CONFIG_DIR, "projects");
var PROJECT_CWD = resolve(".");
var PROJECT_MARKER_DIR = join(PROJECT_CWD, ".nonlocalhost");
var PROJECT_REF_PATH = join(PROJECT_MARKER_DIR, "project-ref");
function projectConfigPathFor(ref) {
  return join(PROJECTS_DIR, `${ref}.json`);
}
function getProjectRef(create) {
  if (existsSync(PROJECT_REF_PATH))
    return readFileSync(PROJECT_REF_PATH, "utf8").trim();
  if (!create)
    return;
  mkdirSync(PROJECT_MARKER_DIR, { recursive: true });
  const ref = randomUUID();
  writeFileSync(PROJECT_REF_PATH, `${ref}
`);
  writeFileSync(join(PROJECT_MARKER_DIR, ".gitignore"), `*
`);
  return ref;
}
function projectConfigLocation() {
  const ref = getProjectRef(false);
  return ref ? projectConfigPathFor(ref) : `${PROJECTS_DIR}/<new>.json (via ${PROJECT_REF_PATH})`;
}
async function updateProjectConfig(patch) {
  const existing = await readProjectConfig();
  const merged = { ...existing, ...patch };
  await writeProjectConfig(merged);
  return merged;
}
async function readConfig() {
  const file = Bun.file(CONFIG_PATH);
  if (!await file.exists())
    return {};
  try {
    return await file.json();
  } catch {
    return {};
  }
}
async function writeConfig(config) {
  await Bun.write(CONFIG_PATH, `${JSON.stringify(config, null, 2)}
`);
  await chmod(CONFIG_PATH, 384);
}
async function readProjectConfig() {
  const ref = getProjectRef(false);
  if (!ref)
    return {};
  const file = Bun.file(projectConfigPathFor(ref));
  if (!await file.exists())
    return {};
  try {
    return await file.json();
  } catch {
    return {};
  }
}
async function writeProjectConfig(config) {
  const ref = getProjectRef(true);
  const withPath = { path: PROJECT_CWD, ...config };
  await Bun.write(projectConfigPathFor(ref), `${JSON.stringify(withPath, null, 2)}
`);
}
function maskToken(token) {
  if (token.length <= 8)
    return "****";
  return `${token.slice(0, 7)}...${token.slice(-4)}`;
}

// src/login.ts
var USAGE2 = "Usage: nonlocalhost login [--token <token>] [--server <host>] [--subdomain <name>] [--port <n>]";
function parseLoginArgs(argv) {
  const flags = {};
  for (let i2 = 0;i2 < argv.length; i2++) {
    switch (argv[i2]) {
      case "--token":
        flags.token = argv[++i2];
        break;
      case "--server":
        flags.server = argv[++i2];
        break;
      case "--subdomain":
      case "-s":
        flags.subdomain = argv[++i2];
        break;
      case "--port":
        flags.port = Number(argv[++i2]);
        break;
      case "--help":
      case "-h":
        console.log(USAGE2);
        process.exit(0);
        break;
      default:
        throw new Error(`unknown argument: ${argv[i2]}
${USAGE2}`);
    }
  }
  return flags;
}
async function runLogin(argv) {
  const flags = parseLoginArgs(argv);
  const existingAccount = await readConfig();
  const existingProject = await readProjectConfig();
  if (!process.stdin.isTTY) {
    const server2 = flags.server ?? existingAccount.server;
    const token2 = flags.token ?? existingAccount.token;
    if (!server2 || !token2) {
      throw new Error(`non-interactive stdin: --token and --server are required (nothing saved to fall back to)
${USAGE2}`);
    }
    await writeConfig({ token: token2, server: server2 });
    await updateProjectConfig({
      subdomain: flags.subdomain ?? existingProject.subdomain,
      port: flags.port ?? existingProject.port
    });
    console.log(`[nonlocalhost] saved ${maskToken(token2)} @ ${server2} to ${CONFIG_PATH}`);
    return;
  }
  intro("nonlocalhost login");
  let server = flags.server;
  if (!server) {
    const answer = await text({
      message: "Tunnel server host",
      placeholder: existingAccount.server,
      initialValue: existingAccount.server,
      validate: (value) => !value ? "server host is required" : undefined
    });
    if (isCancel(answer)) {
      cancel("\uCDE8\uC18C\uB428");
      process.exit(1);
    }
    server = answer;
  }
  let token = flags.token;
  if (!token) {
    const hint = existingAccount.token ? ` (\uC5D4\uD130: \uAE30\uC874 ${maskToken(existingAccount.token)} \uC720\uC9C0)` : "";
    const answer = await password({
      message: `Auth token${hint}`,
      validate: (value) => !value && !existingAccount.token ? "token is required" : undefined
    });
    if (isCancel(answer)) {
      cancel("\uCDE8\uC18C\uB428");
      process.exit(1);
    }
    token = answer || existingAccount.token;
  }
  if (!token) {
    throw new Error(`token is required
${USAGE2}`);
  }
  let subdomain = flags.subdomain;
  if (subdomain === undefined) {
    const answer = await text({
      message: "Subdomain (\uC120\uD0DD)",
      placeholder: existingProject.subdomain ?? "(none)",
      initialValue: existingProject.subdomain
    });
    if (isCancel(answer)) {
      cancel("\uCDE8\uC18C\uB428");
      process.exit(1);
    }
    subdomain = answer || existingProject.subdomain;
  }
  let port = flags.port;
  if (port === undefined) {
    const answer = await text({
      message: "Port (\uC120\uD0DD)",
      placeholder: existingProject.port ? String(existingProject.port) : "(none)",
      initialValue: existingProject.port ? String(existingProject.port) : undefined,
      validate: (value) => {
        if (!value)
          return;
        const n2 = Number(value);
        return Number.isInteger(n2) && n2 > 0 ? undefined : "\uC22B\uC790(\uD3EC\uD2B8)\uB97C \uC785\uB825\uD558\uC138\uC694";
      }
    });
    if (isCancel(answer)) {
      cancel("\uCDE8\uC18C\uB428");
      process.exit(1);
    }
    port = answer ? Number(answer) : existingProject.port;
  }
  await writeConfig({ token, server });
  await updateProjectConfig({ subdomain, port });
  outro(`saved ${maskToken(token)} @ ${server} to ${CONFIG_PATH}` + (subdomain || port ? `, project defaults to ${projectConfigLocation()}` : ""));
}
// ../../packages/shared/src/tunnel-protocol.ts
function encodeFrame(header, body) {
  const headerBytes = new TextEncoder().encode(JSON.stringify(header));
  const bodyBytes = body ?? new Uint8Array(0);
  const out = new Uint8Array(4 + headerBytes.length + bodyBytes.length);
  new DataView(out.buffer).setUint32(0, headerBytes.length, false);
  out.set(headerBytes, 4);
  out.set(bodyBytes, 4 + headerBytes.length);
  return out;
}
function decodeFrame(data) {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const headerLen = view.getUint32(0, false);
  const headerBytes = bytes.subarray(4, 4 + headerLen);
  const body = bytes.subarray(4 + headerLen);
  const header = JSON.parse(new TextDecoder().decode(headerBytes));
  return { header, body };
}
var HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host"
]);
// src/colors.ts
var isTTY = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
function wrap(code) {
  return (text2) => isTTY ? `\x1B[${code}m${text2}\x1B[0m` : text2;
}
var color = {
  red: wrap(31),
  green: wrap(32),
  yellow: wrap(33),
  cyan: wrap(36),
  gray: wrap(90)
};
function statusColor(status) {
  if (status >= 500)
    return color.red;
  if (status >= 400)
    return color.yellow;
  if (status >= 300)
    return color.cyan;
  return color.green;
}

// src/tunnel-client.ts
var RECONNECT_BASE_MS = 1000;
var RECONNECT_MAX_MS = 30000;
var activeWs = null;
var shuttingDown = false;
function installShutdownHandler() {
  const shutdown = (signal) => {
    if (shuttingDown)
      return;
    shuttingDown = true;
    console.log(`
${color.gray(`[nonlocalhost] received ${signal}, shutting down...`)}`);
    activeWs?.close(1000, "client shutdown");
    process.exit(0);
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}
async function runTunnel(opts) {
  installShutdownHandler();
  let attempt = 0;
  for (;; ) {
    let result;
    try {
      result = await connectOnce(opts);
    } catch (err) {
      result = { welcomed: false };
      console.error(color.red(`[nonlocalhost] connection error: ${err.message}`));
    }
    if (result.fatal) {
      console.error(color.red(`[nonlocalhost] rejected: ${result.fatal}`));
      console.error(color.gray("[nonlocalhost] not retrying \u2014 fix this and run again."));
      process.exit(1);
    }
    attempt = result.welcomed ? 0 : attempt + 1;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** attempt) + Math.random() * 500;
    console.log(color.yellow(`[nonlocalhost] reconnecting in ${Math.round(delay / 1000)}s...`));
    await Bun.sleep(delay);
  }
}
function wsUrl(opts) {
  const scheme = opts.insecure ? "ws" : "wss";
  return `${scheme}://${opts.server}/_ws/tunnel`;
}
function connectOnce(opts) {
  return new Promise((resolve2) => {
    const ws = new WebSocket(wsUrl(opts));
    ws.binaryType = "arraybuffer";
    let welcomed = false;
    let fatal;
    activeWs = ws;
    ws.addEventListener("open", () => {
      ws.send(encodeFrame({
        type: "hello",
        token: opts.token,
        subdomain: opts.subdomain
      }));
    });
    ws.addEventListener("message", (evt) => {
      const { header, body } = decodeFrame(evt.data);
      switch (header.type) {
        case "welcome":
          welcomed = true;
          printWelcome(opts, header.subdomain);
          break;
        case "error":
          fatal = header.message;
          console.error(color.red(`[nonlocalhost] server error: ${header.message}`));
          break;
        case "ping":
          ws.send(encodeFrame({ type: "pong" }));
          break;
        case "request":
          forwardRequest(ws, header, body, opts).catch((err) => console.error(color.red(`[nonlocalhost] request forwarding failed: ${err.message}`)));
          break;
      }
    });
    ws.addEventListener("close", (evt) => {
      if (activeWs === ws)
        activeWs = null;
      if (welcomed) {
        console.log(color.gray(`[nonlocalhost] disconnected (${evt.code}${evt.reason ? ` ${evt.reason}` : ""})`));
      }
      resolve2({ welcomed, fatal });
    });
    ws.addEventListener("error", () => {});
  });
}
async function forwardRequest(ws, header, body, opts) {
  const start = Date.now();
  const url = `http://${opts.localHost}:${opts.port}${header.path}${header.query}`;
  const hasBody = body.byteLength > 0 && header.method !== "GET" && header.method !== "HEAD";
  try {
    const res = await fetch(url, {
      method: header.method,
      headers: header.headers,
      body: hasBody ? body : undefined
    });
    const resHeaders = {};
    res.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()))
        resHeaders[key] = value;
    });
    ws.send(encodeFrame({
      type: "response-head",
      id: header.id,
      status: res.status,
      headers: resHeaders
    }));
    if (res.body) {
      const reader = res.body.getReader();
      for (;; ) {
        const { value, done } = await reader.read();
        if (done)
          break;
        ws.send(encodeFrame({ type: "response-chunk", id: header.id }, value));
      }
    }
    ws.send(encodeFrame({ type: "response-end", id: header.id }));
    const statusText = statusColor(res.status)(String(res.status));
    console.log(`${header.method} ${header.path} ${statusText} ${Date.now() - start}ms`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    ws.send(encodeFrame({ type: "response-error", id: header.id, message }));
    console.log(`${header.method} ${header.path} ${color.red("ERR")} ${message}`);
  }
}
function printWelcome(opts, subdomain) {
  const scheme = opts.insecure ? "http" : "https";
  const publicUrl = `${scheme}://${subdomain}.${opts.server}`;
  const hmrHost = `${subdomain}.${opts.server}`;
  console.log(color.green(`[nonlocalhost] connected: ${publicUrl} -> http://${opts.localHost}:${opts.port}`));
  console.log(color.gray("[nonlocalhost] Vite \uC0AC\uC6A9 \uC2DC vite.config.ts\uC5D0 \uC544\uB798\uB97C \uCD94\uAC00\uD558\uC138\uC694:"));
  console.log(color.gray(`  server: { allowedHosts: ["${hmrHost}"], hmr: { host: "${hmrHost}", clientPort: 443 } }`));
}

// src/index.ts
function parsePortAnswer(value) {
  const n2 = Number(value);
  return Number.isInteger(n2) && n2 > 0 ? undefined : "\uC22B\uC790(\uD3EC\uD2B8)\uB97C \uC785\uB825\uD558\uC138\uC694";
}
async function promptForMissing(port, subdomain) {
  intro("nonlocalhost");
  if (!port) {
    const answer = await text({ message: "Port to expose", validate: parsePortAnswer });
    if (isCancel(answer)) {
      cancel("\uCDE8\uC18C\uB428");
      process.exit(1);
    }
    port = Number(answer);
  }
  if (!subdomain) {
    const answer = await text({
      message: "Public subdomain",
      validate: (value) => !value ? "subdomain is required" : undefined
    });
    if (isCancel(answer)) {
      cancel("\uCDE8\uC18C\uB428");
      process.exit(1);
    }
    subdomain = answer;
  }
  await updateProjectConfig({ port, subdomain });
  outro(`saved to ${projectConfigLocation()}`);
  return { port, subdomain };
}
async function main() {
  const argv = process.argv.slice(2);
  const [command, ...rest] = argv;
  if (command === "login") {
    await runLogin(rest);
    return;
  }
  const args = parseArgs(command === "start" ? rest : argv);
  const config = await readConfig();
  const project = await readProjectConfig();
  const token = args.token ?? process.env.NONLOCALHOST_TOKEN ?? config.token;
  if (!token) {
    console.error("[nonlocalhost] no token found. Run `nonlocalhost login`, pass --token, or set NONLOCALHOST_TOKEN.");
    process.exit(1);
  }
  const server = args.server ?? process.env.NONLOCALHOST_SERVER ?? config.server;
  if (!server) {
    console.error("[nonlocalhost] no server configured. Run `nonlocalhost login`, pass --server, or set NONLOCALHOST_SERVER.");
    process.exit(1);
  }
  let port = args.port ?? project.port;
  let subdomain = args.subdomain ?? project.subdomain;
  if ((!port || !subdomain) && process.stdin.isTTY) {
    ({ port, subdomain } = await promptForMissing(port, subdomain));
  }
  if (!port) {
    console.error(`[nonlocalhost] no port given and none saved
${USAGE}`);
    process.exit(1);
  }
  if (!subdomain) {
    console.error(`[nonlocalhost] --subdomain is required (none saved)
${USAGE}`);
    process.exit(1);
  }
  const localHost = args.localHost ?? project.localHost ?? "localhost";
  const insecure = args.insecure || (project.insecure ?? false);
  if (args.save) {
    if (args.token || args.server) {
      await writeConfig({ token, server });
      console.log(`[nonlocalhost] saved ${maskToken(token)} @ ${server} to ${CONFIG_PATH}`);
    }
    await writeProjectConfig({ port, subdomain, localHost, insecure });
    console.log(`[nonlocalhost] saved port/subdomain to ${projectConfigLocation()}`);
  }
  await runTunnel({ server, token, subdomain, localHost, port, insecure });
}
main().catch((err) => {
  console.error(`[nonlocalhost] ${err.message}`);
  process.exit(1);
});
