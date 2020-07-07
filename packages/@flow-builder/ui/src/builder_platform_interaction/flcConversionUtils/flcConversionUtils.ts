// @ts-nocheck
import {
    ElementType,
    linkBranchOrFault,
    addElementToState,
    linkElement,
    FAULT_INDEX,
    calculateFlowLayout,
    getDefaultLayoutConfig,
    FlowRenderContext
} from 'builder_platform_interaction/autoLayoutCanvas';
import { ELEMENT_TYPE, CONNECTOR_TYPE } from 'builder_platform_interaction/flowMetadata';
import { createEndElement, createConnector } from 'builder_platform_interaction/elementFactory';
import { getConfigForElementType } from 'builder_platform_interaction/elementConfig';
import { supportsChildren, flcExtraProps } from 'builder_platform_interaction/flcBuilderUtils';

// TODO: FLC Hack: Temp magic number to identify an flc flow
const LOCATION_Y_FLC_FLOW = 500;

// TODO: FLC Hack: Magic number to support identifying merge elements
const LOCATION_X_MERGE_MARKER = 666;

export function isFixedLayoutCanvas(startElement) {
    return startElement.locationY === LOCATION_Y_FLC_FLOW;
}

/**
 * @return true if an elementType is root or end
 */
function isRootOrEndElement({ elementType }) {
    return elementType === ELEMENT_TYPE.END_ELEMENT || elementType === ELEMENT_TYPE.ROOT_ELEMENT;
}

function getChildReferencesKey(parentElement) {
    return getConfigForElementType(parentElement.elementType).childReferenceKey;
}

function createConnectorHelper({ source, childSource, target, label = '', type = CONNECTOR_TYPE.REGULAR }) {
    return createConnector(source, childSource, target, label, type);
}

/**
 * Find the childSource at a given index for a parentElement
 * @param {Object} parentElement
 * @param {number} index
 */
function findChildSource(parentElement, index) {
    const { singular, plural } = getChildReferencesKey(parentElement);
    return parentElement[plural][index - 1][singular];
}

/**
 * Find the index for a childSource guid
 * @param {Object} element
 * @param {*} guid
 */
function findConnectionIndex(parentElement, guid) {
    const { singular, plural } = getChildReferencesKey(parentElement);
    const index = parentElement[plural].findIndex(entry => entry[singular] === guid);

    return index === -1 ? 0 : index + 1;
}

function createElementHelper(elementType, guid) {
    return {
        elementType,
        guid,
        label: elementType,
        value: elementType,
        text: elementType,
        name: elementType,
        prev: null,
        next: null
    };
}

/**
 * Creates a root element and links it with the start element
 * @param {string} startElementGuid
 */
export const createRootElement = (startElementGuid = null) => {
    return {
        ...createElementHelper(ELEMENT_TYPE.ROOT_ELEMENT, ElementType.ROOT),
        children: [startElementGuid]
    };
};

/**
 * Adds a nulled children array to a parentElement
 * @param {Object} element
 */
export function initializeChildren(element) {
    const { elementType } = element;
    const elementConfig = getConfigForElementType(elementType);

    let childCount;

    if (elementType === ELEMENT_TYPE.LOOP) {
        childCount = 1;
    } else {
        childCount = element.maxConnections - (elementConfig.canHaveFaultConnector ? 1 : 0);
    }
    const children = element.children || [];
    const childCountDiff = childCount - children.length;

    if (childCountDiff > 0) {
        for (let i = 0; i < childCountDiff; i++) {
            children.push(null);
        }
    }

    element.children = children;
}

/**
 * Find the start element
 * @param {Object} elements - map of guid -> element
 * @return the start element
 */
export function findStartElement(elements) {
    return Object.values(elements).find(ele => ele.elementType === ELEMENT_TYPE.START_ELEMENT);
}

