import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { APPEARANCE_FORM_SCHEMA } from "../../shared/config/appearance-config";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { COVER_CARD_EDITOR_NAME, COVER_ENTITY_DOMAINS } from "./const";
import { CoverCardConfig, coverCardConfigStruct } from "./cover-card-config";

const COVER_LABELS = [
    "show_buttons_control",
    "show_position_control",
    "show_tilt_position_control",
];

const computeSchema = memoizeOne((version: string, icon?: string): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: COVER_ENTITY_DOMAINS } } },
    { name: "name", selector: { text: {} } },
    { name: "icon", selector: { icon: { placeholder: icon } } },
    ...APPEARANCE_FORM_SCHEMA,
    {
        type: "grid",
        name: "",
        schema: [
            { name: "show_position_control", selector: { boolean: {} } },
            { name: "show_tilt_position_control", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "show_buttons_control", selector: { boolean: {} } },
            { name: "display_battery", selector: { boolean: {} } },
        ],
    },
    ...computeActionsFormSchema(version),
]);

@customElement(COVER_CARD_EDITOR_NAME)
export class CoverCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: CoverCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents(this.hass.connection.haVersion);
    }

    public setConfig(config: CoverCardConfig): void {
        assert(config, coverCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (COVER_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.cover.${schema.name}`);
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
        const schema = computeSchema(this.hass.connection.haVersion, icon);

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }
}
