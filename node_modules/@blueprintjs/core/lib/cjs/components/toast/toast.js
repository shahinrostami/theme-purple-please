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
var abstractPureComponent_1 = require("../../common/abstractPureComponent");
var Classes = tslib_1.__importStar(require("../../common/classes"));
var props_1 = require("../../common/props");
var utils_1 = require("../../common/utils");
var buttonGroup_1 = require("../button/buttonGroup");
var buttons_1 = require("../button/buttons");
var icon_1 = require("../icon/icon");
var Toast = /** @class */ (function (_super) {
    tslib_1.__extends(Toast, _super);
    function Toast() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleActionClick = function (e) {
            utils_1.safeInvoke(_this.props.action.onClick, e);
            _this.triggerDismiss(false);
        };
        _this.handleCloseClick = function () { return _this.triggerDismiss(false); };
        _this.startTimeout = function () {
            _this.clearTimeouts();
            if (_this.props.timeout > 0) {
                _this.setTimeout(function () { return _this.triggerDismiss(true); }, _this.props.timeout);
            }
        };
        return _this;
    }
    Toast.prototype.render = function () {
        var _a = this.props, className = _a.className, icon = _a.icon, intent = _a.intent, message = _a.message;
        return (React.createElement("div", { className: classnames_1.default(Classes.TOAST, Classes.intentClass(intent), className), onBlur: this.startTimeout, onFocus: this.clearTimeouts, onMouseEnter: this.clearTimeouts, onMouseLeave: this.startTimeout, tabIndex: 0 },
            React.createElement(icon_1.Icon, { icon: icon }),
            React.createElement("span", { className: Classes.TOAST_MESSAGE }, message),
            React.createElement(buttonGroup_1.ButtonGroup, { minimal: true },
                this.maybeRenderActionButton(),
                React.createElement(buttons_1.Button, { icon: "cross", onClick: this.handleCloseClick }))));
    };
    Toast.prototype.componentDidMount = function () {
        this.startTimeout();
    };
    Toast.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.timeout !== this.props.timeout) {
            if (this.props.timeout > 0) {
                this.startTimeout();
            }
            else {
                this.clearTimeouts();
            }
        }
    };
    Toast.prototype.componentWillUnmount = function () {
        this.clearTimeouts();
    };
    Toast.prototype.maybeRenderActionButton = function () {
        var action = this.props.action;
        if (action == null) {
            return undefined;
        }
        else {
            return React.createElement(buttons_1.AnchorButton, tslib_1.__assign({}, action, { intent: undefined, onClick: this.handleActionClick }));
        }
    };
    Toast.prototype.triggerDismiss = function (didTimeoutExpire) {
        this.clearTimeouts();
        utils_1.safeInvoke(this.props.onDismiss, didTimeoutExpire);
    };
    Toast.defaultProps = {
        className: "",
        message: "",
        timeout: 5000,
    };
    Toast.displayName = props_1.DISPLAYNAME_PREFIX + ".Toast";
    return Toast;
}(abstractPureComponent_1.AbstractPureComponent));
exports.Toast = Toast;
//# sourceMappingURL=toast.js.map