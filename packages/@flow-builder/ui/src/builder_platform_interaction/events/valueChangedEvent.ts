/**
 * Used by components to indicate that it's value has changed
 */
const eventName = 'valuechanged';

type ValueChangedEventDetail<T> = {
    value: T;
    error?: string | null;
    item?: {
        error?: string;
    };
};

export class ValueChangedEvent<T> extends CustomEvent<ValueChangedEventDetail<T>> {
    constructor(value: T, error = null) {
        super(eventName, {
            cancelable: false,
            composed: true,
            bubbles: true,
            detail: {
                value,
                error
            }
        });
    }

    static EVENT_NAME = eventName;
}
