/**
 * Used by components to indicate that a property of the business element they represent
 * has changed
 */
const eventName = 'propertychanged';

export class PropertyChangedEvent {
    constructor(
        propertyName: string,
        value,
        error: string | null = null,
        guid?: string | null,
        oldValue?: string,
        listIndex?: Number,
        dataType?: string | null
    ) {
        return new CustomEvent(eventName, {
            cancelable: false,
            composed: true,
            bubbles: true,
            detail: {
                propertyName,
                value,
                error,
                guid,
                oldValue,
                listIndex,
                dataType
            }
        });
    }

    static EVENT_NAME = eventName;
}
