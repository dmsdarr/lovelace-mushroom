import { fireEvent, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { configElementStyle } from "../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../utils/form/fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { FAN_CARD_EDITOR_NAME, FAN_ENTITY_DOMAINS } from "./const";
import { FanCardConfig, fanCardConfigStruct } from "./fan-card-config";

const FAN_FIELDS = ["icon_animation", "show_percentage_control", "show_oscillate_control", "show_direction_control"];

const computeSchema = memoizeOne((icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: FAN_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "icon", selector: { icon: { placeholder: icon } } },
            { name: "icon_animation", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { "mush-layout": {} } },
            { name: "hide_state", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "show_percentage_control", selector: { boolean: {} } },
            { name: "show_oscillate_control", selector: { boolean: {} } },
            { name: "show_direction_control", selector: { boolean: {} } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(FAN_CARD_EDITOR_NAME)
export class FanCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: FanCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: FanCardConfig): void {
        assert(config, fanCardConfigStruct);
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (FAN_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.fan.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const entityState = this._config.entity ? this.hass.states[this._config.entity] : undefined;
        const entityIcon = entityState ? stateIcon(entityState) : undefined;
        const icon = this._config.icon || entityIcon;
        const schema = computeSchema(icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    static get styles(): CSSResultGroup {
        return [super.styles, configElementStyle];
    }
}
