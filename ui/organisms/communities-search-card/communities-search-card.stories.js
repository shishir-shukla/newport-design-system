import { storiesOf } from '@storybook/html';
import base from 'paths.macro';
import { withKnobs, radios } from '@storybook/addon-knobs';
import {
withExample,
withDocs,
commentToHTML
} from '../../../scripts/storybook';
import scss from './base/_index.scss';
import notes from './doc.md';

const label = 'Open Sections';
const options = {
None: '',
One: 'One',
Two: 'Two',
Three: 'Three'
};
const defaultValue = '';

storiesOf(`${base}`, module)
.addDecorator(withKnobs)
.addDecorator(commentToHTML(scss))
.addDecorator(withDocs(notes))
.add('Default', () => {
const value = radios(label, options, defaultValue);
return withExample(`<div class="nds-communities-search-card nds-text-color_inverse nds-grid nds-grid_wrap">
    <div class="nds-large-size_1-of-2 nds-p-left_x-small nds-communities-search-card__info-col">
        <div class="nds-communities-search-card_heading">Find an agent today.</div>
        <div class="nds-text-body_medium">Message us or give us a call at (987) 654-3210</div>
    </div>
    <div class="nds-communities-search-card__search-col nds-large-size_1-of-2">
        <div class="nds-communities-search nds-card nds-grid nds-grid_wrap nds-p-around_small">
            <div class="nds-form-element nds-m-right_small nds-size_7-of-8">
                <div class="nds-form-element__control">
                    <input type="text" id="text-input-id-1" class="nds-input" placeholder="Enter Your Zip" />
                </div>
            </div>
            <div class="nds-communities-search_button">
                <button class="nds-button_text nds-button nds-button_brand">Find an Agent</button>
                <button class="nds-button nds-button_brand nds-button_icon nds-button_icon-border-filled"
                    aria-haspopup="true">
                    <svg class="nds-button__icon" aria-hidden="true">
                        <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#chevronright"></use>
                    </svg>
                    <span class="nds-assistive-text">More Options</span>
                </button>
            </div>
        </div>
    </div>
</div>`);
});