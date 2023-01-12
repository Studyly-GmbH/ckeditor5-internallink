/**
 * @module link/utils
 */

import {VIEW_INTERNAL_LINK_TAG, VIEW_INTERNAL_LINK_ID_ATTRIBUTE, VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE} from './constants';

const linkElementSymbol = Symbol('internalLinkElement');

/**
 * Returns `true` if a given view node is the link element.
 *
 * @param {module:engine/view/node~Node} node
 * @returns {Boolean}
 */
export function isLinkElement(node) {
    return node.is('attributeElement') && !!node.getCustomProperty(linkElementSymbol);
}

/**
 * Creates link {@link module:engine/view/attributeelement~AttributeElement} with provided `internalLinkId` attribute.
 *
 * @param {String} internalLinkId
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createLinkElement(internalLinkId, { writer }) {
    // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
    const linkElement = writer.createAttributeElement(VIEW_INTERNAL_LINK_TAG,
        { [ VIEW_INTERNAL_LINK_ID_ATTRIBUTE ]: internalLinkId},

        { priority: 5 });
    writer.setCustomProperty(linkElementSymbol, true, linkElement);

    return linkElement;
}

export function createKeywordIdElement(id, { writer }) {
    // Priority 5 - https://github.com/ckeditor/ckeditor5-link/issues/121.
    const linkElement = writer.createAttributeElement(VIEW_INTERNAL_LINK_TAG,
        { [ VIEW_INTERNAL_KEYWORD_ID_ATTRIBUTE ]: id},

        { priority: 5 });
    writer.setCustomProperty(linkElementSymbol, true, linkElement);

    return linkElement;
}

/**
 * Replaces a placeholder inside an url with the actual value.
 * The value is correctly encoded inside this function.
 * @param {*} url The url with placeholder
 * @param {*} placeholder A placeholder to replace
 * @param {*} value The value to insert instead of the placeholder
 */
export function replacePlaceholderInUrl(url, placeholder, value) {
    return url.replace(placeholder, encodeURI(value));
}

export function getTitlesString(titles) {
    titles.sort((a, b) => {
        if (a.regionInformation !== undefined) {
            if (b.regionInformation !== undefined) {
                const countryA = a.regionInformation.country.countryCode.toUpperCase();
                const countryB = b.regionInformation.country.countryCode.toUpperCase();
                return getAlphabeticalOrderingCriterionForSorting(countryA, countryB);
            }
            return 1;
        } else if (b.regionInformation !== undefined) {
            return -1;
        } else {
            const titleA = a.title.toUpperCase();
            const titleB = b.title.toUpperCase();
            return getAlphabeticalOrderingCriterionForSorting(titleA, titleB);
        }
    })
    let resultString = "";

    for (let i = 0; i < titles.length; ++i) {
        if (titles[i].regionInformation !== undefined) {
            resultString += titles[i].regionInformation.country.countryCode
            resultString += ": "
        }
        resultString += titles[i].title
        if (i !== titles.length -1) {
            resultString += "; "
        }
    }
    return resultString
}

export function getAlphabeticalOrderingCriterionForSorting(a, b) {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    // names must be equal
    return 0;
}
