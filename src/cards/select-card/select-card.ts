import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    handleAction,
    hasAction,
    HomeAssistant,
    isActive,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-avatar";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { computeAppearance } from "../../utils/appearance";
import { MushroomBaseCard } from "../../utils/base-card";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { computeEntityPicture } from "../../utils/info";
import { SELECT_CARD_EDITOR_NAME, SELECT_CARD_NAME } from "./const";
import "./controls/select-option-control";
import { SelectCardConfig } from "./select-card-config";

registerCustomCard({
    type: SELECT_CARD_NAME,
    name: "Mushroom Select Card",
    description: "Card for select and input_select entities",
});

@customElement(SELECT_CARD_NAME)
export class SelectCard extends MushroomBaseCard implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./select-card-editor");
        return document.createElement(SELECT_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<SelectCardConfig> {
        const entities = Object.keys(hass.states);
        return {
            type: `custom:${SELECT_CARD_NAME}`,
            entity: entities[0],
        };
    }

    @state() private _config?: SelectCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: SelectCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entityId = this._config.entity;
        const entity = this.hass.states[entityId];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const appearance = computeAppearance(this._config);

        const picture = computeEntityPicture(entity, appearance.icon_type);

        const rtl = computeRTL(this.hass);

        return html`
            <ha-card class=${classMap({ "fill-container": appearance.fill_container })}>
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .appearance=${appearance}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        ${picture ? this.renderPicture(picture) : this.renderIcon(entity, icon)}
                        ${this.renderBadge(entity)}
                        ${this.renderStateInfo(entity, appearance, name)};
                    </mushroom-state-item>
                    <div class="actions" ?rtl=${rtl}>
                        <mushroom-select-option-control
                        .hass=${this.hass}
                        .entity=${entity}
                    ></mushroom-select-option-control>             
                </mushroom-card>
            </ha-card>
        `;
    }

    renderIcon(entity: HassEntity, icon: string): TemplateResult {
        const active = isActive(entity);
        const iconStyle = {};
        const iconColor = this._config?.icon_color;
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }
        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!active}
                .icon=${icon}
                style=${styleMap(iconStyle)}
            ></mushroom-shape-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                .actions {
                    overflow: visible;
                    display: block;
                }
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgb(var(--rgb-state-entity));
                    --shape-color: rgba(var(--rgb-state-entity), 0.2);
                }
                mushroom-select-option-control {
                    flex: 1;
                }
            `,
        ];
    }
}
