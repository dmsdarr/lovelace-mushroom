import {
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/badge-icon";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import {
    SWITCH_CARD_EDITOR_NAME,
    SWITCH_CARD_NAME,
    SWITCH_ENTITY_DOMAINS,
} from "./const";
import { SwitchCardConfig } from "./switch-card-config";
import "./switch-card-editor";

registerCustomCard({
    type: SWITCH_CARD_NAME,
    name: "Mushroom Switch Card",
    description: "Card for switch entity",
});

@customElement(SWITCH_CARD_NAME)
export class SwitchCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        return document.createElement(
            SWITCH_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<SwitchCardConfig> {
        const entities = Object.keys(hass.states);
        const switches = entities.filter((e) =>
            SWITCH_ENTITY_DOMAINS.includes(e.split(".")[0])
        );
        return {
            type: `custom:${SWITCH_CARD_NAME}`,
            entity: switches[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: SwitchCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: SwitchCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
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
        if (!this._config || !this.hass) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        const name = this._config.name ?? entity.attributes.friendly_name;
        const icon = this._config.icon ?? stateIcon(entity);
        const vertical = this._config.vertical;
        const hide_state = !!this._config.hide_state;

        const state = entity.state;

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity,
            this.hass.locale
        );

        return html`<ha-card>
            <div class="container">
                <mushroom-state-item
                    .vertical=${vertical}
                    @action=${this._handleAction}
                    .actionHandler=${actionHandler({
                        hasHold: hasAction(this._config.hold_action),
                    })}
                >
                    <mushroom-shape-icon
                        slot="icon"
                        .disabled=${state !== "on"}
                        .icon=${icon}
                    ></mushroom-shape-icon>
                    ${entity.state === "unavailable"
                        ? html` <mushroom-badge-icon
                              class="unavailable"
                              slot="badge"
                              icon="mdi:help"
                          ></mushroom-badge-icon>`
                        : null}
                    <mushroom-state-info
                        slot="info"
                        .label=${name}
                        .value=${stateDisplay}
                        .hide_value=${hide_state}
                    ></mushroom-state-info>
                </mushroom-state-item>
            </div>
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                :host {
                    --rgb-color: 61, 90, 254;
                }
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon {
                    --icon-color: rgba(var(--rgb-color), 1);
                    --shape-color: rgba(var(--rgb-color), 0.2);
                }
            `,
        ];
    }
}
