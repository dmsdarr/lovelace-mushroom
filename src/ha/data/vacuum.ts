import { HassEntityAttributeBase, HassEntityBase } from "home-assistant-js-websocket";

export const STATE_ON = "on";
export const STATE_OFF = "off";
export const STATE_CLEANING = "cleaning";
export const STATE_DOCKED = "docked";
export const STATE_IDLE = "idle";
export const STATE_PAUSED = "paused";
export const STATE_RETURNING = "returning";
export const STATE_ERROR = "error";

export const SUPPORT_TURN_ON = 1;
export const SUPPORT_TURN_OFF = 2;
export const SUPPORT_PAUSE = 4;
export const SUPPORT_STOP = 8;
export const SUPPORT_RETURN_HOME = 16;
export const SUPPORT_STATUS = 128;
export const SUPPORT_LOCATE = 512;
export const SUPPORT_CLEAN_SPOT = 1024;
export const SUPPORT_MAP = 2048;
export const SUPPORT_STATE = 4096;
export const SUPPORT_START = 8192;

interface VacuumEntityAttributes extends HassEntityAttributeBase {
    battery_level: number;
    fan_speed: any;
    [key: string]: any;
}

export interface VacuumEntity extends HassEntityBase {
    attributes: VacuumEntityAttributes;
}
