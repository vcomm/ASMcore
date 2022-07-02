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

    chainOn(evname, funclst, cntx, done) {
        this.chains[evname] = new smartChain(funclst);
        this.on(evname,
            (context) => this.chains[evname].queuecall(context || cntx, (stats) => {
                console.log(`: Finish On Chain[${evname}] and stats: `);
                done(stats);
            }, done)
        )
    }

    waterfall(evname, cntx, cblk) {
        if (this.chains[evname]) {
            this.chains[evname].seqClone();
            this.chains[evname].queuecall(cntx, cblk, true);
        } else {
            console.warn(`: Chain[${evname}] not exist: `, this.eventNames());
        }
    }

    waterFall(evname, cntx, done) {
        if (this.chains[evname]) {
            this.chains[evname].queuecall(cntx, done);
            return true;
        } else {
            console.warn(`: Chain[${evname}] not exist: `, this.eventNames());
            return false;
        }
    }

    async execWaterfall(evname, cntx) {
        try {
            await new Promise((resolve) => {
                this.waterfall(evname, cntx, () => resolve(true))
            });
            return;
        } catch (err) {
            console.error(`: execWaterfall error: `, err);
            throw err;
        }
    }

    async waterFallPromise(evname, cntx, trigger) {
        try {
            console.log(`Skip Trigger Severity: `, this.chains[evname].skipTrigger(trigger));
            return await new Promise((resolve, reject) => {
                if (!this.waterFall(evname, cntx, () => resolve(cntx.status ? cntx.status.stats : true)))
                    reject(new Error(`: Chain[${evname}] not exist:`))
            });
        } catch (err) {
            console.error(`: waterFallPromise [${evname}]: `, err);
            return Promise.reject(new Error(`waterFallPromise [${evname}] failed`))
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