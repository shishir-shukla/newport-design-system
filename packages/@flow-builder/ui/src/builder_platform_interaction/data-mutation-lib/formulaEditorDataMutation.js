import { mutateTemplate, demutateTemplate } from './templateMutation';
import { set } from './objectMutation';

/**
 * Mutate formula element for property editor
 * @param {Object} formula Formula element to mutate
 * @return {Object} The mutated formula element
 */
export const mutateFormula = formula => set(formula, 'expression', mutateTemplate(formula.expression));

/**
 * Remove property editor mutation for formula element
 *
 * @param {Object} formula Formula element to de-mutate
 * @return {Object} The demutated formula element
 */
export const demutateFormula = formula => set(formula, 'expression', demutateTemplate(formula.expression));