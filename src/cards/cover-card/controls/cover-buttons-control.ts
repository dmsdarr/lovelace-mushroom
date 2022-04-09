import { HomeAssistant } from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { supportsFeature } from "../../../ha/common/entity/supports-feature";
import {
    CoverEntity,
    COVER_SUPPORT_CLOSE,
    COVER_SUPPORT_OPEN,
    COVER_SUPPORT_STOP,
    isClosing,
    isFullyClosed,
    isFullyOpen,
    isOpening,
} from "../../../ha/data/cover";
import "../../../shared/button";
import { UNAVAILABLE } from "../../../utils/entity";
import { computeCloseIcon, computeOpenIcon } from "../../../utils/icons/cover-icon";

@customElement("mushroom-cover-buttons-control")
export class CoverButtonsControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: CoverEntity;

    @property() public fill: boolean = false;

    private _onOpenTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "open_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private _onCloseTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "close_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private _onStopTap(e: MouseEvent): void {
        e.stopPropagation();
        this.hass.callService("cover", "stop_cover", {
            entity_id: this.entity.entity_id,
        });
    }

    private get openDisabled(): boolean {
        if (this.entity.state === UNAVAILABLE) return true;
        const assumedState = this.entity.attributes.assumed_state === true;
        return (isFullyOpen(this.entity) || isOpening(this.entity)) && !assumedState;
    }

    private get closedDisabled(): boolean {
        if (this.entity.state === UNAVAILABLE) return true;
        const assumedState = this.entity.attributes.assumed_state === true;
        return (isFullyClosed(this.entity) || isClosing(this.entity)) && !assumedState;
    }

    private get pauseDisabled(): boolean {
        return this.entity.state === UNAVAILABLE;
    }

    protected render(): TemplateResult {
        return html`
            <div
                class=${classMap({
                    container: true,
                    fill: this.fill,
                })}
            >
                ${supportsFeature(this.entity, COVER_SUPPORT_CLOSE)
                    ? html`
                          <mushroom-button
                              .icon=${computeCloseIcon(this.entity)}
                              .disabled=${this.closedDisabled}
                              @click=${this._onCloseTap}
                          ></mushroom-button>
                      `
                    : undefined}
                ${supportsFeature(this.entity, COVER_SUPPORT_STOP)
                    ? html`
                          <mushroom-button
                              icon="mdi:pause"
                              .disabled=${this.pauseDisabled}
                              @click=${this._onStopTap}
                          ></mushroom-button>
                      `
                    : undefined}
                ${supportsFeature(this.entity, COVER_SUPPORT_OPEN)
                    ? html`
                          <mushroom-button
                              .icon=${computeOpenIcon(this.entity)}
                              .disabled=${this.openDisabled}
                              @click=${this._onOpenTap}
                          ></mushroom-button>
                      `
                    : undefined}
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
            :host *:not(:last-child) {
                margin-right: var(--spacing);
            }
            .container {
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
            }
            .container.fill mushroom-button {
                flex: 1;
            }
        `;
    }
}