export function canConvertToFlc(startGuid, connectors) {
    const elementsMap = {};
    const startElement = (elementsMap[startGuid] = { guid: startGuid, next: [], prev: [], dominator: null });

    connectors.forEach(connector => {
        const { source, target } = connector;

        const sourceNode = (elementsMap[source] = elementsMap[source] || { guid: source, next: [], prev: [] });
        if (target != null) {
            const targetNode = (elementsMap[target] = elementsMap[target] || { guid: target, next: [], prev: [] });

            sourceNode.next.push(targetNode.guid);
            targetNode.prev.push(sourceNode.guid);
        }
    });

    const res = markNodes(elementsMap, startElement, startGuid);

    return res;
}

// todo orphan nodes
function markNodes(elementsMap, element, dominator) {
    const { prev, next } = element;

    if (prev.length > 1 || next.length > 1) {
        dominator = element.guid;
    }

    let isValid = true;

    for (let i = 0; i < next.length; i++) {
        const child = elementsMap[next[i]];
        const childDominator = child.dominator;

        if (childDominator == null) {
            child.dominator = dominator;
            if (!markNodes(elementsMap, child, dominator)) {
                isValid = false;
                break;
            }
        } else if (childDominator !== dominator) {
            isValid = false;
            break;
        }
    }

    return isValid;
}

/**
 * Converts an FFC ui model to a FLC ui model by augmenting the FFC ui model
 * with the extra properties needed by the FLC ui model
 * @param {Object} ffcUiModel - an ffc ui model
 * @return a flc ui model
 */
export function convertToFlc(ffcUiModel) {
    const { connectors, elements } = ffcUiModel;

    connectors.forEach(connector => {
        const { source, target, childSource, type } = connector;
        const sourceElement = elements[source];
        const targetElement = elements[target];

        if (type === CONNECTOR_TYPE.FAULT) {
            linkBranchOrFault(elements, sourceElement, FAULT_INDEX, targetElement);
        } else if (supportsChildren(sourceElement) && !isMergeElement(targetElement)) {
            initializeChildren(sourceElement);
            const childIndex = findConnectionIndex(sourceElement, childSource);
            linkBranchOrFault(elements, sourceElement, childIndex, targetElement);
        } else {
            targetElement.prev = source;
            sourceElement.next = target;
        }
    });

    const startElement = findStartElement(elements);
    const rootElement = createRootElement();
    addElementToState(rootElement, elements);
    linkBranchOrFault(elements, rootElement, 0, startElement);
    fixFlcProperties(ffcUiModel, startElement, rootElement);

    return { elements, canvasElements: [], connectors: [] };
}

/**
 * Creates the connectors for the a parent's children elements until they merge back
 * @return whether any connector was created
 */
function createConnectorsForChildren(newElements, newConnectors, newCanvasElements, parentElement) {
    let createdConnector = false;

    const { children } = parentElement;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];

        if (child) {
            const nextElement = newElements[child];

            // create the connector to the head of the branch
            if (nextElement && nextElement.elementType !== ELEMENT_TYPE.END_ELEMENT) {
                let type, childSource;

                if (i === 0) {
                    type = CONNECTOR_TYPE.DEFAULT;
                    childSource = null;
                } else {
                    type = CONNECTOR_TYPE.REGULAR;
                    childSource = findChildSource(parentElement, i);
                }
                const source = parentElement.guid;
                const target = nextElement.guid;
                const label = '';

                newConnectors.push(createConnectorHelper({ source, childSource, target, label, type }));
                createdConnector = true;
            }
        }

        // branch connectors for the child's successors until they merge back
        if (child != null) {
            convertFromFlcHelper(newElements, newConnectors, newCanvasElements, newElements[child], parentElement);
        }
    }

    return createdConnector;
}

