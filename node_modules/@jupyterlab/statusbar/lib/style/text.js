// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { style } from 'typestyle/lib';
import vars from './variables';
export const baseText = {
    fontSize: vars.fontSize,
    fontFamily: vars.fontFamily
};
export const textItem = style(baseText, {
    lineHeight: '24px',
    color: vars.textColor
});
//# sourceMappingURL=text.js.map