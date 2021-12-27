// @ts-nocheck
import { ReorderListEvent } from 'builder_platform_interaction/events';
import { api, LightningElement } from 'lwc';

export default class Draggable extends LightningElement {
    @api index;

    @api
    handleDragStart(event) {
        // Cannot use a different attribute here because only 'text' works in IE
        event.dataTransfer.setData('text', this.index);
        event.dataTransfer.effectAllowed = 'move';
    }

    handleDrop(event) {
        event.preventDefault();
        const sourceIndex = event.dataTransfer.getData('text');
        if (sourceIndex) {
            this.fireReorder(sourceIndex);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    fireReorder(sourceIndex) {
        const reorderListEvent = new ReorderListEvent(sourceIndex, this.index);
        this.dispatchEvent(reorderListEvent);
    }
}
