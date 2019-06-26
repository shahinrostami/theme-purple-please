// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import { classes, style } from 'typestyle/lib';
import icon from '../style/icon';
/**
 * A functional tsx component for an icon.
 */
export function IconItem(props) {
    const { source, className } = props, rest = __rest(props, ["source", "className"]);
    return (React.createElement("div", Object.assign({ className: classes(className, source, style(icon())) }, rest)));
}
//# sourceMappingURL=icon.js.map