import * as React from "react";
import { HotkeyConfig } from "../../hooks";
import { DialogProps } from "../dialog/dialog";
export interface HotkeysDialog2Props extends DialogProps {
    /**
     * This string displayed as the group name in the hotkeys dialog for all
     * global hotkeys.
     */
    globalGroupName?: string;
    hotkeys: HotkeyConfig[];
}
export declare const HotkeysDialog2: React.FC<HotkeysDialog2Props>;
