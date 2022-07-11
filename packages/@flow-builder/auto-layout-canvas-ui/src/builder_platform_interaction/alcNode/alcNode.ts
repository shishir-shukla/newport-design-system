import {
    CanvasContext,
    getEnterKeyInteraction,
    ICON_SHAPE,
    importComponent,
    isCutMode,
    isDefaultMode,
    isMenuOpened,
    isReconnectionMode,
    scheduleTask
} from 'builder_platform_interaction/alcComponentsUtils';
import {
    AlcSelectDeselectNodeEvent,
    CloseMenuEvent,
    IncomingGoToStubClickEvent
} from 'builder_platform_interaction/alcEvents';
import AlcMenu from 'builder_platform_interaction/alcMenu';
import {
    getNodeMenuInfo,
    isElementCut,
    newMenuRenderedEvent,
    NodeMenuInfo
} from 'builder_platform_interaction/alcMenuUtils';
import {
    ConnectionSource,
    FlowModel,
    Guid,
    MenuType,
    NodeModel,
    NodeRenderInfo,
    NodeType
} from 'builder_platform_interaction/autoLayoutCanvas';
import { EditElementEvent, SelectNodeEvent } from 'builder_platform_interaction/events';
import {
    commonUtils,
    customIconUtils,
    keyboardInteractionUtils,
    lwcUtils
} from 'builder_platform_interaction/sharedUtils';
import { classSet } from 'lightning/utils';
import { api, LightningElement } from 'lwc';
import { LABELS } from './alcNodeLabels';

const { format } = commonUtils;
const { getCustomIconNameOrSrc } = customIconUtils;

const { withKeyboardInteractions } = keyboardInteractionUtils;

const selectors = {
    checkbox: '.selection-checkbox',
    menu: '.menu',
    menuTrigger: 'builder_platform_interaction-alc-menu-trigger',
    dynamicComponent: '.dynamic-component'
};

/**
 * Autolayout Canvas Node Component
 */
export default class AlcNode extends withKeyboardInteractions(LightningElement) {
    dom = lwcUtils.createDomProxy(this, selectors);

    getKeyboardInteractions() {
        return [getEnterKeyInteraction(() => this.handleSpaceOrEnter())];
    }

    _menu: NodeMenuInfo | null = null;
    _nodeInfo!: NodeRenderInfo;
    _canvasContext?: CanvasContext;

    isFocusTrapEnabled = false;

    // @ts-ignore
    private dynamicNodeConstructor: LightningElement | undefined;

    // @ts-ignore
    private dynamicNodeData: NodeModel;

    private dynamicNodeComp: string | undefined;

    private expanded = false;

    @api
    nodeAriaInfo;

    /**
     * The active element refers to the element currently being edited using the property editor panel
     */
    @api
    activeElementGuid;

    @api
    disableDeleteElements;

    @api
    disableEditElements;

    @api
    get nodeInfo() {
        return this._nodeInfo;
    }

    /**
     * For dynamic node components, call their dynamicNodeComponentSelector
     * with the node guid.  This guarantees that the data refreshes on any
     * change to the node.
     */
    set nodeInfo(nodeInfo: NodeRenderInfo) {
        this._nodeInfo = nodeInfo;

        if (nodeInfo && nodeInfo.metadata.dynamicNodeComponent) {
            if (nodeInfo.metadata.dynamicNodeComponentSelector) {
                this.dynamicNodeData = nodeInfo.metadata.dynamicNodeComponentSelector(nodeInfo.guid);
            }

            this.processDynamicNodeComponent(nodeInfo.metadata.dynamicNodeComponent);
        }
    }
    @api
    flowModel!: Readonly<FlowModel>;

    @api
    set canvasContext(canvasContext: CanvasContext) {
        this._canvasContext = canvasContext;

        if (this.isMenuOpened()) {
            this.menu = getNodeMenuInfo(this.canvasContext, this.flowModel, this.nodeInfo.metadata);
        } else {
            this.menu = null;
        }
    }

    get canvasContext() {
        return this._canvasContext!;
    }

    get menu(): NodeMenuInfo | null {
        return this._menu;
    }

    set menu(menu: NodeMenuInfo | null) {
        this._menu = menu;

        if (menu != null) {
            scheduleTask(() => this.postMenuRenderTask());
        } else {
            this.isFocusTrapEnabled = false;
        }
    }

    get labels() {
        return LABELS;
    }

    get isDefaultCanvasMode() {
        return isDefaultMode(this.canvasContext.mode);
    }

    get canvasMode() {
        return this.canvasContext.mode;
    }

    /**
     * The menu trigger variant for the node
     *
     * @returns the menu trigger variant
     */
    get menuTriggerVariant() {
        return MenuType.NODE;
    }

    get source(): ConnectionSource {
        return { guid: this._nodeInfo?.guid };
    }

    get elementMetadata() {
        return this.nodeInfo?.metadata;
    }

    getNode() {
        return this.flowModel[this.nodeInfo.guid];
    }

    get menuContainerClass() {
        return this.menu ? 'menu-container full-opacity' : 'menu-container';
    }

