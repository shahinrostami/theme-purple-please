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
var React = tslib_1.__importStar(require("react"));
var errors_1 = require("../../common/errors");
var utils_1 = require("../../common/utils");
var hotkeysEvents_1 = require("./hotkeysEvents");
function HotkeysTarget(WrappedComponent) {
    if (!utils_1.isFunction(WrappedComponent.prototype.renderHotkeys)) {
        console.warn(errors_1.HOTKEYS_WARN_DECORATOR_NO_METHOD);
    }
    return _a = /** @class */ (function (_super) {
            tslib_1.__extends(HotkeysTargetClass, _super);
            function HotkeysTargetClass() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            HotkeysTargetClass.prototype.componentWillMount = function () {
                if (_super.prototype.componentWillMount != null) {
                    _super.prototype.componentWillMount.call(this);
                }
                this.localHotkeysEvents = new hotkeysEvents_1.HotkeysEvents(hotkeysEvents_1.HotkeyScope.LOCAL);
                this.globalHotkeysEvents = new hotkeysEvents_1.HotkeysEvents(hotkeysEvents_1.HotkeyScope.GLOBAL);
            };
            HotkeysTargetClass.prototype.componentDidMount = function () {
                if (_super.prototype.componentDidMount != null) {
                    _super.prototype.componentDidMount.call(this);
                }
                // attach global key event listeners
                document.addEventListener("keydown", this.globalHotkeysEvents.handleKeyDown);
                document.addEventListener("keyup", this.globalHotkeysEvents.handleKeyUp);
            };
            HotkeysTargetClass.prototype.componentWillUnmount = function () {
                if (_super.prototype.componentWillUnmount != null) {
                    _super.prototype.componentWillUnmount.call(this);
                }
                document.removeEventListener("keydown", this.globalHotkeysEvents.handleKeyDown);
                document.removeEventListener("keyup", this.globalHotkeysEvents.handleKeyUp);
                this.globalHotkeysEvents.clear();
                this.localHotkeysEvents.clear();
            };
            HotkeysTargetClass.prototype.render = function () {
                var _this = this;
                var element = _super.prototype.render.call(this);
                if (element == null) {
                    // always return `element` in case caller is distinguishing between `null` and `undefined`
                    return element;
                }
                if (!React.isValidElement(element)) {
                    console.warn(errors_1.HOTKEYS_WARN_DECORATOR_NEEDS_REACT_ELEMENT);
                    return element;
                }
                if (utils_1.isFunction(this.renderHotkeys)) {
                    var hotkeys = this.renderHotkeys();
                    this.localHotkeysEvents.setHotkeys(hotkeys.props);
                    this.globalHotkeysEvents.setHotkeys(hotkeys.props);
                    if (this.localHotkeysEvents.count() > 0) {
                        var tabIndex = hotkeys.props.tabIndex === undefined ? 0 : hotkeys.props.tabIndex;
                        var _a = element.props, existingKeyDown_1 = _a.keyDown, existingKeyUp_1 = _a.keyUp;
                        var onKeyDown = function (e) {
                            _this.localHotkeysEvents.handleKeyDown(e.nativeEvent);
                            utils_1.safeInvoke(existingKeyDown_1, e);
                        };
                        var onKeyUp = function (e) {
                            _this.localHotkeysEvents.handleKeyUp(e.nativeEvent);
                            utils_1.safeInvoke(existingKeyUp_1, e);
                        };
                        return React.cloneElement(element, { tabIndex: tabIndex, onKeyDown: onKeyDown, onKeyUp: onKeyUp });
                    }
                }
                return element;
            };
            return HotkeysTargetClass;
        }(WrappedComponent)),
        _a.displayName = "HotkeysTarget(" + utils_1.getDisplayName(WrappedComponent) + ")",
        _a;
    var _a;
}
exports.HotkeysTarget = HotkeysTarget;
//# sourceMappingURL=hotkeysTarget.js.map