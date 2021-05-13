// @ts-nocheck
import { ELEMENT_TYPE, CONNECTOR_TYPE } from 'builder_platform_interaction/flowMetadata';
import { generateGuid } from 'builder_platform_interaction/storeLib';
import { LABELS } from './connectorUtilsLabels';

/**
 * Helper method to get the minimum and maximum x and y coordinates of the flow
 * @param {Object} locations         Contains the minimum and maximum x and y coordinates of the flow
 * @param {Object} item              A given canvas element
 */
export const getFlowLocations = (locations, item) => {
    if (locations.minX === undefined || item.locationX < locations.minX) {
        locations.minX = item.locationX;
    }

    if (locations.minY === undefined || item.locationY < locations.minY) {
        locations.minY = item.locationY;
    }

    if (locations.maxX === undefined || item.locationX > locations.maxX) {
        locations.maxX = item.locationX;
    }

    if (locations.maxY === undefined || item.locationY > locations.maxY) {
        locations.maxY = item.locationY;
    }
};

/**
 * Method to get the width and height along with the minimum and maximum x and y coordinates of the entire flow
 * @param {Array} canvasElements      Canvas Elements
 * @return {Object} flowBounds        Contains flow bounds and flowWidth and flowHeight
 */
export const getFlowBounds = (canvasElements) => {
    // Getting the minimum and maximum coordinates of the flow along with flow width and height
    const flowBounds = {};

    canvasElements.forEach((element) => {
        getFlowLocations(flowBounds, element);
    });

    // Spacing to add for icon width and height to get the correct flow width and height
    const CANVAS_ELEMENT_WIDTH_SPACING = 48;
    const CANVAS_ELEMENT_HEIGHT_SPACING = 96;

    // Calculating width and height of the entire flow
    flowBounds.flowWidth = flowBounds.maxX + CANVAS_ELEMENT_WIDTH_SPACING - flowBounds.minX;
    flowBounds.flowHeight = flowBounds.maxY + CANVAS_ELEMENT_HEIGHT_SPACING - flowBounds.minY;

    flowBounds.flowCenterX = flowBounds.minX + flowBounds.flowWidth / 2;
    flowBounds.flowCenterY = flowBounds.minY + flowBounds.flowHeight / 2;

    return flowBounds;
};

/**
 * Method to create a connector object in the shape required by the store
 *
 * @param {String} source           guid of the source canvas element
 * @param {String} childSource      (optional) guid of the child element, if one exists, that the connector is associated with (ex. outcomes and wait events)
 * @param {String} target           guid of the target canvas element
 * @param {String} label            (optional) label of the connector if one exists (ex. on default connectors)
 * @param {String} type             type of the connector (ex. fault or default)
 *
 * @returns {Object} connector       connector object
 */
export const createConnectorObject = (
    source: Guid,
    childSource?: Guid,
    target: Guid,
    label: string,
    type: UI.ConnectorType,
    isGoTo?: boolean
): UI.Connector => {
    const guid = generateGuid();
    const connector = {
        guid,
        source,
        childSource, // Tracks the guid of the child element that this connector is associated with (like an outcome or wait event)
        target,
        label,
        type,
        config: {
            isSelected: false
        }
    };

    if (isGoTo) {
        connector.isGoTo = true;
    }

    return connector;
};

/**
 * Method to remove connectors from list of available connections
 *
 * @param {Array} availableConnections      available connections
 * @param {String} connectors               connectors to remove from list of available connections
 *
 * @returns {Array} availableConnections    updated list of available connections
 */
export const removeFromAvailableConnections = (availableConnections, connectors = []) => {
    availableConnections = availableConnections.filter((connection) => {
        let removeConnection = false;
        for (let i = 0; i < connectors.length; i++) {
            // Remove from the list of available connections if the connection type matches the connector type,
            // OR if the connection is for a child reference (example, outcomes) and the child reference matches the connector child source
            if (
                connection.type === connectors[i].type &&
                (!connection.childReference || connection.childReference === connectors[i].childSource)
            ) {
                removeConnection = true;
                break;
            }
        }
        return !removeConnection;
    });

    return availableConnections;
};

