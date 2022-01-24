import {
    ActionConfig,
    computeRTLDirection,
    fireEvent,
    HomeAssistant,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert, assign, boolean, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import {
    baseLovelaceCardConfig,
    configElementStyle,
} from "../../utils/editor-styles";
import { EditorTarget } from "../../utils/lovelace/editor/types";
import { PERSON_CARD_EDITOR_NAME } from "./const";
import { PersonCardConfig } from "./person-card";

const DOMAINS = ["person"];

const cardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: string(),
        icon: optional(string()),
        name: optional(string()),
        vertical: optional(boolean()),
        hide_state: optional(boolean()),
        use_entity_picture: optional(boolean()),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
    })
);

const actions = ["more-info", "navigate", "url", "call-service", "none"];

@customElement(PERSON_CARD_EDITOR_NAME)
export class SwitchCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: PersonCardConfig;

    public setConfig(config: PersonCardConfig): void {
        assert(config, cardConfigStruct);
        this._config = config;
    }

    get _entity(): string {
        return this._config!.entity || "";
    }

    get _name(): string {
        return this._config!.name || "";
    }

    get _icon(): string {
        return this._config!.icon || "";
    }

    get _vertical(): boolean {
        return !!this._config!.vertical;
    }

    get _hide_state(): boolean {
        return !!this._config!.hide_state;
    }

    get _use_entity_picture(): boolean {
        return !!this._config!.use_entity_picture;
    }

    get _tap_action(): ActionConfig | undefined {
        return this._config!.tap_action;
    }

    get _hold_action(): ActionConfig | undefined {
        return this._config!.hold_action;
    }

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const dir = computeRTLDirection(this.hass);

        return html`
            <div class="card-config">
                <ha-entity-picker
                    .label="${this.hass.localize(
                        "ui.panel.lovelace.editor.card.generic.entity"
                    )}"
                    .hass=${this.hass}
                    .value=${this._entity}
                    .configValue=${"entity"}
                    @value-changed=${this._valueChanged}
                    .includeDomains=${DOMAINS}
                    allow-custom-entity
                ></ha-entity-picker>
                <div class="side-by-side">
                    <paper-input
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.name"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._name}
                        .configValue=${"name"}
                        @value-changed=${this._valueChanged}
                    ></paper-input>
                    <ha-icon-picker
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.icon"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .value=${this._icon}
                        .placeholder=${this._icon || "mdi:face-man"}
                        .configValue=${"icon"}
                        @value-changed=${this._valueChanged}
                    ></ha-icon-picker>
                </div>
                <div class="side-by-side">
                    <ha-formfield label="Vertical?" .dir=${dir}>
                        <ha-switch
                            .checked=${this._vertical != false}
                            .configValue=${"vertical"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield label="Hide state?" .dir=${dir}>
                        <ha-switch
                            .checked=${this._hide_state != false}
                            .configValue=${"hide_state"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                    <ha-formfield label="Use entity picture?" .dir=${dir}>
                        <ha-switch
                            .checked=${this._use_entity_picture != false}
                            .configValue=${"use_entity_picture"}
                            @change=${this._valueChanged}
                        ></ha-switch>
                    </ha-formfield>
                </div>
                <div class="side-by-side">
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.tap_action"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .hass=${this.hass}
                        .config=${this._tap_action}
                        .actions=${actions}
                        .configValue=${"tap_action"}
                        .tooltipText=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.button.default_action_help"
                        )}
                        @value-changed=${this._valueChanged}
                    ></hui-action-editor>
                    <hui-action-editor
                        .label="${this.hass.localize(
                            "ui.panel.lovelace.editor.card.generic.hold_action"
                        )} (${this.hass.localize(
                            "ui.panel.lovelace.editor.card.config.optional"
                        )})"
                        .hass=${this.hass}
                        .config=${this._hold_action}
                        .actions=${actions}
                        .configValue=${"hold_action"}
                        .tooltipText=${this.hass.localize(
                            "ui.panel.lovelace.editor.card.button.default_action_help"
                        )}
                        @value-changed=${this._valueChanged}
                    ></hui-action-editor>
                </div>
            </div>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const value =
            target.checked !== undefined ? target.checked : ev.detail.value;

        if (this[`_${target.configValue}`] === value) {
            return;
        }

        let newConfig;
        if (target.configValue) {
            if (!value) {
                newConfig = { ...this._config };
                delete newConfig[target.configValue!];
            } else {
                newConfig = {
                    ...this._config,
                    [target.configValue!]: value,
                };
            }
        }
        fireEvent(this, "config-changed", { config: newConfig });
    }

    static get styles(): CSSResultGroup {
        return configElementStyle;
    }
}
