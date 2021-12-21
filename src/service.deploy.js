const { aChainEngine } = require('@vcomm/asynchain');

class serviceDeploy extends aChainEngine {
    constructor() {
        super();      
    }
    deployLogic(logic) {

    }
    deliveryLogic(logic) {

    }
    /** Implementation required */
    initFSM() {
        throw new Error('You have to implement the method doSomething!');
    }
}

module.exports = serviceDeploy