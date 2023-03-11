import { HassEntity } from "home-assistant-js-websocket";
import { html } from "lit";
import { getEntityPicture, HomeAssistant, isAvailable, isUnknown } from "../ha";

const TIMESTAMP_STATE_DOMAINS = ["button", "input_button", "scene"];

export const INFOS = ["name", "state", "last-changed", "last-updated", "none", "template"] as const;
export type Info = (typeof INFOS)[number];

export const ICON_TYPES = ["icon", "entity-picture", "none"] as const;
export type IconType = (typeof ICON_TYPES)[number];

export function computeInfoDisplay(
    info: Info,
    name: string,
    state: string,
    entity: HassEntity,
    hass: HomeAssistant
) {
    switch (info) {
        case "name":
            return name;
        case "state":
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
        case "template":
            // TODO: render template
            const isTemplate = name.includes("{")
            if (isTemplate) {
                // TODO: render template here
                return state;
            } else {
                return state;
            }
        case "none":
            return undefined;
    }
}

export function computeEntityPicture(entity: HassEntity, iconType: IconType) {
    return iconType === "entity-picture" ? getEntityPicture(entity) : undefined;
}
