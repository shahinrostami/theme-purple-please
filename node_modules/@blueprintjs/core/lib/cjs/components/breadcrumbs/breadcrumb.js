"use strict";
/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var classnames_1 = tslib_1.__importDefault(require("classnames"));
var React = tslib_1.__importStar(require("react"));
var Classes = tslib_1.__importStar(require("../../common/classes"));
exports.Breadcrumb = function (breadcrumbProps) {
    var classes = classnames_1.default(Classes.BREADCRUMB, (_a = {},
        _a[Classes.BREADCRUMB_CURRENT] = breadcrumbProps.current,
        _a[Classes.DISABLED] = breadcrumbProps.disabled,
        _a), breadcrumbProps.className);
    if (breadcrumbProps.href == null && breadcrumbProps.onClick == null) {
        return (React.createElement("span", { className: classes },
            breadcrumbProps.text,
            breadcrumbProps.children));
    }
    return (React.createElement("a", { className: classes, href: breadcrumbProps.href, onClick: breadcrumbProps.disabled ? null : breadcrumbProps.onClick, tabIndex: breadcrumbProps.disabled ? null : 0, target: breadcrumbProps.target },
        breadcrumbProps.text,
        breadcrumbProps.children));
    var _a;
};
//# sourceMappingURL=breadcrumb.js.map