/**
 * Helper method to sort the combobox options based on the source element. This method is only used when we need to
 * open the connector-picker.
 *
 * @param {Object} sourceElement - Source element of the connector
 * @param {Object[]} comboboxOptions - Available connections in the shape needed by the combobox
 * @return {Object[]} sortedComboboxOptions - Combobox options sorted in the required order
 */
export const sortConnectorPickerComboboxOptions = (sourceElement, comboboxOptions) => {
    const sortedComboboxOptions = [];
    if (sourceElement.elementType === ELEMENT_TYPE.LOOP) {
        // Connector-picker for loop pops up only when both LOOP_NEXT and LOOP_END are unused. Therefore, we simply
        // push loopNextComboboxOption and loopEndComboboxOption in that order in sortedComboboxOptions
        const loopNextComboboxOption = {
            label: LABELS.loopNextComboBoxOption,
            value: CONNECTOR_TYPE.LOOP_NEXT
        };

        const loopEndComboboxOption = {
            label: LABELS.loopEndComboBoxOption,
            value: CONNECTOR_TYPE.LOOP_END
        };

        sortedComboboxOptions.push(loopNextComboboxOption, loopEndComboboxOption);
    } else if (
        sourceElement.elementType === ELEMENT_TYPE.DECISION ||
        sourceElement.elementType === ELEMENT_TYPE.START_ELEMENT
    ) {
        // Iterating over outcomeReferences and sorting the comboboxOptions in the same order. For default outcome we
        // push it at the end if the option exists in comboboxOptions, for start we push it at the front
        const defaultOutcomeComboboxOption = {};
        for (let i = 0; i < sourceElement.childReferences.length; i++) {
            comboboxOptions.map((option) => {
                if (option.value === sourceElement.childReferences[i].childReference) {
                    sortedComboboxOptions.push(option);
                } else if (
                    (option.value === CONNECTOR_TYPE.DEFAULT ||
                        option.value === CONNECTOR_TYPE.IMMEDIATE ||
                        option.value === CONNECTOR_TYPE.REGULAR) &&
                    Object.keys(defaultOutcomeComboboxOption).length === 0
                ) {
                    // Adding the Regular connector type check for start element
                    // that contains scheduled paths but doesn't support it
                    defaultOutcomeComboboxOption.label = option.label;
                    defaultOutcomeComboboxOption.value = option.value;
                }
                return option;
            });
        }

        if (Object.keys(defaultOutcomeComboboxOption).length === 2) {
            if (sourceElement.elementType === ELEMENT_TYPE.START_ELEMENT) {
                sortedComboboxOptions.unshift(defaultOutcomeComboboxOption);
            } else {
                sortedComboboxOptions.push(defaultOutcomeComboboxOption);
            }
            // sortedComboboxOptions.push(defaultOutcomeComboboxOption);
        }
        // TODO: Refactor this when the connector utils are refactored:
        // W-5478126 https://gus.lightning.force.com/lightning/r/ADM_Work__c/a07B0000005ajm1IAA/view
    } else if (sourceElement.elementType === ELEMENT_TYPE.WAIT) {
        // Iterating over wait events and sorting the comboboxOptions in the same order.
        // Default path will be second to last in comboboxOptions
        // FAULT is pushed at the end in comboboxOptions
        const defaultPathComboboxOption = {};
        const faultComboboxOption = {};
        for (let i = 0; i < sourceElement.childReferences.length; i++) {
            comboboxOptions.forEach((option) => {
                if (option.value === sourceElement.childReferences[i].childReference) {
                    sortedComboboxOptions.push(option);
                } else if (
                    option.value === CONNECTOR_TYPE.DEFAULT &&
                    Object.keys(defaultPathComboboxOption).length === 0
                ) {
                    defaultPathComboboxOption.label = option.label;
                    defaultPathComboboxOption.value = option.value;
                } else if (option.value === CONNECTOR_TYPE.FAULT && Object.keys(faultComboboxOption).length === 0) {
                    faultComboboxOption.label = option.label;
                    faultComboboxOption.value = option.value;
                }
                return option;
            });
        }

        if (Object.keys(defaultPathComboboxOption).length === 2) {
            sortedComboboxOptions.push(defaultPathComboboxOption);
        }

        if (Object.keys(faultComboboxOption).length === 2) {
            sortedComboboxOptions.push(faultComboboxOption);
        }
    }

    return sortedComboboxOptions;
};

