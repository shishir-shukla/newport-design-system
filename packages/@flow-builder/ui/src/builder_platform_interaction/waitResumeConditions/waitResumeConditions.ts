// @ts-nocheck
import { getValueFromHydratedItem } from 'builder_platform_interaction/dataMutationLib';
import { isWaitTimeEventType } from 'builder_platform_interaction/elementFactory';
import { UpdateWaitEventEventTypeEvent } from 'builder_platform_interaction/events';
import { WAIT_TIME_EVENT_TYPE } from 'builder_platform_interaction/flowMetadata';
import { api, LightningElement, track } from 'lwc';
import { LABELS } from './waitResumeConditionsLabels';

const resumeEventType = {
    timeEventType: 'TIME_EVENT_TYPE',
    platformEventType: 'PLATFORM_EVENT_TYPE'
};

export default class WaitResumeConditions extends LightningElement {
    /**
     * The input parameters that defines the resume time for this wait event
     *
     * @type {module:WaitTimeEvent.WaitEventParameter}
     */
    @api
    resumeTimeParameters;

    /**
     * The output parameters
     *
     * @type {module:WaitTimeEvent.WaitEventParamter}
     */
    @api
    outputParameters;

    /**
     * @type {string} guid of the parent wait element
     */
    @api
    waitEventGuid;

    /**
     * The guid associated with the event type entity resource picker
     *
     * @type {string}
     */
    @api
    eventTypeIndex;

    /**
     * The event type
     *
     * @type {string}
     */
    set eventType(newEventType) {
        this._eventType = newEventType;
        if (newEventType) {
            this.resumeEventType = this.isTimeEvent(newEventType)
                ? resumeEventType.timeEventType
                : resumeEventType.platformEventType;
        }
    }

    @api
    get eventType() {
        return this._eventType;
    }

    /**
     * internal state for the wait-resume-condition
     */

    @track
    _eventType;

    @track
    resumeEventType = resumeEventType.timeEventType;

    labels = LABELS;

    resumeEventTypeOptions = [
        {
            label: LABELS.timeEventTypeLabel,
            value: resumeEventType.timeEventType
        },
        {
            label: LABELS.platformEventTypeLabel,
            value: resumeEventType.platformEventType
        }
    ];

    get isPlatformEventTypeSelected() {
        return this.resumeEventType === resumeEventType.platformEventType;
    }

    get isTimeEventTypeSelected() {
        return this.resumeEventType === resumeEventType.timeEventType;
    }

    handleOptionSelected(event) {
        event.stopPropagation();
        this.resumeEventType = event.detail.value;
        if (this.resumeEventType === resumeEventType.timeEventType) {
            // Set the default back to absolute time
            this._eventType = WAIT_TIME_EVENT_TYPE.ABSOLUTE_TIME;
        } else {
            // Clear out event type when switching to a platform event
            this._eventType = '';
        }

        // fire update event type event
        const updateWaitEventEventEvent = new UpdateWaitEventEventTypeEvent(this._eventType, null, this.waitEventGuid);
        this.dispatchEvent(updateWaitEventEventEvent);
    }

    isTimeEvent(eventType) {
        const eventTypeValue = getValueFromHydratedItem(eventType);
        return isWaitTimeEventType(eventTypeValue);
    }
}
