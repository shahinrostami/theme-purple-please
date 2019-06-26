// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import vars from './variables';
import { style } from 'typestyle/lib';
export const baseText = {
    fontSize: vars.fontSize,
    fontFamily: vars.fontFamily
};
export const textItem = style(baseText, {
    lineHeight: '24px',
    color: vars.textColor
});
//# sourceMappingURL=text.js.map