// creates the connector for an element and its successors
function convertFromFlcHelper(newElements, newConnectors, newCanvasElements, element, parentElement) {
    let prevElement = null;
    let isChildless;

    while (element) {
        if (element.fault != null) {
            newConnectors.push(
                createConnectorHelper({
                    source: element.guid,
                    target: element.fault,
                    type: CONNECTOR_TYPE.FAULT
                })
            );

            convertFromFlcHelper(newElements, newConnectors, newCanvasElements, newElements[element.fault], element);

            delete element.fault;
        }

        if (element.elementType !== ELEMENT_TYPE.END_ELEMENT) {
            const newElement = { ...element };

            const elementSupportsChildren = supportsChildren(element);
            if (elementSupportsChildren) {
                // Creates the connectors for the children
                // If not connector was created (because no children), then we need to
                // create a connector for the parent to its next element
                isChildless = !createConnectorsForChildren(newElements, newConnectors, newCanvasElements, element);
            } else {
                isChildless = false;
            }

            const nextElement = newElements[element.next];
            if (nextElement) {
                if (nextElement.elementType !== ELEMENT_TYPE.END_ELEMENT) {
                    if (elementSupportsChildren) {
                        nextElement.locationX = LOCATION_X_MERGE_MARKER;
                    }

                    // create a connector to the next element for non-branching elements,
                    // or childless branching elements
                    if (!elementSupportsChildren || isChildless) {
                        newConnectors.push(
                            createConnectorHelper({
                                source: element.guid,
                                target: element.next,
                                type: isChildless ? CONNECTOR_TYPE.DEFAULT : CONNECTOR_TYPE.REGULAR
                            })
                        );
                    }
                }
            } else if (parentElement) {
                // we are on a branch and don't have a next element, this means the parentElement's next
                // is where the flow execution continues to, so create a connector
                if (parentElement.next && newElements[parentElement.next].elementType !== ELEMENT_TYPE.END_ELEMENT) {
                    newConnectors.push(
                        createConnectorHelper({
                            source: element.guid,
                            target: parentElement.next
                        })
                    );
                }
            }

            // delete extra flc properties
            flcExtraProps.forEach(prop => delete newElement[prop]);

            addElementToState(newElement, newElements);
            newCanvasElements.push(newElement.guid);
        }

        // the prevElement supports children, this means element is a merge element, so mark it so
        if (prevElement && supportsChildren(prevElement)) {
            element.locationX = LOCATION_X_MERGE_MARKER;
        }

        prevElement = element;
        element = newElements[element.next];
    }
}

/**
 * Converts an FLC ui model to a FFC ui model by striping the extra FLC ui model properties
 * @param {Object} uiModel - an FLC ui model
 * @return {Object} an FFC ui model
 */
export function convertFromFlc(uiModel, canvasWidth = null) {
    const { elements } = uiModel;

    const newConnectors = [];
    const newCanvasElements = [];

    // clone all elements
    let newElements = Object.values(elements).reduce((acc, element) => {
        acc[element.guid] = { ...element };
        return acc;
    }, {});

    const startElement = findStartElement(newElements);
    if (startElement) {
        if (canvasWidth) {
            calculateElementCoordinates(elements, newElements, startElement, canvasWidth / 2, 0, 0);
        }

        convertFromFlcHelper(newElements, newConnectors, newCanvasElements, startElement);

        // filter out root and end elements
        newElements = Object.values(newElements)
            .filter(element => !isRootOrEndElement(element))
            .reduce((acc, element) => {
                acc[element.guid] = element;
                return acc;
            }, {});
    }

    return { ...uiModel, elements: newElements, connectors: newConnectors, canvasElements: newCanvasElements };
}

function calculateElementCoordinates(flowModel, newElements, element, prevX, prevY, offsetX) {
    const nodeLayoutMap = getNodeLayoutMap(flowModel);
    while (element) {
        if (element.guid in nodeLayoutMap) {
            const { y } = nodeLayoutMap[element.guid].layout;
            element.locationX =
                element.elementType === ELEMENT_TYPE.START_ELEMENT ? prevX + offsetX - 125 : prevX + offsetX;
            element.locationY = prevY + y;
            if (element.children) {
                for (let i = 0; i < element.children.length; i++) {
                    const childOffsetX = nodeLayoutMap[element.guid + ':' + i].layout.x;
                    calculateElementCoordinates(
                        flowModel,
                        newElements,
                        newElements[element.children[i]],
                        element.locationX,
                        element.locationY,
                        childOffsetX
                    );
                }
            }
            if (element.fault) {
                const faultOffsetX = nodeLayoutMap[element.guid + ':-1'].layout.x;
                calculateElementCoordinates(
                    flowModel,
                    newElements,
                    newElements[element.fault],
                    element.locationX,
                    element.locationY,
                    faultOffsetX
                );
            }
            element = newElements[element.next];
        }
    }
}

