import { VALIDATE_ALL } from 'builder_platform_interaction-validation-rules';
import {PropertyChangedEvent, LoopCollectionChangedEvent} from 'builder_platform_interaction-events';
import {loopValidation} from './loop-validation';
import {updateProperties} from 'builder_platform_interaction-data-mutation-lib';

const LOOP_PROPERTIES = {
    COLLECTION_VARIABLE: 'collectionReference',
    LOOP_VARIABLE: 'assignNextValueToReference'
};

const loopPropertyChanged = (state, event) => {
    event.detail.error = event.detail.error === null ?
        loopValidation.validateProperty(event.detail.propertyName, event.detail.value) : event.detail.error;
    return updateProperties(state, {
        [event.detail.propertyName]: {
            value: event.detail.value,
            error: event.detail.error
        }
    });
};

const loopCollectionChangedEvent = (state, event) => {
    const newCollectionValue = event.detail.collectionValue ? event.detail.collectionValue : null;
    event.detail.collectionError = event.detail.collectionError === null ?
        loopValidation.validateProperty(LOOP_PROPERTIES.COLLECTION_VARIABLE, newCollectionValue) : event.detail.collectionError;
    return updateProperties(state, {
        [LOOP_PROPERTIES.COLLECTION_VARIABLE]: {
            value: newCollectionValue,
            error: event.detail.collectionError
        },
        [LOOP_PROPERTIES.LOOP_VARIABLE]: {
            value: event.detail.loopVariableValue ? event.detail.loopVariableValue : null,
            error: event.detail.loopVariableErrorMessage ? event.detail.loopVariableErrorMessage : null
        }
    });
};

/**
 * @typedef {type:String, payload: {propertyName: String, value: String, error: String} Event
 */

/**
 * Loop reducer function runs validation rules and returns back the updated element Loop
 * @param {Object} state - element / Loop node
 * @param {Event} event - object containing type and payload
 * @returns {Object} Loop - updated Loop
 */
export const loopReducer = (state, event) => {
    switch (event.type) {
        case PropertyChangedEvent.EVENT_NAME:
            return loopPropertyChanged(state, event);
        case LoopCollectionChangedEvent.EVENT_NAME:
            return loopCollectionChangedEvent(state, event);
        case VALIDATE_ALL: {
            return loopValidation.validateAll(state);
        }
        default: return state;
    }
};