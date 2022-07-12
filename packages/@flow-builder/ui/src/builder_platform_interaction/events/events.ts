/*
 * export all custom event classes
 */

export { ActionsLoadedEvent } from './actionsLoadedEvent';
export { AddConditionEvent } from './addConditionEvent';
export { AddListItemEvent } from './addListItemEvent';
export { AddNodeEvent } from './addNodeEvent';
export { AddRecordFieldAssignmentEvent } from './addRecordFieldAssignmentEvent';
export { AddRecordFilterEvent } from './addRecordFilterEvent';
export { AddRecordLookupFieldEvent } from './addRecordLookupFieldEvent';
export { AddSortOptionItemEvent } from './addSortOptionItemEvent';
export { ArrowKeyDownEvent } from './arrowKeyDownEvent';
export { CannotRetrieveActionsEvent } from './cannotRetrieveActionsEvent';
export { CannotRetrieveCalloutParametersEvent } from './cannotRetrieveCalloutParametersEvent';
export { CannotRetrieveTemplatesEvent } from './cannotRetrieveTemplatesEvent';
export { AddConnectionEvent } from './canvasEvents/addConnectionEvent';
export { CANVAS_EVENT, MARQUEE_ACTION, ZOOM_ACTION } from './canvasEvents/canvasEvents';
export { CanvasMouseUpEvent } from './canvasEvents/canvasMouseUpEvent';
export { ConnectorSelectedEvent } from './canvasEvents/connectorSelectedEvent';
export { CopySingleElementEvent } from './canvasEvents/copySingleElementEvent';
export { CutElementsEvent } from './canvasEvents/cutElementsEvent';
export { DragNodeEvent } from './canvasEvents/dragNodeEvent';
export { DragNodeStopEvent } from './canvasEvents/dragNodeStopEvent';
export { MarqueeSelectEvent } from './canvasEvents/marqueeSelectEvent';
export { NodeMouseDownEvent } from './canvasEvents/nodeMouseDownEvent';
export { SelectNodeEvent } from './canvasEvents/selectNodeEvent';
export { ToggleMarqueeOnEvent } from './canvasEvents/zoomPanelEvent/toggleMarqueeOnEvent';
export { ClickToZoomEvent } from './canvasEvents/zoomPanelEvent/zoomEvent';
export { ClosePropertyEditorEvent } from './closePropertyEditorEvent';
export { CollectionReferenceChangedEvent } from './collectionReferenceChangedEvent';
export { ComboboxStateChangedEvent } from './comboboxStateChangedEvent';
export { ConfigurationEditorChangeEvent } from './configurationEditorChangeEvent';
export { ConfigurationEditorPropertyDeleteEvent } from './configurationEditorPropertyDeleteEvent';
export { ConfigurationEditorTypeMappingChangeEvent } from './configurationEditorTypeMappingChangeEvent';
export { CreateEntryConditionsEvent } from './createEntryConditionsEvent';
export { DebugPanelFilterEvent } from './debugPanelEvents/debugPanelFilterEvent';
export { ResumeDebugFlowEvent } from './debugPanelEvents/resumeDebugFlowEvent';
export { DeleteAllConditionsEvent } from './deleteAllConditionsEvent';
export { DeleteConditionEvent } from './deleteConditionEvent';
export { DeleteListItemEvent } from './deleteListItemEvent';
export { DeleteOrchestrationActionEvent } from './deleteOrchestrationActionEvent';
export { DeleteOutcomeEvent } from './deleteOutcomeEvent';
export { DeleteParameterItemEvent } from './deleteParameterItemEvent';
export { DeleteRecordFieldAssignmentEvent } from './deleteRecordFieldAssignmentEvent';
export { DeleteRecordFilterEvent } from './deleteRecordFilterEvent';
export { DeleteRecordLookupFieldEvent } from './deleteRecordLookupFieldEvent';
export { DeleteResourceEvent } from './deleteResourceEvent';
export { DeleteScheduledPathEvent } from './deleteScheduledPathEvent';
export { DeleteSortOptionItemEvent } from './deleteSortOptionItemEvent';
export { DeleteWaitEventEvent } from './deleteWaitEventEvent';
export { DummyPreviewModeEvent } from './dummyPreviewModeEvent';
export { DynamicTypeMappingChangeEvent } from './dynamicTypeMappingChangeEvent';
export { EditListItemEvent } from './editListItemEvent';
export { EditMergeFieldPillEvent } from './editMergeFieldPillEvent';
export { AddElementEvent } from './elementEvents/addElementEvent';
export { AddNonCanvasElementEvent } from './elementEvents/addNonCanvasElementEvent';
export { DeleteElementEvent } from './elementEvents/deleteElementEvent';
export { EditElementEvent } from './elementEvents/editElementEvent';
export { ToggleElementEvent } from './elementEvents/toggleElementEvent';
export { ExecuteWhenOptionChangedEvent } from './executeWhenOptionChangedEvent';
export { FetchMenuDataEvent } from './fetchMenuDataEvent';
export { FilterMatchesEvent } from './filterMatchesEvent';
export { FormulaChangedEvent } from './formulaChangedEvent';
export { InputsOnNextNavToAssocScrnChangeEvent } from './inputsOnNextNavToAssocScrnChangeEvent';
export { ItemSelectedEvent } from './itemSelectedEvent';
export { LegalNoticeDismissedEvent } from './legalNoticeDismissedEvent';
export { ListItemInteractionEvent } from './listItemInteractionEvent';
export { LoopCollectionChangedEvent } from './loopCollectionChangedEvent';
export { ManuallyAssignVariablesChangedEvent } from './manuallyAssignVariablesChangedEvent';
export { NewResourceEvent } from './newResourceEvent';
export { NumberRecordToStoreChangedEvent } from './numberRecordToStoreChangedEvent';
export { OpenSubflowEvent } from './openSubflowEvent';
export { ORCHESTRATED_ACTION_CATEGORY } from './orchestratedActionCategory';
export { OrchestrationActionValueChangedEvent } from './orchestrationActionValueChangedEvent';
export { OrchestrationAssigneeChangedEvent } from './orchestrationAssigneeChangedEvent';
export { OrchestrationStageStepEditorValidateEvent } from './orchestrationStageStepEditorValidateEvent';
export { LocatorIconClickedEvent } from './paletteEvents/locatorIconClickedEvent';
export { PaletteItemChevronClickedEvent } from './paletteEvents/paletteItemChevronClickedEvent';
export { PaletteItemClickedEvent } from './paletteEvents/paletteItemClickedEvent';
export { PrepopulateMapItemsEvent } from './prepopulateMapItemsEvent';
export { ProcessTypeSelectedEvent } from './processTypeSelectedEvent';
export { PropertyChangedEvent } from './propertyChangedEvent';
export { PropertyEditorWarningEvent } from './propertyEditorWarningEvent';
export { RecordStoreOptionChangedEvent } from './recordStoreOptionChangedEvent';
export { RemoveMergeFieldPillEvent } from './removeMergeFieldPillEvent';
export { ReorderListEvent } from './reorderListEvent';
export { RepeatScheduleFrequencyChangedEvent } from './repeatScheduleFrequencyChangedEvent';
export { RequiresAsyncProcessingChangedEvent } from './requiresAsyncProcessingChangedEvent';
export { RichTextPlainTextSwitchChangedEvent } from './richTextPlainTextSwitchChangedEvent';
export { RowContentsChangedEvent } from './rowContentsChangedEvent';
export * from './screenEditorEvents';
export { SetPropertyEditorTitleEvent } from './setPropertyEditorTitleEvent';
export { ShowResourceDetailsEvent } from './showResourceDetailsEvent';
export { SObjectReferenceChangedEvent } from './sObjectReferenceChangedEvent';
export { TemplateChangedEvent } from './templateChangedEvent';
export { FlowTestClearRecordFormEvent } from './testEditorEvents/FlowTestClearRecordFormEvent';
export { FlowTestRecordSelectedEvent } from './testEditorEvents/flowTestRecordSelectedEvent';
export { UpdateTestAssertionEvent } from './testEditorEvents/UpdateTestAssertionEvent';
export { UpdateTestRecordDataEvent } from './testEditorEvents/UpdateTestRecordDataEvent';
export { TextChangedEvent } from './textChangedEvent';
export { AddToFlowTestEvent } from './toolbarEvents/addToFlowTestEvent';
export { CopyOnCanvasEvent } from './toolbarEvents/copyOnCanvasEvent';
export { DebugFlowEvent } from './toolbarEvents/debugFlowEvent';
export { DuplicateEvent } from './toolbarEvents/duplicateEvent';
export { EditFlowEvent } from './toolbarEvents/editFlowEvent';
export { EditFlowPropertiesEvent } from './toolbarEvents/editFlowPropertiesEvent';
export { EditTestEvent } from './toolbarEvents/editTestEvent';
export { NewDebugFlowEvent } from './toolbarEvents/newDebugFlowEvent';
export { RedoEvent } from './toolbarEvents/redoEvent';
export { RestartDebugFlowEvent } from './toolbarEvents/restartDebugFlowEvent';
export { RunFlowEvent } from './toolbarEvents/runFlowEvent';
export { SaveFlowEvent } from './toolbarEvents/saveFlowEvent';
export { ToggleCanvasModeEvent } from './toolbarEvents/toggleCanvasModeEvent';
export { ToggleFlowStatusEvent } from './toolbarEvents/toggleFlowStatusEvent';
export { ToggleLeftPanelEvent } from './toolbarEvents/toggleLeftPanelEvent';
export { ToggleSelectionModeEvent } from './toolbarEvents/toggleSelectionModeEvent';
export { ToolbarFocusOutEvent } from './toolbarEvents/toolbarFocusOutEvent';
export { UndoEvent } from './toolbarEvents/undoEvent';
export { ViewAllTestsEvent } from './toolbarEvents/viewAllTestsEvent';
export { UpdateCollectionProcessorEvent } from './updateCollectionProcessorEvent';
export { UpdateConditionEvent } from './updateConditionEvent';
export { UpdateConditionLogicEvent } from './updateConditionLogicEvent';
export { UpdateEntryExitCriteriaEvent } from './updateEntryExitCriteriaEvent';
export { UpdateListItemEvent } from './updateListItemEvent';
export { UpdateNodeEvent } from './updateNodeEvent';
export { UpdateParameterItemEvent } from './updateParameterItemEvent';
export { UpdateRecordFieldAssignmentEvent } from './updateRecordFieldAssignmentEvent';
export { UpdateRecordFilterEvent } from './updateRecordFilterEvent';
export { UpdateRecordLookupFieldEvent } from './updateRecordLookupFieldEvent';
export { UpdateRelatedRecordFieldsChangeEvent } from './updateRelatedRecordFieldsChangeEvent';
export { UpdateSortCollectionOutputEvent } from './updateSortCollectionOutputEvent';
export { UpdateSortOptionItemEvent } from './updateSortOptionItemEvent';
export { UpdateWaitEventEventTypeEvent } from './updateWaitEventEventTypeEvent';
export { ValidationRuleChangedEvent } from './validationRuleChangedEvent';
export { ValueChangedEvent } from './valueChangedEvent';
export { VariableAndFieldMappingChangedEvent } from './variableAndFieldMappingChangedEvent';
export { VisualPickerItemChangedEvent } from './visualPickerItemChangedEvent';
export { VisualPickerListChangedEvent } from './visualPickerListChangedEvent';
export { WaitEventAddParameterEvent } from './waitEventAddParameterEvent';
export { WaitEventDeleteParameterEvent } from './waitEventDeleteParameterEvent';
export { WaitEventParameterChangedEvent } from './waitEventParameterChangedEvent';
export { WaitEventPropertyChangedEvent } from './waitEventPropertyChangedEvent';

type EventOptions = {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
};

/**
 * Helper function to create Custom Events
 *
 * @param eventName - The event name
 * @param detail - The event payload
 * @param optionOverrides - The options to override
 * @returns a new CustomEvent instance
 */
export function newCustomEvent<T>(eventName: string, detail?: T, optionOverrides?: EventOptions) {
    const options = Object.assign(
        {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail
        },
        optionOverrides
    );
    return new CustomEvent<T>(eventName, options);
}
