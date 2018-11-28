import { createElement } from 'lwc';
import { variableConstantValidation } from '../variableConstantValidation';
import { variableConstantReducer } from '../variableConstantReducer';
import VariableConstantEditor from '../variableConstantEditor';
import * as mockStoreData from 'mock/storeData';
import { deepCopy } from 'builder_platform_interaction/storeLib';
import { createAction, PROPERTY_EDITOR_ACTION } from 'builder_platform_interaction/actions';

jest.mock('builder_platform_interaction/ferovResourcePicker', () => require('builder_platform_interaction_mocks/ferovResourcePicker'));

const setupComponentUnderTest = (props) => {
    const element = createElement('builder_platform_interaction-variable-constant-editor', {
        is: VariableConstantEditor,
    });
    element.node = props;
    document.body.appendChild(element);
    return element;
};

describe('variable/constant reducer', () => {
    const propertyName = 'description';
    const value = 'desc';
    const error = 'error';

    let variableConstantEditor;
    let stringVariable;
    let spy;
    let updateAction;
    let updatedEditor;

    beforeEach(() => {
        stringVariable = deepCopy(mockStoreData.mutatedVariablesAndConstants[mockStoreData.stringVariableGuid]);
        variableConstantEditor = setupComponentUnderTest(stringVariable);

        updateAction = (errorValue) => {
            const action = createAction(PROPERTY_EDITOR_ACTION.UPDATE_ELEMENT_PROPERTY, { propertyName, value, error: errorValue });
            updatedEditor = variableConstantReducer(variableConstantEditor, action);
        };

        spy = jest.spyOn(variableConstantValidation, 'validateProperty');
    });

    afterEach(() => {
        spy.mockRestore();
    });

    it('validates property on update', () => {
        updateAction();

        expect(spy).toHaveBeenCalledWith(propertyName, value);
    });
    it('preserves existing error', () => {
        updateAction(error);

        expect(spy).not.toHaveBeenCalledWith();
        expect(updatedEditor[propertyName][error]).toEqual(error);
    });
    it('updates error when one is not provided', () => {
        spy.mockImplementation(() => error);
        updateAction();

        expect(spy).toHaveBeenCalledWith(propertyName, value);
        expect(updatedEditor[propertyName][error]).toEqual(error);
    });
});