/**
 * Method to get the connector label and value used for building combobox options
 *
 * @param {object} elements - State of elements in the store
 * @param {object} sourceElement - Source element of the connector
 * @param {string} childReference - GUID of the child reference
 * @param {string} availableConnectionType - Type of the available connection
 * @return {object} - The connector label and value
 */
export const getLabelAndValueForConnectorPickerOptions = (
    elements,
    sourceElement,
    childReference,
    availableConnectionType
) => {
    let label, value;

    value = availableConnectionType;

    if (childReference) {
        label = elements[childReference].label;
        value = childReference;
    } else if (availableConnectionType === CONNECTOR_TYPE.DEFAULT) {
        label = sourceElement.defaultConnectorLabel;
    } else if (availableConnectionType === CONNECTOR_TYPE.FAULT) {
        label = LABELS.faultConnectorLabel;
    } else if (availableConnectionType === CONNECTOR_TYPE.LOOP_NEXT) {
        label = LABELS.loopNextComboBoxOption;
    } else if (availableConnectionType === CONNECTOR_TYPE.LOOP_END) {
        label = LABELS.loopEndComboBoxOption;
    } else if (
        availableConnectionType === CONNECTOR_TYPE.IMMEDIATE ||
        availableConnectionType === CONNECTOR_TYPE.REGULAR
    ) {
        // Adding the Regular connector type check for start element
        // that contains scheduled paths but doesn't support it.
        // The combobox label for the same will still read "Immediate"
        label = LABELS.immediateConnectorLabel;
    }

    return {
        label,
        value
    };
};

/**
 * // TODO: Refactor this code to make it more generic W-5478126
 * Creates the new connector object
 *
 * @param elements - Current state of elements in the store
 * @param sourceGuid - Contains the source guid
 * @param targetGuid - Contains the target guid
 * @param valueFromCombobox - The selected value in the connector-picker
 * @return A new connector object
 */
export const createNewConnector = (
    elements: UI.Elements,
    sourceGuid: UI.Guid,
    targetGuid: UI.Guid,
    valueFromCombobox: string,
    isGoTo?: boolean
): UI.Connector => {
    let type = valueFromCombobox,
        label,
        childSource;

    if (valueFromCombobox === CONNECTOR_TYPE.REGULAR) {
        label = null;
    } else if (valueFromCombobox === CONNECTOR_TYPE.DEFAULT) {
        label = elements[sourceGuid].defaultConnectorLabel;
    } else if (valueFromCombobox === CONNECTOR_TYPE.FAULT) {
        label = LABELS.faultConnectorLabel;
    } else if (valueFromCombobox === CONNECTOR_TYPE.LOOP_NEXT) {
        label = LABELS.loopNextConnectorLabel;
    } else if (valueFromCombobox === CONNECTOR_TYPE.LOOP_END) {
        label = LABELS.loopEndConnectorLabel;
    } else if (valueFromCombobox === CONNECTOR_TYPE.IMMEDIATE) {
        label = LABELS.immediateConnectorLabel;
    } else {
        type = CONNECTOR_TYPE.REGULAR;
        label = elements[valueFromCombobox].label;
        childSource = valueFromCombobox;
    }

    return createConnectorObject(sourceGuid, childSource, targetGuid, label, type, isGoTo);
};

export function createEndConnector(elements: UI.Elements, sourceElement: UI.CanvasElement, type: UI.ConnectorType) {
    return createNewConnector(elements, sourceElement.guid, generateGuid(), type);
}
