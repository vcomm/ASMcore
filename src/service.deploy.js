const { aChainEngine, asynChain } = require('@vcomm/asynchain');

class serviceDeploy extends aChainEngine {
    constructor() {
        super();      
    }

    emitted(evname, funclst, cntx, cblk) {
        this.chains[evname] = new asynChain(funclst);
        this.chains[evname].seqClone();
        this.on(evname, (context) => this.chains[evname].queuecall(context || cntx, () => {
            console.log(`: Finish On Chain[${evname}] and restore: `, this.eventNames());
            if (cblk) cblk();
        }, true), cntx);
        return this.eventNames();
    }

    waterfall(evname, cntx, cblk) {
        if (this.chains[evname]) {
            this.chains[evname].seqClone();
            this.chains[evname].queuecall(cntx, cblk, true);
        } else {    
            console.warn(`: Chain[${evname}] not exist: `, this.eventNames());
        }
    }

    async execWaterfall(evname, cntx) {
        try {
            await new Promise((resolve) => {
                this.waterfall(evname, cntx, () => resolve(true))
            });
            return;
        } catch (err) {
            console.error(`: execWaterfall error: `,err);
            throw err;
        }
    }

    deployLogic(logic) {

    }
    deliveryLogic(logic) {

    }
    /** Implementation required */
    initLogic() {
        throw new Error('You have to implement the method doSomething!');
    }
}

module.exports = serviceDeploy