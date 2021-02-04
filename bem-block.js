let blockSettings = {
    "attr": {
        "DATA_BLOCK": "data-block",
    },
    "ERROR_CALLBACK": null,
    "IS_ALLOW_MULTIPLE_INSTANCES_PER_ELEMENT": false,
};

let _blocksInstance = null;

class Block {


    //////// constructor


    constructor(element) {

        this._element = element;

        // mark the element as already init
        // (for case if multiple instances per an element aren't allowed, e.g. for vue.js, because it re-create html in a constructor)

        element.setAttribute(blockSettings.attr.DATA_BLOCK, 'block');

    }


    //////// getters


    getElement() {
        return this._element;
    }

}

class Blocks {


    //////// constructor


    constructor() {

        this._blocks = [];
        this._mutationObserver = null;

        'loading' === document.readyState ?
            document.addEventListener('DOMContentLoaded', this.onDocumentReady.bind(this)) :
            this.onDocumentReady();

    }


    //////// static methods


    static Instance() {

        if (!_blocksInstance) {
            _blocksInstance = new Blocks();
        }

        return _blocksInstance;
    }

    static Error(info) {

        if (!blockSettings.ERROR_CALLBACK) {
            return;
        }

        try {
            blockSettings.ERROR_CALLBACK(info);
        } catch (e) {
            // nothing
        }

    }


    //////// methods


    _initBlock(block, environment = null) {

        environment = !environment ?
            document.body :
            environment;

        // ignore some elements, like textNodes, etc..

        if ('function' !== typeof environment.querySelectorAll) {
            return;
        }

        let elements = Array.from(environment.querySelectorAll(block.elementSelector));

        if (environment.matches(block.elementSelector)) {
            elements.push(environment);
        }

        elements.forEach((element, index) => {

            if (element.getAttribute(blockSettings.attr.DATA_BLOCK) &&
                !block.isAllowMultipleInstancesPerElement) {
                return;
            }

            let blockInstance = null;

            try {

                blockInstance = new block.classLink(element);

                if (!blockInstance instanceof Block) {
                    new Error("Class link isn't extend a Block class");
                }

            } catch (exception) {

                Blocks.Error({
                    message: 'Fail create a new block',
                    args: {
                        block: block,
                        element: element,
                        environment: environment,
                        exception: exception,
                    },
                });

                return;
            }


        });

    }

    _onMutationCallback(records, observer) {

        records.forEach((record, index) => {

            record.addedNodes.forEach((element, index2) => {

                this._blocks.forEach((block, index3) => {

                    this._initBlock(block, element);

                });

            });

        });

    }

    register(elementSelector, classLink, settings = {}) {

        let isAllowMultipleInstancesPerElement = blockSettings.IS_ALLOW_MULTIPLE_INSTANCES_PER_ELEMENT;
        isAllowMultipleInstancesPerElement = settings.hasOwnProperty('isAllowMultipleInstancesPerElement') ?
            settings.isAllowMultipleInstancesPerElement :
            isAllowMultipleInstancesPerElement;

        let block = {
            elementSelector: elementSelector,
            classLink: classLink,
            isAllowMultipleInstancesPerElement: isAllowMultipleInstancesPerElement,
        };

        this._blocks.push(block);

        'loading' === document.readyState ?
            document.addEventListener('DOMContentLoaded', this._initBlock.bind(this, block, null)) :
            this._initBlock(block);


    }

    //// events

    onDocumentReady() {

        if (!window.hasOwnProperty('MutationObserver')) {

            Blocks.Error({
                message: "MutationObserver doesn't supported",
            })

            return '';
        }

        this._mutationObserver = new MutationObserver(this._onMutationCallback.bind(this));
        this._mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });

    }

}

export default {
    Class: Block,
    // settings : isAllowMultipleInstancesPerElement
    Register: (elementSelector, classLink, settings = {}) => {
        Blocks.Instance().register(elementSelector, classLink, settings);
    },
    settings: blockSettings,
}
