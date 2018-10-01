import { ELEMENT_TYPE, CONNECTOR_TYPE } from "builder_platform_interaction/flowMetadata";
import {
    baseCanvasElement,
    baseCanvasElementsArrayToMap
} from "./base/baseElement";
import { baseCanvasElementMetadataObject } from "./base/baseMetadata";
import { createConnectorObjects } from './connector';
import { removeFromAvailableConnections } from "builder_platform_interaction/connectorUtils";
import { createFEROV, createFEROVMetadataObject } from './ferov';
import { createExpressionListRowItemWithoutOperator, rhsPropertyName, rhsDataTypePropertyName } from "./base/baseList";
import { NUMBER_RECORDS_TO_STORE,
    RECORD_FILTER_CRITERIA } from "builder_platform_interaction/recordEditorLib";
import { createFilter, createFilterMetadataObject } from './base/recordFilter';
import { FLOW_DATA_TYPE } from 'builder_platform_interaction/dataTypeLib';

const elementType = ELEMENT_TYPE.RECORD_UPDATE;
const maxConnections = 2;
const lhsMetadataPropertyName = 'value';
const getDefaultAvailableConnections = () => [
    {
        type: CONNECTOR_TYPE.REGULAR
    },
    {
        type: CONNECTOR_TYPE.FAULT
    }
];

function createRecordInputAssignmentsItem(inputAssignmentsItem, objectType) {
        let newAssignment = {};

        if (inputAssignmentsItem.hasOwnProperty('field')) {
            const leftHandSide = objectType + '.' + inputAssignmentsItem.field;
            if (inputAssignmentsItem.hasOwnProperty(lhsMetadataPropertyName)) {
                newAssignment = createFEROV(inputAssignmentsItem.value, rhsPropertyName, rhsDataTypePropertyName);
            }
            Object.assign(newAssignment, {leftHandSide});
            newAssignment = createExpressionListRowItemWithoutOperator(newAssignment);
        } else {
            newAssignment = createExpressionListRowItemWithoutOperator(inputAssignmentsItem);
        }
        return newAssignment;
}

/*
 * return the selected way to store the variables.
 * the default value is SOBJECT_VARIABLE
 */
function getNumberRecordsToStore(inputReference, object) {
    return inputReference !== '' || object === '' ? NUMBER_RECORDS_TO_STORE.FIRST_RECORD : NUMBER_RECORDS_TO_STORE.ALL_RECORDS;
}

export function createRecordUpdate(recordUpdate = {}) {
    const newRecordUpdate = baseCanvasElement(recordUpdate);
    const { inputReference = '', availableConnections = getDefaultAvailableConnections(), object = '' } = recordUpdate;
    let { filters, inputAssignments = []} = recordUpdate;

    inputAssignments = inputAssignments.map(item => createRecordInputAssignmentsItem(item, object));

    const numberRecordsToStore = getNumberRecordsToStore(inputReference, object);

    if (filters && filters.length > 0) {
        filters = filters.map(filter => createFilter(filter, object));
    } else {
        const newFilter = createFilter();
        filters = [newFilter];
    }

    const filterType = filters[0].leftHandSide
    ? RECORD_FILTER_CRITERIA.ALL
    : RECORD_FILTER_CRITERIA.NONE;

    const recordUpdateObject = Object.assign(newRecordUpdate, {
        inputReference,
        maxConnections,
        availableConnections,
        elementType,
        inputAssignments,
        numberRecordsToStore,
        filters,
        filterType,
        object,
        dataType: FLOW_DATA_TYPE.BOOLEAN.value,
    });

    return recordUpdateObject;
}

export function createRecordUpdateWithConnectors(recordUpdate = {}) {
    const newRecordUpdate = createRecordUpdate(recordUpdate);

    const connectors = createConnectorObjects(
        recordUpdate,
        newRecordUpdate.guid
    );
    const availableConnections = removeFromAvailableConnections(getDefaultAvailableConnections(), connectors);
    const connectorCount = connectors ? connectors.length : 0;

    const recordUpdateObject = Object.assign(newRecordUpdate, {
        availableConnections,
        connectorCount
    });

    return baseCanvasElementsArrayToMap([recordUpdateObject], connectors);
}

function createRecordInputParameterMetadataObject(inputParameter) {
    if (!inputParameter) {
        throw new Error('record filter is not defined');
    }

    const field = inputParameter.leftHandSide.substring(
        inputParameter.leftHandSide.indexOf('.') + 1
    );
    const value = createFEROVMetadataObject(
        inputParameter,
        rhsPropertyName,
        rhsDataTypePropertyName
    );
    if (value) {
        return { field, value };
    }
    return {field};
}

export function createRecordUpdateMetadataObject(recordUpdate, config) {
    if (!recordUpdate) {
        throw new Error('recordUpdate is not defined');
    }

    const recordUpdateMetadata = baseCanvasElementMetadataObject(recordUpdate, config);
    const { inputReference, filterType, object, numberRecordsToStore } = recordUpdate;

    if (numberRecordsToStore === NUMBER_RECORDS_TO_STORE.ALL_RECORDS) {
        let { filters = [], inputAssignments = [] } = recordUpdate;
        if (filterType === RECORD_FILTER_CRITERIA.NONE) {
            filters = [];
        } else {
            filters = filters.map(filter => createFilterMetadataObject(filter));
        }

        inputAssignments = inputAssignments.map(input => createRecordInputParameterMetadataObject(input));

        return Object.assign(recordUpdateMetadata, {
            filters,
            object,
            inputAssignments
        });
    }

    return Object.assign(recordUpdateMetadata, {
        inputReference
    });
}
