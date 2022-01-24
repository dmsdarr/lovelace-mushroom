import {
    ActionConfig,
    ActionHandlerEvent,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
    stateIcon,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../../shared/state-item";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { SWITCH_CARD_EDITOR_NAME, SWITCH_CARD_NAME } from "./const";
import "./switch-card-editor";

export interface SwitchCardConfig extends LovelaceCardConfig {
    entity: string;
    icon?: string;
    name?: string;
    vertical?: boolean;
    hide_state?: boolean;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
}

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
        const switches = entities.filter(
            (e) => e.substr(0, e.indexOf(".")) === "switch"
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

        const entity = this._config.entity;
        const entity_state = this.hass.states[entity];

        const name = this._config.name ?? entity_state.attributes.friendly_name;
        const icon = this._config.icon ?? stateIcon(entity_state);
        const vertical = !!this._config.vertical;
        const hide_state = !!this._config.hide_state;

        const state = entity_state.state;

        const stateDisplay = computeStateDisplay(
            this.hass.localize,
            entity_state,
            this.hass.locale
        );

        return html`<ha-card>
            <mushroom-state-item
                .icon=${icon}
                .name=${name}
                .value=${stateDisplay}
                .active=${state === "on"}
                .vertical=${vertical}
                .hide_value=${hide_state}
                @action=${this._handleAction}
                .actionHandler=${actionHandler({
                    hasHold: hasAction(this._config.hold_action),
                })}
            ></mushroom-state-item>
        </ha-card>`;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                --rgb-color: 61, 90, 254;
            }
            ha-card {
                display: flex;
                flex-direction: column;
                padding: 12px;
            }
            mushroom-state-item {
                cursor: pointer;
                --icon-main-color: rgba(var(--rgb-color), 1);
                --icon-shape-color: rgba(var(--rgb-color), 0.2);
            }
        `;
    }
}
