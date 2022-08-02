import { assign, boolean, object, optional } from "superstruct";
import { LovelaceCardConfig } from "../../ha";
import { ActionsSharedConfig, actionsSharedConfigStruct } from "../../shared/config/actions-config";
import {
    AppearanceSharedConfig,
    appearanceSharedConfigStruct,
} from "../../shared/config/appearance-config";
import { EntitySharedConfig, entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export type InputNumberCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    AppearanceSharedConfig &
    ActionsSharedConfig & {};

export const inputNumberCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, appearanceSharedConfigStruct, actionsSharedConfigStruct),
    object({})
);
