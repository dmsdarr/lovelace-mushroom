import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Layout, layoutStruct } from "../../utils/layout";

export interface VacuumCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    layout?: Layout;
    hide_state?: boolean;
    show_start_pause_control?: false;
    show_stop_control?: false;
    show_locate_control?: false;
    show_clean_spot_control?: false;
    show_return_home_control?: false;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const vacuumCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        name: optional(string()),
        icon: optional(string()),
        layout: optional(layoutStruct),
        hide_state: optional(boolean()),
        show_start_pause_control: optional(boolean()),
        show_stop_control: optional(boolean()),
        show_locate_control: optional(boolean()),
        show_clean_spot_control: optional(boolean()),
        show_return_home_control: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
