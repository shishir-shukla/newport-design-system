// @ts-nocheck
import { CONDITION_LOGIC } from 'builder_platform_interaction/flowMetadata';
import { SORT_ORDER, WAY_TO_STORE_FIELDS } from 'builder_platform_interaction/recordEditorLib';
import { Validation } from 'builder_platform_interaction/validation';
import * as ValidationRules from 'builder_platform_interaction/validationRules';

/**
 * Validate the filter item. Here we can't use the ValidationRules.validateExpressionWith3Properties because this function allows empty RHS
 *
 * @returns {Function} the function to be called with each filter item to return the array of rules.
 */
const validateFilter = () => ValidationRules.validateExpressionWith3PropertiesWithNoEmptyRHS();

/**
 * Validate the assignments item.
 * The rule on the RHS is added only if the LHS has a value.
 *
 * @returns {Function} the function to be called with each filter item to return the array of rules.
 */
const validateAssignments = () => {
    return ValidationRules.validateExpressionWith2PropertiesWithNoEmptyRHS();
};

/**
 * Validate the outputReference item.
 *
 * @param outputReferenceIndex
 * @returns {Function} the function to be called with each filter item to return the array of rules.
 */
const validateOutputReference = (outputReferenceIndex) => {
    return [
        ValidationRules.shouldNotBeBlank,
        ValidationRules.shouldNotBeNullOrUndefined,
        ValidationRules.validateResourcePicker(outputReferenceIndex)
    ];
};

/**
 * Validate the queried field.
 *
 * @returns {Function} the function to be called with each queried field to return the array of rules.
 */
const validateQueriedField = () => {
    return () => {
        const rules = {
            field: [ValidationRules.shouldNotBeBlank]
        };
        return rules;
    };
};
const additionalRules = {
    object: [ValidationRules.shouldNotBeBlank],
    filterLogic: [ValidationRules.shouldNotBeNullOrUndefined, ValidationRules.shouldNotBeBlank]
};

export const recordLookupValidation = new Validation(additionalRules);

/**
 * Build specific overridden rules
 *
 * @param {Object} nodeElement the element that need to be validated
 * @param {string} nodeElement.filterLogic - current element's filterLogic
 * @param {string} nodeElement.sortOrder - current element's sortOrder
 * @param {Object} nodeElement.object - current element's object
 * @param {string} nodeElement.wayToStoreFields - current element's wayToStoreFields
 * @param {boolean} nodeElement.getFirstRecordOnly - current element's getFirstRecordOnly
 * @param {Object[]} nodeElement.outputAssignments - current element's outputAssignments
 * @param {Object} nodeElement.outputReference - current element's outputReference
 * @param {Object[]} nodeElement.queriedFields - current element's queriedFields
 * @param {boolean} nodeElement.storeOutputAutomatically - current's element is using automatic output handling
 * @param nodeElement.objectIndex
 * @param nodeElement.outputReferenceIndex
 * @returns {Object} the overridden rules
 */
export const getRules = ({
    filterLogic,
    sortOrder,
    object,
    objectIndex,
    wayToStoreFields,
    getFirstRecordOnly,
    outputAssignments,
    outputReference,
    outputReferenceIndex,
    queriedFields,
    storeOutputAutomatically
}) => {
    const overriddenRules = { ...recordLookupValidation.finalizedRules };
    overriddenRules.object.push(ValidationRules.validateResourcePicker(objectIndex));

    // validate sortField when sortOrder !== NOT_SORTED
    if (sortOrder !== SORT_ORDER.NOT_SORTED) {
        overriddenRules.sortField = [ValidationRules.shouldNotBeNullOrUndefined, ValidationRules.shouldNotBeBlank];
    }

    if (object && object.value) {
        // validate filters if filter logic is different from : 'No Conditions'
        if (filterLogic.value !== CONDITION_LOGIC.NO_CONDITIONS) {
            overriddenRules.filters = validateFilter();
        }
        if (!object.error && !storeOutputAutomatically) {
            if (
                wayToStoreFields === WAY_TO_STORE_FIELDS.SEPARATE_VARIABLES &&
                getFirstRecordOnly &&
                outputAssignments.length > 1
            ) {
                overriddenRules.outputAssignments = validateAssignments();
            } else if (outputAssignments && outputAssignments.length === 1 && outputAssignments[0].leftHandSide.value) {
                overriddenRules.outputAssignments = validateAssignments();
            } else if (wayToStoreFields === WAY_TO_STORE_FIELDS.SOBJECT_VARIABLE) {
                overriddenRules.outputReference = validateOutputReference(outputReferenceIndex);
                if (outputReference && outputReference.value && queriedFields.length > 2) {
                    overriddenRules.queriedFields = validateQueriedField();
                }
            }
        }
    }
    return overriddenRules;
};
