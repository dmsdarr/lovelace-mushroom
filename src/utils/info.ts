import { HassEntity } from "home-assistant-js-websocket";
import { html } from "lit";
import { HomeAssistant, isAvailable, isUnknown } from "../ha";

export const INFOS = ["name", "state", "name-and-state", "last-changed", "last-updated", "none"] as const;
const TIMESTAMP_STATE_DOMAINS = ["button", "input_button", "scene"];

export type Info = typeof INFOS[number];

export function getInfo(
    info: Info,
    name: string,
    state: string,
    entity: HassEntity,
    hass: HomeAssistant
) {
    function getState() {
        const domain = entity.entity_id.split(".")[0];
        if (
            (entity.attributes.device_class === "timestamp" ||
                TIMESTAMP_STATE_DOMAINS.includes(domain)) &&
            isAvailable(entity) &&
            !isUnknown(entity)
        ) {
            return html`
                    <ha-relative-time
                        .hass=${hass}
                        .datetime=${entity.state}
                        capitalize
                    ></ha-relative-time>
                `;
        } else {
            return state;
        }
    }

    switch (info) {
        case "name":
            return name;
        case "state":
            return getState();
        case "name-and-state":
            return name + " " + getState();
        case "last-changed":
            return html`
                <ha-relative-time
                    .hass=${hass}
                    .datetime=${entity.last_changed}
                    capitalize
                ></ha-relative-time>
            `;
        case "last-updated":
            return html`
                <ha-relative-time
                    .hass=${hass}
                    .datetime=${entity.last_updated}
                    capitalize
                ></ha-relative-time>
            `;
        case "none":
            return undefined;
    }
}
