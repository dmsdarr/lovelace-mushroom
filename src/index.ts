import { version } from "../package.json";

export { LightCard } from "./cards/light-card/light-card";
export { SwitchCard } from "./cards/switch-card/switch-card";
export { CoverCard } from "./cards/cover-card/cover-card";
export { PersonCard } from "./cards/person-card/person-card";
export { AlarmControlPanelCard } from "./cards/alarm-control-panel-card/alarm-control-panel-card";
export { ChipsCard } from "./cards/chips-card/chips-card";
export { FanCard } from "./cards/fan-card/fan-card";

console.info(
    `%c🍄 Mushroom 🍄 - ${version}`,
    "color: #ef5350; font-weight: 700;"
);
