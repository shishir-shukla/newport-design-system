import { ELEMENT_TYPE } from 'builder_platform_interaction/flowMetadata';
import { baseCanvasElement, baseCanvasElementsArrayToMap, duplicateCanvasElement, createAvailableConnection } from './base/baseElement';
import { baseCanvasElementMetadataObject } from './base/baseMetadata';
import { createConnectorObjects } from './connector';
import { removeFromAvailableConnections } from 'builder_platform_interaction/connectorUtils';
import { FLOW_DATA_TYPE } from 'builder_platform_interaction/dataTypeLib';
import { getDefaultAvailableConnections, createRecordFilters, createFilterMetadataObject }  from "./base/baseRecordElement";

const MAX_CONNECTIONS = 2;


const getAvailableConnections = recordDelete => {
    const { availableConnections } = recordDelete;
    return availableConnections ?
            availableConnections.map(availableConnection => createAvailableConnection(availableConnection)) :
            getDefaultAvailableConnections();
};

export function createRecordDelete(recordDelete = {}) {
    const newRecordDelete = baseCanvasElement(recordDelete);
    const { inputReference = '', object = '', filters } = recordDelete;
    const availableConnections = getAvailableConnections(recordDelete);

    return Object.assign(newRecordDelete, {
        inputReference,
        object,
        filters : createRecordFilters(filters, object, []),
        maxConnections : MAX_CONNECTIONS,
        availableConnections,
        elementType : ELEMENT_TYPE.RECORD_DELETE,
        dataType: FLOW_DATA_TYPE.BOOLEAN.value,
    });
}

export function createDuplicateRecordDelete(recordDelete, newGuid) {
    const newRecordDelete = createRecordDelete(recordDelete);
    const duplicateRecordDelete = duplicateCanvasElement(newRecordDelete, newGuid);

    return duplicateRecordDelete;
}

export function createRecordDeleteWithConnectors(recordDelete) {
    const newRecordDelete = createRecordDelete(recordDelete);

    const connectors = createConnectorObjects(
        recordDelete,
        newRecordDelete.guid
    );
    const availableConnections = removeFromAvailableConnections(
            getDefaultAvailableConnections(),
            connectors
    );
    const connectorCount = connectors ? connectors.length : 0;

    const recordDeleteObject = Object.assign(newRecordDelete, {
        availableConnections,
        connectorCount
    });

    return baseCanvasElementsArrayToMap([recordDeleteObject], connectors);
}

export function createRecordDeleteMetadataObject(recordDelete, config) {
    if (!recordDelete) {
        throw new Error('recordDelete is not defined');
    }

    const recordDeleteMetadata = baseCanvasElementMetadataObject(recordDelete, config);
    const { inputReference, object } = recordDelete;
    if (inputReference) {
        return Object.assign(recordDeleteMetadata, {
            inputReference,
            filters : []
        });
    }

    let { filters = [] } = recordDelete;
    filters = filters.map(filter => createFilterMetadataObject(filter));
    return Object.assign(recordDeleteMetadata, {
        object,
        filters
    });
}