    get menuTriggerClass() {
        return this.nodeInfo.metadata.dynamicNodeComponent && !this.menu ? 'dynamic-node' : '';
    }

    isElementToBeCut() {
        return isElementCut(this.canvasMode, this.canvasContext.cutInfo?.guids ?? [], this.nodeInfo.guid);
    }

    get rotateIconClass() {
        if (this.nodeInfo.metadata.iconShape !== ICON_SHAPE.DIAMOND) {
            return '';
        }

        return this.isElementToBeCut()
            ? `rotated-icon-radius slds-icon-standard-decision cut-paste-node`
            : `rotated-icon-radius slds-icon-standard-decision`;
    }

    get svgClass() {
        if (this.iconSrc) {
            return `slds-icon_container slds-p-around_x-small custom-icon`;
        }

        return classSet({
            [this.nodeInfo.metadata.iconBackgroundColor]: this.nodeInfo.metadata.iconBackgroundColor,
            'slds-icon__container_circle': this.nodeInfo.metadata.iconShape === ICON_SHAPE.CIRCLE,
            'rotate-icon-svg': this.nodeInfo.metadata.iconShape === ICON_SHAPE.DIAMOND,
            'cut-paste-node': this.isElementToBeCut() && this.nodeInfo.metadata.iconShape !== ICON_SHAPE.DIAMOND
        });
    }

    get iconSize() {
        if (this.iconSrc) {
            return null;
        }
        return this.nodeInfo.metadata.iconSize || 'large';
    }

    get isStart() {
        return this.nodeInfo.metadata.type === NodeType.START;
    }

    get iconName() {
        const { iconName: customIconName } = getCustomIconNameOrSrc(
            this.getNode().actionName,
            this.canvasContext.customIconMap
        );
        return customIconName ? customIconName : this.nodeInfo.metadata.icon;
    }

    get iconSrc() {
        const { iconSrc } = getCustomIconNameOrSrc(this.getNode().actionName, this.canvasContext.customIconMap);
        return iconSrc ? iconSrc : null;
    }

    get showCheckboxInSelectionMode() {
        const { type } = this.nodeInfo.metadata;
        const { mode } = this.canvasContext;

        const isValidType =
            (isReconnectionMode(this.canvasContext.mode) && type === NodeType.END) ||
            ![NodeType.START, NodeType.END, NodeType.ROOT].includes(type);

        return !isDefaultMode(mode) && !isCutMode(mode) && isValidType;
    }

    get shouldDisableCheckbox() {
        const node = this.getNode();
        return node.config && !node.config.isSelectable;
    }

    get checkboxIconName() {
        const node = this.getNode();
        return node.config.isSelected ? 'utility:check' : 'utility:add';
    }

    get checkboxVariant() {
        const node = this.getNode();
        return node.config.isSelected ? 'brand' : 'border-filled';
    }

    get textContainerClasses() {
        const isMenuOpened = this.isMenuOpened();

        return classSet('slds-is-absolute text-container').add({
            shifted: this.isShifted,
            hidden: isMenuOpened,
            'slds-hide': isMenuOpened,
            'text-container_with-borders': this.isElementToBeCut()
        });
    }

    /**
     * Set the class for the icon container.
     * 2 classes exist for the highlight because of different icon size and multiple connectors linked to the icon.
     *
     * @returns String of classes for the icon container
     */
    get iconContainerClasses() {
        let vClassSet = classSet('icon-container').add({
            'menu-opened': this.isMenuOpened() || this.expanded
        });

        const node = this.getNode();
        if (node.config.isHighlighted) {
            vClassSet = vClassSet.add({
                'highlighted-container': true
            });
            if (this.isShifted) {
                vClassSet = vClassSet.add({
                    'highlighted-container-multioutput': true
                });
            }
        }

        return vClassSet.toString();
    }

    get dynamicNodeClasses() {
        return classSet(selectors.dynamicComponent.substring(1))
            .add({
                expanded: this.expanded
            })
            .add(this.dynamicNodeComp?.split('/')[1]);
    }

    get isShifted() {
        return (this.nodeInfo.flows || []).length > 0 || this.nodeInfo.faultFlow != null;
    }

    get nodeLabel() {
        let label = this.getNode().label;
        // Start has a dynamic label that is set in the metadata.
        if (!label && this.nodeInfo.metadata.type === NodeType.START) {
            label = this.nodeInfo.metadata.description;
        }
        return label;
    }

    get iconAriaLabel() {
        // Use description in metadata as label for element whose label is not set (start node for example)
        const node = this.getNode();
        const label = node.label ? node.label : this.nodeInfo.metadata.description;
        return format(this.labels.ariaLabelNode, this.nodeInfo.metadata.elementType, label);
    }

    get showElementType() {
        return this.nodeInfo.metadata.type !== NodeType.END;
    }

    get hasIncomingGoto() {
        const node = this.getNode();
        return node.incomingGoTo && node.incomingGoTo.length > 0;
    }

    get incomingGoToLabel() {
        const node = this.getNode();
        return format(this.labels.incomingGoToLabel, node.incomingGoTo!.length);
    }