function getNodeLayoutMap(flowModel) {
    const flowRenderContext = createInitialFlowRenderContext(flowModel);
    calculateFlowLayout(flowRenderContext);
    return flowRenderContext.nodeLayoutMap;
}

function createInitialFlowRenderContext(flowModel): FlowRenderContext {
    return {
        flowModel,
        nodeLayoutMap: {},
        interactionState: {},
        elementsMetadata: {},
        layoutConfig: { ...getDefaultLayoutConfig() },
        isDeletingBranch: false
    } as FlowRenderContext;
}

function isMergeElement(element) {
    return element && element.locationX === LOCATION_X_MERGE_MARKER;
}

function fixFlcPropertiesHelper(storeState, element, visited) {
    const { elements } = storeState;
    if (element.fault) {
        fixFlcProperties(storeState, elements[element.fault], element, visited);
        return;
    }

    initializeChildren(element);
    element.children.forEach(child => fixFlcProperties(storeState, elements[child], element, visited));
    const nextElement = elements[element.next];
    if (isMergeElement(nextElement)) {
        // clear merge marker now that the branch element has its next pointer computed
        nextElement.locationX = 0;
    }
}

// creates END elements and fixes merging branches pointers
function fixFlcProperties(storeState, element, parentElement, visited = {}) {
    const { elements } = storeState;
    let prevElement;
    const firstElement = element;

    // check that we have an element and it hasn't been visited
    while (element && !visited[element.guid]) {
        visited[element.guid] = true;

        // clear any magic numbers
        Object.assign(element, { locationX: 0, locationY: 0 });

        if (supportsChildren(element) || element.fault != null) {
            fixFlcPropertiesHelper(storeState, element, visited);
        }

        prevElement = element;
        element = elements[element.next];
        if (isMergeElement(element)) {
            // if we hit a merge marker, and have a parentElement, that means that prevElement is the last element of a branch
            if (parentElement) {
                prevElement.next = null;
                parentElement.next = element.guid;
                linkElement(elements, parentElement);

                // terminate the loop since we just hit the last branch element
                element = null;
            }
        } else if (!element) {
            const endElement = createEndElement({ prev: prevElement.guid });
            linkElement(elements, endElement);

            // mark the branch as having an end element
            firstElement.isTerminal = true;
        }
    }
}

/**
 * Stringify Store State for debugging
 * @param {Object} storeState
 */
export function prettyPrintStoreState(storeState) {
    if (storeState) {
        const { elements, canvasElements, connectors } = storeState;

        // eslint-disable-next-line
        console.log(JSON.parse(JSON.stringify({ elements, connectors, canvasElements })));

        let res = (canvasElements || []).map(guid => {
            const { next, prev, children, parent, childIndex, elementType } = elements[guid];
            const label = elements[guid].label || guid;
            let nextLabel = next ? elements[next] : null;
            let prevLabel = prev ? elements[prev] : null;
            let parentLabel = parent ? elements[parent] : null;

            nextLabel = nextLabel ? nextLabel.label || nextLabel.guid : next;
            prevLabel = prevLabel ? prevLabel.label || prevLabel.guid : prev;
            parentLabel = parentLabel ? parentLabel.label || parentLabel.guid : parent;

            return `${label}: guid: ${guid} elementType: ${elementType} next: ${nextLabel}, prev: ${prevLabel}, children: ${children}, parent: ${parentLabel}, childIndex: ${childIndex}`;
        });

        res = res.concat(
            (connectors || []).map(
                ({ source, target }) => `source: ${elements[source].label}, target: ${elements[target].label}`
            )
        );

        // eslint-disable-next-line
        console.log(res.join('\n'));
    }
}
