import { recordUpdateReducer } from '../recordUpdateReducer';
import {
    AddRecordFilterEvent,
    AddRecordFieldAssignmentEvent,
    DeleteRecordFilterEvent,
    DeleteRecordFieldAssignmentEvent,
    PropertyChangedEvent,
    RecordStoreOptionChangedEvent,
    UpdateRecordFieldAssignmentEvent,
    UpdateRecordFilterEvent
} from 'builder_platform_interaction/events';
import { EXPRESSION_PROPERTY_TYPE } from 'builder_platform_interaction/expressionUtils';
import { CONDITION_LOGIC } from 'builder_platform_interaction/flowMetadata';

const recordUpdateUsingFieldsTemplate = () => {
    return {
        description: { value: '', error: null },
        elementType: 'RECORD_UPDATE',
        guid: 'RECORDUPDATE_2',
        isCanvasElement: true,
        label: { value: 'testRecordFields', error: null },
        locationX: 358,
        locationY: 227,
        name: { value: 'testRecordFields', error: null },
        useSobject: false,
        inputAssignments: [
            {
                leftHandSide: { value: 'Account.BillingCountry', error: null },
                rightHandSide: { value: 'myCountry', error: null },
                rightHandSideDataType: { value: 'String', error: null },
                rightHandSideGuid: { value: 'myCountry', error: null },
                rowIndex: '724cafc2-7744-4e46-8eaa-f2df29539d1d'
            }
        ],
        filters: [
            {
                leftHandSide: { value: 'Account.BillingAddress', error: null },
                operator: { value: 'EqualTo', error: null },
                rightHandSide: { value: 'my address', error: null },
                rightHandSideDataType: { value: 'String', error: null },
                rowIndex: 'RECORDUPDATEFILTERITEM_1'
            }
        ],
        filterLogic: { value: CONDITION_LOGIC.AND, error: null },
        object: { value: 'account', error: null }
    };
};

const recordUpdateUsingSobjectTemplate = () => {
    return {
        description: { value: '', error: null },
        elementType: 'RECORD_UPDATE',
        guid: 'RECORDUPDATE_2',
        isCanvasElement: true,
        label: { value: 'testRecordFields', error: null },
        locationX: 358,
        locationY: 227,
        name: { value: 'testRecordFields', error: null },
        useSobject: true,
        processMetadataValues: [],
        inputReference: { value: 'VARIABLE_6', error: null }
    };
};

