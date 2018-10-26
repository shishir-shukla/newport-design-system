import { swapDevNamesToUids } from "./uidSwapping";
import { ELEMENT_TYPE, METADATA_KEY } from "builder_platform_interaction/flowMetadata";
import { createStartElementWithConnectors, createFlowProperties } from "builder_platform_interaction/elementFactory";
import { elementTypeToConfigMap } from "builder_platform_interaction/elementConfig";

/**
 * Translate flow tooling object into UI data model
 *
 * @param {Object} flow Flow tooling object
 * @returns {Object} UI representation of the Flow in a normalized shape
 */
export function translateFlowToUIModel(flow) {
    // Construct flow properties object
    const properties = createFlowProperties(flow);
    // Create start element
    const { elements, connectors }  = createStartElementWithConnectors(flow.metadata.startElementReference);
    // Create elements and connectors from flow Metadata
    let {
        storeElements = {},
        storeConnectors = []
    } = createElementsUsingFlowMetadata(flow.metadata);

    storeElements = updateStoreElements(elements, storeElements);
    storeConnectors = updateStoreConnectors(connectors, storeConnectors);

    const { nameToGuid, canvasElementGuids } = updateCanvasElementGuidsAndNameToGuidMap(storeElements);

    // Swap out dev names for guids in all element references and template fields
    swapDevNamesToUids(nameToGuid, {
        storeElements,
        storeConnectors
    });

    return {
        elements: storeElements,
        connectors: storeConnectors,
        canvasElements: canvasElementGuids,
        properties
    };
}

/**
 * Helper function to update the store elements
 * @param {Object} storeElements element map with guid as key and element as value
 * @param {Object} newElements new element to be added in the store elements
 * @returns {Object} updated store elements map
 */
function updateStoreElements(storeElements = {}, newElements = {}) {
    return Object.assign({}, storeElements, newElements);
}

/**
 * Helper function to update the connectors
 * @param {Array} storeConnectors array of connectors
 * @param {Array} newConnectors array of new connectors to be added
 * @returns {Array} new array of updated connectors
 */
function updateStoreConnectors(storeConnectors = [], newConnectors = []) {
    return [...storeConnectors, ...newConnectors];
}


/**
 * Helper function to loop over storeElements and create devnameToGuid map and canvasElementsGuids array.
 * @param {Object} elements element map with guid as key and element as value
 * @returns {Object} Object containing nameToGuid map and CanvasElementGuids array
 */
function updateCanvasElementGuidsAndNameToGuidMap(elements = {}) {
    const elementGuids = Object.keys(elements), nameToGuid = {};
    let canvasElementGuids = [];
    for (let j = 0; j < elementGuids.length; j++) {
        const element = elements[elementGuids[j]];
        if (element.elementType !== ELEMENT_TYPE.START_ELEMENT) {
            const devname = element.name.toLowerCase();
            nameToGuid[devname] = element.guid;
        }
        // Construct arrays of all canvas element and variable guids
        if (element.isCanvasElement) {
            canvasElementGuids = [...canvasElementGuids, element.guid];
        }
    }
    return {
        nameToGuid,
        canvasElementGuids
    };
}

/**
 * Helper function to loop over all the flow metadata elements and convert them to client side shape
 * @param {Object} metadata flow metadata
 * @returns {Object} Object containing updated storeConnectors and storeElements
 */
function createElementsUsingFlowMetadata(metadata) {
    let storeElements, storeConnectors;
    const metadataKeyToFlowToUiFunctionMap = getMetadataKeyToFlowToUiFunctionMap();
    const metadataKeyList = Object.values(METADATA_KEY);
    if (!metadataKeyList) {
        throw new Error('Metadata does not have corresponding element array');
    }
    for (let i = 0, metadataKeyListLen = metadataKeyList.length; i < metadataKeyListLen; i++) {
        const metadataKey = metadataKeyList[i];
        const metadataElementsList = metadata[metadataKey];
        for (let j = 0, metadataElementsListLen = metadataElementsList.length; j < metadataElementsListLen; j++) {
            const metadataElementsListItem = metadataElementsList[j];
            const { elements, connectors } = metadataKeyToFlowToUiFunctionMap[metadataKey](metadataElementsListItem);
            if (elements) {
                storeElements = updateStoreElements(storeElements, elements);
            }
            storeConnectors = updateStoreConnectors(storeConnectors, connectors);
        }
    }
    return {
        storeConnectors,
        storeElements
    };
}

/**
 * Helper function to create a map with key as metadataKey and value as flowToUi function
 * and ignore element type with metadataKey. Eg: flow properties, start etc
 * @returns {Object} map containing key as metadataKey and value as flowToUi function
 */
function getMetadataKeyToFlowToUiFunctionMap() {
    return Object.keys(elementTypeToConfigMap).reduce((acc, elementTypeKey) => {
        const { metadataKey, factory } = elementTypeToConfigMap[elementTypeKey];
        if (!metadataKey || !factory) {
            return acc;
        }
        const { flowToUi } = factory;
        return Object.assign(acc, {
            [metadataKey]: flowToUi
        });
    }, {});
}