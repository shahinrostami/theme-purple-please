"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var test = require("blue-tape");
var crypto = require("crypto");
var free_style_1 = require("./free-style");
test('free style', function (t) {
    t.test('output hashed class names', function (t) {
        var Style = free_style_1.create();
        var changeId = Style.changeId;
        var className = Style.registerStyle({
            color: 'red'
        });
        t.equal(Style.getStyles(), "." + className + "{color:red}");
        t.notEqual(Style.changeId, changeId);
        t.end();
    });
    t.test('multiple values', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            background: [
                'red',
                'linear-gradient(to right, red 0%, green 100%)'
            ]
        });
        t.equal(Style.getStyles(), "." + className + "{background:red;background:linear-gradient(to right, red 0%, green 100%)}");
        t.end();
    });
    t.test('dash-case property names', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            backgroundColor: 'red'
        });
        t.equal(Style.getStyles(), "." + className + "{background-color:red}");
        t.end();
    });
    t.test('nest @-rules', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            color: 'red',
            '@media (min-width: 500px)': {
                color: 'blue'
            }
        });
        t.equal(Style.getStyles(), "." + className + "{color:red}@media (min-width: 500px){." + className + "{color:blue}}");
        t.end();
    });
    t.test('interpolate selectors', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            color: 'red',
            '& > &': {
                color: 'blue',
                '.class-name': {
                    background: 'green'
                }
            }
        });
        t.equal(Style.getStyles(), "." + className + "{color:red}." + className + " > ." + className + "{color:blue}" +
            ("." + className + " > ." + className + " .class-name{background:green}"));
        t.end();
    });
    t.test('do not append "px" to whitelist properties', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            flexGrow: 2,
            WebkitFlexGrow: 2
        });
        t.equal(Style.getStyles(), "." + className + "{-webkit-flex-grow:2;flex-grow:2}");
        t.end();
    });
    t.test('merge exactly duplicate styles', function (t) {
        var Style = free_style_1.create();
        var changeId = Style.changeId;
        var className1 = Style.registerStyle({
            background: 'blue',
            color: 'red'
        });
        t.notEqual(Style.changeId, changeId);
        // Checking the duplicate style _does not_ trigger a "change".
        changeId = Style.changeId;
        var className2 = Style.registerStyle({
            color: 'red',
            background: 'blue'
        });
        t.equal(Style.changeId, changeId);
        t.equal(className1, className2);
        t.equal(Style.getStyles(), "." + className1 + "{background:blue;color:red}");
        t.end();
    });
    t.test('allow debug css prefixes', function (t) {
        var Style = free_style_1.create(undefined, true);
        var changeId = Style.changeId;
        var className1 = Style.registerStyle({
            color: 'red'
        }, 'className1');
        t.notEqual(Style.changeId, changeId);
        changeId = Style.changeId;
        var className2 = Style.registerStyle({
            color: 'red'
        }, 'className2');
        t.notEqual(Style.changeId, changeId);
        t.notEqual(className1, className2);
        t.equal(Style.getStyles(), "." + className1 + ",." + className2 + "{color:red}");
        t.end();
    });
    t.test('ignore debug prefixes in "production"', function (t) {
        var Style = free_style_1.create(undefined, false);
        var changeId = Style.changeId;
        var className1 = Style.registerStyle({
            color: 'red'
        }, 'className1');
        t.notEqual(Style.changeId, changeId);
        changeId = Style.changeId;
        var className2 = Style.registerStyle({
            color: 'red'
        }, 'className2');
        t.equal(Style.changeId, changeId);
        t.equal(className1, className2);
        t.equal(Style.getStyles(), "." + className1 + "{color:red}");
        t.end();
    });
    t.test('sort keys by property name', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            border: '5px solid red',
            borderWidth: 10,
            borderColor: 'blue'
        });
        t.equal(Style.getStyles(), "." + className + "{border:5px solid red;border-color:blue;border-width:10px}");
        t.end();
    });
    t.test('sort keys alphabetically after hyphenating', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            borderRadius: 5,
            msBorderRadius: 5
        });
        t.equal(Style.getStyles(), "." + className + "{-ms-border-radius:5px;border-radius:5px}");
        t.end();
    });
    t.test('overloaded keys should stay sorted in insertion order', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            foo: [15, 13, 11, 9, 7, 5, 3, 1, 14, 12, 10, 8, 6, 4, 2]
        });
        t.equal(Style.getStyles(), "." + className + "{foo:15px;foo:13px;foo:11px;foo:9px;foo:7px;foo:5px;foo:3px;foo:1px;foo:14px;foo:12px;foo:10px;foo:8px;foo:6px;foo:4px;foo:2px}");
        t.end();
    });
    t.test('merge duplicate nested style', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            color: 'red',
            '.foo': {
                color: 'red'
            }
        });
        t.equal(Style.getStyles(), "." + className + ",." + className + " .foo{color:red}");
        t.end();
    });
    t.test('@-rules across multiple styles produce multiple rules', function (t) {
        var _a, _b;
        var Style = free_style_1.create();
        var mediaQuery = '@media (min-width: 600px)';
        var changeId = Style.changeId;
        var className1 = Style.registerStyle((_a = {},
            _a[mediaQuery] = {
                color: 'red'
            },
            _a));
        t.notEqual(Style.changeId, changeId);
        // Checking the next register _does_ trigger a change.
        changeId = Style.changeId;
        var className2 = Style.registerStyle((_b = {},
            _b[mediaQuery] = {
                color: 'blue'
            },
            _b));
        t.notEqual(Style.changeId, changeId);
        t.equal(Style.getStyles(), "@media (min-width: 600px){." + className1 + "{color:red}}@media (min-width: 600px){." + className2 + "{color:blue}}");
        t.end();
    });
    t.test('do not output empty styles', function (t) {
        var Style = free_style_1.create();
        Style.registerStyle({
            color: null
        });
        t.equal(Style.getStyles(), '');
        t.end();
    });
    t.test('support @-rules within @-rules', function (t) {
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            '@media (min-width: 100em)': {
                '@supports (display: flexbox)': {
                    maxWidth: 100
                }
            }
        });
        t.equal(Style.getStyles(), "@media (min-width: 100em){@supports (display: flexbox){." + className + "{max-width:100px}}}");
        t.end();
    });
    t.test('merge styles across instances', function (t) {
        var Style1 = free_style_1.create();
        var Style2 = free_style_1.create();
        var Style3 = free_style_1.create();
        var className1 = Style1.registerStyle({
            color: 'red'
        });
        Style2.registerStyle({
            color: 'red'
        });
        var className3 = Style3.registerStyle({
            color: 'red',
            '@media (max-width: 600px)': {
                color: 'blue'
            }
        });
        Style2.merge(Style3);
        Style1.merge(Style2);
        t.equal(Style1.getStyles(), "." + className1 + "{color:red}." + className3 + "{color:red}@media (max-width: 600px){." + className3 + "{color:blue}}");
        Style1.unmerge(Style2);
        t.equal(Style1.getStyles(), "." + className1 + "{color:red}");
        t.end();
    });
    t.test('keyframes', function (t) {
        var Style = free_style_1.create();
        var keyframes = Style.registerKeyframes({
            from: { color: 'red' },
            to: { color: 'blue' }
        });
        t.equal(Style.getStyles(), "@keyframes " + keyframes + "{from{color:red}to{color:blue}}");
        t.end();
    });
    t.test('merge duplicate keyframes', function (t) {
        var Style = free_style_1.create();
        var keyframes1 = Style.registerKeyframes({
            from: { color: 'red' },
            to: { color: 'blue' }
        });
        var keyframes2 = Style.registerKeyframes({
            to: { color: 'blue' },
            from: { color: 'red' }
        });
        t.equal(keyframes1, keyframes2);
        t.equal(Style.getStyles(), "@keyframes " + keyframes1 + "{from{color:red}to{color:blue}}");
        t.end();
    });
    t.test('register arbitrary at rule', function (t) {
        var Style = free_style_1.create();
        var changeId = Style.changeId;
        Style.registerRule('@font-face', {
            fontFamily: '"Bitstream Vera Serif Bold"',
            src: 'url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf")'
        });
        t.notEqual(Style.changeId, changeId);
        t.equal(Style.getStyles(), '@font-face{font-family:"Bitstream Vera Serif Bold";' +
            'src:url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf")}');
        t.end();
    });
    t.test('does not merge arbitrary at rules with different styles', function (t) {
        var Style = free_style_1.create();
        Style.registerRule('@font-face', {
            fontFamily: '"Bitstream Vera Serif Bold"',
            src: 'url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf")'
        });
        Style.registerRule('@font-face', {
            fontFamily: '"MyWebFont"',
            src: 'url("myfont.woff2")'
        });
        t.equal(Style.getStyles(), '@font-face{font-family:"Bitstream Vera Serif Bold";' +
            'src:url("https://mdn.mozillademos.org/files/2468/VeraSeBd.ttf")}' +
            '@font-face{font-family:"MyWebFont";src:url("myfont.woff2")}');
        t.end();
    });
    t.test('register base rule', function (t) {
        var Style = free_style_1.create();
        Style.registerRule('body', {
            margin: 0,
            padding: 0
        });
        t.equal(Style.getStyles(), 'body{margin:0;padding:0}');
        t.end();
    });
    t.test('register at rule with nesting', function (t) {
        var Style = free_style_1.create();
        Style.registerRule('@media print', {
            body: {
                color: 'red'
            }
        });
        t.equal(Style.getStyles(), '@media print{body{color:red}}');
        t.end();
    });
    t.test('de-dupe across styles and rules', function (t) {
        var Style = free_style_1.create();
        var changeId = Style.changeId;
        var className1 = Style.registerStyle({
            color: 'red'
        });
        t.notEqual(Style.changeId, changeId);
        changeId = Style.changeId;
        Style.registerRule('.test', {
            color: 'red'
        });
        t.notEqual(Style.changeId, changeId);
        t.equal(Style.getStyles(), "." + className1 + ",.test{color:red}");
        t.end();
    });
    t.test('retain insertion order', function (t) {
        var Style = free_style_1.create();
        var x = Style.registerStyle({
            background: 'red',
            '@media (min-width: 400px)': {
                background: 'yellow'
            }
        });
        var y = Style.registerStyle({
            background: 'palegreen',
            '@media (min-width: 400px)': {
                background: 'pink'
            }
        });
        t.equal(Style.getStyles(), "." + x + "{background:red}@media (min-width: 400px){." + x + "{background:yellow}}" +
            ("." + y + "{background:palegreen}@media (min-width: 400px){." + y + "{background:pink}}"));
        t.end();
    });
    t.test('retain nested param order', function (t) {
        var Style = free_style_1.create();
        var changeId = Style.changeId;
        var className = Style.registerStyle({
            width: '20rem',
            '@media screen and (min-width: 500px)': {
                width: 500
            },
            '@media screen and (min-width: 1000px)': {
                width: 1000
            }
        });
        t.notEqual(Style.changeId, changeId);
        t.equal(Style.getStyles(), "." + className + "{width:20rem}@media screen and (min-width: 500px){." + className + "{width:500px}}" +
            ("@media screen and (min-width: 1000px){." + className + "{width:1000px}}"));
        t.end();
    });
    t.test('should work with properties and nested styles in a single rule', function (t) {
        var Style = free_style_1.create();
        Style.registerRule('body', {
            height: '100%',
            a: {
                color: 'red'
            }
        });
        t.equal(Style.getStyles(), 'body{height:100%}body a{color:red}');
        t.end();
    });
    t.test('should interpolate recursively with a rule', function (t) {
        var Style = free_style_1.create();
        Style.registerRule('body', {
            height: '100%',
            a: {
                color: 'red'
            },
            '@print': {
                a: {
                    color: 'blue'
                }
            }
        });
        t.equal(Style.getStyles(), 'body{height:100%}body a{color:red}@print{body a{color:blue}}');
        t.end();
    });
    t.test('customise hash algorithm', function (t) {
        var Style = free_style_1.create(function (str) {
            return crypto.createHash('sha256').update(str).digest('hex');
        });
        var className1 = Style.registerStyle({
            color: 'red'
        });
        var className2 = Style.registerStyle({
            color: 'blue'
        });
        var keyframes = Style.registerKeyframes({
            from: {
                color: 'red'
            },
            to: {
                color: 'blue'
            }
        });
        t.equal(className2.length, 65);
        t.equal(className1.length, 65);
        t.equal(keyframes.length, 65);
        t.equal(Style.getStyles(), "." + className1 + "{color:red}." + className2 + "{color:blue}@keyframes " + keyframes + "{from{color:red}to{color:blue}}");
        t.end();
    });
    t.test('disable style de-dupe', function (t) {
        var _a, _b, _c;
        var Style = free_style_1.create();
        var className = Style.registerStyle({
            color: 'blue',
            '&::-webkit-input-placeholder': (_a = {
                    color: "rgba(0, 0, 0, 0)"
                },
                _a[free_style_1.IS_UNIQUE] = true,
                _a),
            '&::-moz-placeholder': (_b = {
                    color: "rgba(0, 0, 0, 0)"
                },
                _b[free_style_1.IS_UNIQUE] = true,
                _b),
            '&::-ms-input-placeholder': (_c = {
                    color: "rgba(0, 0, 0, 0)"
                },
                _c[free_style_1.IS_UNIQUE] = true,
                _c)
        });
        t.equal(Style.getStyles(), "." + className + "{color:blue}" +
            ("." + className + "::-webkit-input-placeholder{color:rgba(0, 0, 0, 0)}") +
            ("." + className + "::-moz-placeholder{color:rgba(0, 0, 0, 0)}") +
            ("." + className + "::-ms-input-placeholder{color:rgba(0, 0, 0, 0)}"));
        t.end();
    });
    t.test('register a css object', function (t) {
        var Style = free_style_1.create();
        Style.registerCss({
            'body': {
                color: 'red',
                '@print': {
                    color: 'blue'
                }
            },
            h1: {
                color: 'red',
                '@print': {
                    color: '#000',
                    a: {
                        color: 'blue'
                    }
                }
            }
        });
        t.equal(Style.getStyles(), 'body,h1{color:red}@print{body,h1 a{color:blue}h1{color:#000}}');
        t.end();
    });
    t.test('registering a hashed rule', function (t) {
        var Style = free_style_1.create();
        var animation1 = Style.registerHashRule('@keyframes', {
            from: {
                color: 'blue'
            },
            to: {
                color: 'red'
            }
        });
        var animation2 = Style.registerHashRule('@-webkit-keyframes', {
            from: {
                color: 'blue'
            },
            to: {
                color: 'red'
            }
        });
        t.equal(animation1, animation2);
        t.equal(Style.getStyles(), "@keyframes " + animation1 + "{from{color:blue}to{color:red}}@-webkit-keyframes " + animation2 + "{from{color:blue}to{color:red}}");
        t.end();
    });
    t.test('change events', function (t) {
        var styles = [];
        var Style = free_style_1.create(undefined, undefined, {
            add: function (style, index) {
                styles.splice(index, 0, style.getStyles());
            },
            change: function (style, oldIndex, newIndex) {
                styles.splice(oldIndex, 1);
                styles.splice(newIndex, 0, style.getStyles());
            },
            remove: function (_, index) {
                styles.splice(index, 1);
            }
        });
        Style.registerStyle({
            background: 'red',
            '@media (min-width: 400px)': {
                background: 'yellow'
            }
        });
        Style.registerStyle({
            background: 'palegreen',
            '@media (min-width: 400px)': {
                background: 'pink'
            }
        });
        t.equal(styles.join(''), Style.getStyles());
        t.end();
    });
    t.test('escape css selectors', function (t) {
        var Style = free_style_1.create();
        var displayName = 'Connect(App)';
        var animationName = Style.registerKeyframes({ from: { color: 'red' } }, displayName);
        var className = Style.registerStyle({ animation: animationName, '.t': { color: 'red' } }, displayName);
        t.ok(animationName.startsWith(displayName));
        t.ok(className.startsWith(displayName));
        t.equal(Style.getStyles(), "@keyframes " + free_style_1.escape(animationName) + "{from{color:red}}" +
            ("." + free_style_1.escape(className) + "{animation:Connect(App)_ftl4afb}") +
            ("." + free_style_1.escape(className) + " .t{color:red}"));
        t.end();
    });
});
//# sourceMappingURL=free-style.spec.js.map