describe('record-update-reducer using sObject', () => {
    let originalState;
    beforeEach(() => {
        originalState = recordUpdateUsingSobjectTemplate();
    });
    describe('update property action', () => {
        it('updates the inputReference property', () => {
            const propertyName = 'inputReference';
            const value = 'VARIABLE_33';
            const error = null;
            const propChangedEvent = new PropertyChangedEvent(
                propertyName,
                value,
                error,
                null,
                originalState.inputReference.value
            );
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordUpdateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.inputReference.value).toEqual('VARIABLE_33');
            expect(newState.inputReference.error).toBe(null);
        });
        it('fetch the error from the action instead of rerunning validation', () => {
            const propertyName = 'inputReference';
            const value = 'notValidSobject';
            const error = 'You have entered an invalid value.';
            const propChangedEvent = new PropertyChangedEvent(
                propertyName,
                value,
                error,
                null,
                originalState.inputReference.value
            );
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordUpdateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.inputReference.value).toEqual(value);
            expect(newState.inputReference.error).toBe(error);
        });
    });
    it('ignores unknown events', () => {
        const event = {
            type: 'unknown event',
            detail: {
                propertyName: 'label',
                value: 'newlabel',
                error: null
            }
        };
        const resultObj = recordUpdateReducer(originalState, event);
        expect(resultObj).toBe(originalState);
    });
});
describe('record-update-reducer using fields', () => {
    let originalState;
    beforeEach(() => {
        originalState = recordUpdateUsingFieldsTemplate();
    });
    describe('update property action', () => {
        it('updates the object property', () => {
            const propertyName = 'object';
            const value = 'USER';
            const error = null;
            const propChangedEvent = new PropertyChangedEvent(
                propertyName,
                value,
                error,
                null,
                originalState.object.value
            );
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordUpdateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.object.value).toEqual('USER');
            expect(newState.object.error).toBe(null);
        });
        it('not a valid Object : fetch the error from the action instead of rerunning validation', () => {
            const propertyName = 'object';
            const value = 'notValidSobject';
            const error = 'You have entered an invalid value.';
            const propChangedEvent = new PropertyChangedEvent(
                propertyName,
                value,
                error,
                null,
                originalState.object.value
            );
            propChangedEvent.detail.ignoreValidate = true;
            const newState = recordUpdateReducer(originalState, propChangedEvent);
            expect(newState).not.toBe(originalState);
            expect(newState.object.value).toEqual(value);
            expect(newState.object.error).toBe(error);
        });
    });
    describe('update filterLogic to no condition', () => {
        let newState;
        beforeAll(() => {
            const event = {
                type: PropertyChangedEvent.EVENT_NAME,
                detail: {
                    propertyName: 'filterLogic',
                    value: CONDITION_LOGIC.NO_CONDITIONS
                }
            };
            originalState.filters[0].leftHandSide.value = 'invalidValue';
            originalState.filters[0].leftHandSide.error = 'You have entered an invalid value';
            newState = recordUpdateReducer(originalState, event);
        });
        it('should update filterLogic', () => {
            expect(newState.filterLogic.value).toBe(CONDITION_LOGIC.NO_CONDITIONS);
            expect(newState).not.toBe(originalState);
        });
        it('should reset filter errors and value', () => {
            expect(newState.filters).toHaveLength(1);
            expect(newState.filters[0].leftHandSide.value).toBe('');
            expect(newState.filters[0].leftHandSide.error).toBeNull();
        });
    });
    describe('handle list item events', () => {
        it('add a filter item', () => {
            const event = {
                type: AddRecordFilterEvent.EVENT_NAME
            };
            const newState = recordUpdateReducer(originalState, event);
            expect(newState.filters).toHaveLength(2);
            expect(newState).not.toBe(originalState);
        });
        it('delete a filter item', () => {
            const event = {
                type: DeleteRecordFilterEvent.EVENT_NAME,
                detail: {
                    index: 0
                }
            };
            const newState = recordUpdateReducer(originalState, event);
            expect(newState.filters).toHaveLength(0);
            expect(newState).not.toBe(originalState);
        });

        it('update the left hand side of a filter item', () => {
            const event = {
                type: UpdateRecordFilterEvent.EVENT_NAME,
                detail: {
                    index: 0,
                    value: {
                        [EXPRESSION_PROPERTY_TYPE.LEFT_HAND_SIDE]: {
                            value: 'Account.Description',
                            error: null
                        }
                    }
                }
            };
            const newState = recordUpdateReducer(originalState, event);
            expect(newState.filters).toHaveLength(1);
            expect(newState.filters[0].leftHandSide.value).toBe('Account.Description');
            expect(newState).not.toBe(originalState);
        });
        it('add an assignment item', () => {
            const event = {
                type: AddRecordFieldAssignmentEvent.EVENT_NAME
            };
            const newState = recordUpdateReducer(originalState, event);
            expect(newState.inputAssignments).toHaveLength(2);
            expect(newState).not.toBe(originalState);
        });
        it('delete an assignment item', () => {
            const event = {
                type: DeleteRecordFieldAssignmentEvent.EVENT_NAME,
                detail: {
                    index: 0
                }
            };
            const newState = recordUpdateReducer(originalState, event);
            expect(newState.inputAssignments).toHaveLength(0);
            expect(newState).not.toBe(originalState);
        });
        it('update the left hand side of an assignment item', () => {
            const event = {
                type: UpdateRecordFieldAssignmentEvent.EVENT_NAME,
                detail: {
                    index: 0,
                    value: {
                        [EXPRESSION_PROPERTY_TYPE.LEFT_HAND_SIDE]: {
                            value: 'Account.Description',
                            error: null
                        }
                    }
                }
            };
            const newState = recordUpdateReducer(originalState, event);
            expect(newState.inputAssignments).toHaveLength(1);
            expect(newState.inputAssignments[0].leftHandSide.value).toBe('Account.Description');
            expect(newState).not.toBe(originalState);
        });
    });
    describe('handle property changed event', () => {
        describe('update getFirstRecord from false to true', () => {
            let newState;
            beforeAll(() => {
                originalState = recordUpdateUsingFieldsTemplate();
                const recordStoreOptionChangedEvent = new RecordStoreOptionChangedEvent(true, '', false);
                newState = recordUpdateReducer(originalState, recordStoreOptionChangedEvent);
            });
            it('should reset object', () => {
                expect(newState.object.value).toBe('');
            });
            it('should reset filters', () => {
                expect(newState.filters).toHaveLength(1);
                expect(newState.filters[0].leftHandSide.value).toBe('');
            });
            it('should reset inputAssignments', () => {
                expect(newState.inputAssignments).toHaveLength(1);
                expect(newState.inputAssignments[0].leftHandSide.value).toBe('');
            });
        });
        describe('update getFirstRecord from true to false', () => {
            let newState;
            beforeAll(() => {
                originalState = recordUpdateUsingSobjectTemplate();
                const recordStoreOptionChangedEvent = new RecordStoreOptionChangedEvent(false, '', false);
                newState = recordUpdateReducer(originalState, recordStoreOptionChangedEvent);
            });
            it('should reset inputReference', () => {
                expect(newState.inputReference.value).toBe('');
            });
        });
    });
});
