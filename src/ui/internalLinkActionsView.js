/**
 * @module internalLink/ui/internalLinkActionsView
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

import { createButton, createFocusCycler, registerFocusableViews } from './uiUtils';

import unlinkIcon from '../../theme/icons/unlink.svg';
import pencilIcon from '@ckeditor/ckeditor5-core/theme/icons/pencil.svg';

import {
    PROPERTY_INTERNAL_LINK_ID,
    PROPERTY_TITLE
} from '../util/constants';

import '../../theme/internallinkactions.css';

/**
 * The link actions view class. This view displays link preview, allows
 * unlinking or editing the link.
 *
 * @extends module:ui/view~View
 */
export default class InternalLinkActionsView extends View {

    /**
     * @inheritDoc
     */
    constructor(editor) {
        super(editor.locale);

        const t = this.locale.t;
        this.editor = editor;

        this.ui = null;

        /**
         * Value of the "internalLinkId" attribute of the link to use in the {@link #previewButtonView}.
         *
         * @observable
         * @member {String}
         */
        this.set(PROPERTY_INTERNAL_LINK_ID);

        /**
         * Value of the "title" attribute of the link to use in the {@link #previewButtonView}.
         *
         * @observable
         * @member {String}
         */
        this.set(PROPERTY_TITLE);

        /**
         * A collection of views which can be focused in the form.
         *
         * @readonly
         * @protected
         * @member {module:ui/viewcollection~ViewCollection}
         */
        this.focusables = new ViewCollection();

        /**
         * Tracks information about DOM focus in the form.
         *
         * @readonly
         * @member {module:utils/focustracker~FocusTracker}
         */
        this.focusTracker = new FocusTracker();

        /**
         * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
         *
         * @readonly
         * @member {module:utils/keystrokehandler~KeystrokeHandler}
         */
        this.keystrokes = new KeystrokeHandler();

        /**
         * Helps cycling over {@link #focusables} in the form.
         *
         * @readonly
         * @protected
         * @member {module:ui/focuscycler~FocusCycler}
         */
        this.focusCycler = createFocusCycler(this.focusables, this.focusTracker, this.keystrokes);

        /**
         * The internalLink preview view.
         *
         * @member {module:ui/view~ButtonView}
         */
        this.keywordButtonView = this.createKeywordButton();

        /**
         * The internalLink preview view.
         *
         * @member {module:ui/view~ButtonView}
         */
        this.previewButtonView = this.createPreviewButton();
        this.previewButtonView.delegate('execute').to(this, 'openModal');

        /**
         * The unlink button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        this.unlinkButtonView = createButton(t('Unlink'), unlinkIcon, this.locale);
        this.unlinkButtonView.delegate('execute').to(this, 'unlink');

        /**
         * The edit link button view.
         *
         * @member {module:ui/button/buttonview~ButtonView}
         */
        this.editButtonView = createButton(t('Edit link'), pencilIcon, this.locale);
        this.editButtonView.delegate('execute').to(this, 'edit');

        this.setTemplate({
            tag: 'div',

            attributes: {
                class: [
                    'ck',
                    'ck-internallink-actions',
                ],

                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1'
            },

            children: [
                this.keywordButtonView,
                this.previewButtonView,
                this.editButtonView,
                this.unlinkButtonView
            ]
        });
    }

    /**
     * @inheritDoc
     */
    render() {
        super.render();

        const childViews = [
            this.keywordButtonView,
            this.previewButtonView,
            this.editButtonView,
            this.unlinkButtonView
        ];

        // The two below commands are called this way in every plugin.
        // They ensure that focus is working correctly and that we can handle button clicks
        registerFocusableViews(childViews, this.focusables, this.focusTracker);
        this.keystrokes.listenTo(this.element);
        if (this.ui) {
            this.ui.fireEvent(0) // only needs to be fired once
        }
    }

    /**
     * Focuses the fist {@link #focusables} in the actions.
     */
    focus() {
        this.focusCycler.focusFirst();
    }

    /**
     * Creates a link preview button.
     *
     * @private
     * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
     */
    createKeywordButton() {
        let button = new ButtonView(this.locale);
        let t = this.t;

        button.set({
            withText: true,
            tooltip: t('keyword')
        });

        button.extendTemplate({
            attributes: {
                class: [
                    'ck',
                    'ck-link-actions__preview'
                ],
                target: '_blank'
            }
        });

        button.bind('isEnabled').to(this, PROPERTY_INTERNAL_LINK_ID, internalLinkId => !!internalLinkId);

        return button;
    }

    /**
     * Creates a link preview button.
     *
     * @private
     * @returns {module:ui/button/buttonview~ButtonView} The button view instance.
     */
    createPreviewButton() {
        const button = new ButtonView(this.locale);
        const t = this.t;

        button.set({
            withText: true,
            tooltip: t('show preview of wiki')
        });

        button.extendTemplate({
            attributes: {
                class: [
                    'ck',
                    'ck-link-actions__preview'
                ],
                target: '_blank'
            }
        });

        button.bind('label').to(this, PROPERTY_TITLE, linkTitle => {
            return linkTitle || t('This link is invalid');
        });

        button.bind('isEnabled').to(this, PROPERTY_INTERNAL_LINK_ID, internalLinkId => !!internalLinkId);
        return button;
    }
}

/**
 * Fired when the {@link #editButtonView} is clicked.
 *
 * @event edit
 */

/**
 * Fired when the {@link #unlinkButtonView} is clicked.
 *
 * @event unlink
 */
