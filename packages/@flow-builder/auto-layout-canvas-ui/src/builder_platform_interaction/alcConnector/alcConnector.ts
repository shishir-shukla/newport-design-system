import {
    AutoLayoutCanvasMode,
    CanvasContext,
    getCssStyle,
    getStyleFromGeometry
} from 'builder_platform_interaction/alcComponentsUtils';
import { OutgoingGoToStubClickEvent } from 'builder_platform_interaction/alcEvents';
import {
    ConnectorLabelType,
    ConnectorRenderInfo,
    getConnectionTarget,
    hasGoTo,
    NodeType,
    START_IMMEDIATE_INDEX
} from 'builder_platform_interaction/autoLayoutCanvas';
import { classSet } from 'lightning/utils';
import { api, LightningElement } from 'lwc';
import { LABELS } from './alcConnectorLabels';

/**
 * Auto layout Canvas Connector Component.
 */
export default class AlcConnector extends LightningElement {
    @api
    connectorInfo!: ConnectorRenderInfo;

    @api
    disableAddElements;

    @api
    connectorAriaInfo;

    @api
    flowModel;

    @api
    canvasContext!: CanvasContext;

    get labels() {
        return LABELS;
    }

    /**
     * Checks if add element button should be visible or not
     *
     * @returns - True if the add button need to be displayed
     */
    get showAddElementButton() {
        return (
            this.connectorInfo.addInfo &&
            this.canvasContext.mode === AutoLayoutCanvasMode.DEFAULT &&
            !this.disableAddElements
        );
    }

    /**
     * Gets the location for the add element button
     *
     * @returns The Menu Css
     */
    get menuTriggerStyle() {
        return getStyleFromGeometry({ y: this.connectorInfo.addInfo!.offsetY });
    }

    /**
     * Add the inverse variant to the button when the contextual menu is open
     *
     * @returns Icon variant
     */
    get addIconVariant() {
        const { addInfo } = this.connectorInfo;
        return addInfo && addInfo.menuOpened ? 'inverse' : '';
    }

    /**
     * Gets the info needed to render the connector svg
     *
     * @returns The SVG info
     */
    get svgInfo() {
        const { svgInfo } = this.connectorInfo;

        const { path, geometry } = svgInfo;

        return {
            width: geometry.w,
            height: geometry.h,
            style: getStyleFromGeometry(geometry),
            path
        };
    }

    get isGoToConnector() {
        return this.flowModel && hasGoTo(this.flowModel, this.connectorInfo.source);
    }

    /**
     * Gets the location for the goToTargetLabel using the end location of the goTo connector svg
     *
     * @returns The Goto CSS
     */
    get goToTargetLabelStyle() {
        const { svgInfo } = this.connectorInfo;
        return getCssStyle({
            left: svgInfo.endLocation.x + 5,
            top: svgInfo.endLocation.y - 10
        });
    }

    get goToTargetLabel() {
        return this.flowModel[getConnectionTarget(this.flowModel, this.connectorInfo.source)!].label;
    }

    // TODO: W-9025580 [Trust] Review how badge is displayed
    // based on if scheduled path is supported or not
    get hasConnectorBadge() {
        return this.connectorInfo.labelType !== ConnectorLabelType.NONE;
    }

    get connectorBadgeClass() {
        const labelType = this.connectorInfo.labelType;

        return classSet('connector-badge slds-align_absolute-center slds-badge').add({
            'fault-badge': labelType === ConnectorLabelType.FAULT,
            'connector-highlighted': this.connectorInfo.isHighlighted
        });
    }

    get goToTargetClass() {
        const target = getConnectionTarget(this.flowModel, this.connectorInfo.source);
        return classSet('slds-is-absolute go-to-info').add({
            'highlighted-container': target === this.canvasContext.incomingStubGuid
        });
    }

    getBranchLabel(source) {
        const { guid, childIndex } = source;
        const sourceNode = this.flowModel[guid];

        if (childIndex == null) {
            return sourceNode.defaultConnectorLabel;
        }

        const defaultIndex =
            sourceNode.nodeType === NodeType.START ? START_IMMEDIATE_INDEX : sourceNode.children.length - 1;
        return childIndex === defaultIndex
            ? sourceNode.defaultConnectorLabel
            : sourceNode.nodeType === NodeType.START
            ? this.flowModel[sourceNode.childReferences[childIndex - 1].childReference].label
            : this.flowModel[sourceNode.childReferences[childIndex].childReference].label;
    }

    get connectorBadgeLabel() {
        const labelType: ConnectorLabelType = this.connectorInfo.labelType;

        switch (labelType) {
            case ConnectorLabelType.LOOP_AFTER_LAST:
                return LABELS.afterLastBadgeLabel;
            case ConnectorLabelType.FAULT:
                return LABELS.faultConnectorBadgeLabel;
            case ConnectorLabelType.LOOP_FOR_EACH:
                return LABELS.forEachBadgeLabel;
            case ConnectorLabelType.BRANCH:
                return this.getBranchLabel(this.connectorInfo.source);
            default:
                return '';
        }
    }

    /**
     * Gets the class for the svg
     *
     * @returns The SVG classSet for connector
     */
    get svgClassName() {
        return classSet(this.connectorInfo.isFault ? 'fault' : this.connectorInfo.type).add({
            'connector-to-be-deleted': this.connectorInfo.toBeDeleted,
            'connector-highlighted': this.connectorInfo.isHighlighted
        });
    }

    get connectorLabelStyle() {
        return getStyleFromGeometry({ y: this.connectorInfo.labelOffsetY, x: this.connectorInfo.labelOffsetX });
    }

    /**
     * Handles the click on the outgoing goTo stub and dispatches an event to handle the same
     *
     * @param event - click event fired when clicking on the outgoing goTo stub
     */
    handleOutgoingStubClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        const outgoingStubClickEvent = new OutgoingGoToStubClickEvent(this.connectorInfo.source);
        this.dispatchEvent(outgoingStubClickEvent);
    };

    @api
    focus() {
        this.template.querySelector('builder_platform_interaction-alc-menu-trigger').focus();
    }
}