    get nodeHasError() {
        const node = this.getNode();
        return node.config.hasError;
    }

    /** ***************************** Helper Functions */

    /**
     * Import the constructor and update the component params
     *
     * Note: all of this needs to happen in a single tick, otherwise the component
     * constructor and params could be out of sync (old constructor with new params
     * or new constructor with old params)
     *
     * @param comp dynamic node component
     */
    // eslint-disable-next-line @lwc/lwc/no-async-await
    async processDynamicNodeComponent(comp: string): Promise<void> {
        // TODD: include node attributeInfo

        if (comp) {
            this.dynamicNodeConstructor = await importComponent(comp);
            this.dynamicNodeComp = comp;
        }
    }

    /** ***************************** Public Functions */

    @api
    focus() {
        const element = !isDefaultMode(this.canvasContext.mode) ? this.dom.checkbox : this.dom.menuTrigger;
        element?.focus();
    }

    @api
    findNode(guid: Guid) {
        return this.dom.as<AlcNode>().dynamicComponent?.findNode(guid);
    }

    /** ***************************** Event Handlers */

    /**
     * Handles the edit element event and fires SelectNodeEvent
     *
     * When 'single click updates the store' is implemented in the future,
     * this.nodeInfo.config.isSelected inside the event can be read
     * by handlers at different levels to learn about the historical selection
     * status even after the store is updated
     *
     * @param event - clicked event coming from alcMenuTrigger.js
     */
    handleButtonClick(event: Event) {
        event.stopPropagation();

        const { type } = this.nodeInfo.metadata;
        if (isDefaultMode(this.canvasContext.mode) && type !== NodeType.END) {
            const node = this.getNode();
            const nodeSelectedEvent = new SelectNodeEvent(this.nodeInfo.guid, undefined, node.config.isSelected);
            this.dispatchEvent(nodeSelectedEvent);
        }
    }

    /**
     * Handles double click on the node and dispatches the EditElementEvent
     *
     * @param event - double click event fired on double clicking the node
     */
    handleOnDblClick(event: Event) {
        event.stopPropagation();
        const { type } = this.nodeInfo.metadata;
        if (type !== NodeType.START && type !== NodeType.END && isDefaultMode(this.canvasContext.mode)) {
            this.dispatchEvent(new EditElementEvent(this.nodeInfo.guid));
        }
    }

    /**
     * Closes the menu when it is empty
     */
    handleFocusOut() {
        // W-10712668: close the menu in the next tick if it's still there to
        // avoid the race condition where the focus out is the result of opening
        // a menu for some other node/connector
        scheduleTask(() => {
            if (this.isStart && this.getMenu()?.isEmpty()) {
                this.dispatchEvent(new CloseMenuEvent(false));
            }
        });
    }

    /**
     * Handles the click on the selection checkbox and dispatches an event to toggle
     * the selected state of the node.
     *
     * @param event - click event fired when clicking on the selection checkbox
     */
    handleSelectionCheckboxClick = (event: Event) => {
        event.stopPropagation();

        const node = this.getNode();
        const toggleNodeSelectionEvent = new AlcSelectDeselectNodeEvent(this.nodeInfo.guid, node.config.isSelected);
        this.dispatchEvent(toggleNodeSelectionEvent);
    };

    /**
     * Dispatches an event to highlight the associated incoming goto stubs
     */
    highlightIncomingStub = () => {
        const incomingStubClickEvent = new IncomingGoToStubClickEvent(this.nodeInfo.guid);
        this.dispatchEvent(incomingStubClickEvent);
    };

    /**
     * Handles the click on the incoming goTo stub
     *
     * @param event - click event fired when clicking on the incoming goTo stub
     */
    handleIncomingStubClick = (event: Event) => {
        // Need to preventDefault, else it appends extra text to the url
        event.preventDefault();
        event.stopPropagation();
        this.highlightIncomingStub();
    };

    /**
     * Handles Enter or Space keydown
     */
    handleSpaceOrEnter = () => {
        const currentItemInFocus = this.template.activeElement;
        if (currentItemInFocus?.classList.value.includes('text-incoming-goto')) {
            this.highlightIncomingStub();
        }
    };

    /**
     * Handles the toggling of the popover menu component.
     *
     * @param event - the event fired when popover toggled
     */
    handlePopoverToggled(event) {
        // TODO: this shouldn't be here, move to orchestrator node
        this.expanded = event.detail.opened;
    }

    private getMenu(): AlcMenu | undefined {
        return this.dom.as<AlcMenu>().menu;
    }

    /**
     * Task to run after rendering
     */
    postMenuRenderTask() {
        const menuElement = this.getMenu();
        if (menuElement != null) {
            if (menuElement.isEmpty()) {
                this.focus();
            } else {
                this.isFocusTrapEnabled = true;
            }

            this.dispatchEvent(newMenuRenderedEvent(menuElement));
        }
    }

    /**
     * Checks if the menu for this node is opened
     *
     * @returns true iff the menu for this node is opened
     */
    isMenuOpened() {
        return isMenuOpened(this.canvasContext, MenuType.NODE, { guid: this._nodeInfo?.guid });
    }
}
