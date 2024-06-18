const { asynChain } = require('@vcomm/asynchain');

class smartChain extends asynChain {
    #severity = {
        Skiped: -1,
        Normal: 0,
        Warning: 1,
        Error: 2,
        Critical: 3
    }
    #skipTrigger = 3

    constructor(funcs) {
        super(funcs);
    }

    async seqcall(funcs, cntx) {
        console.log(`New Release seqcall`);
        await funcs
            .reduce(
                (p, item, i) => p.then(
                    () => cntx.status.proceed ? this.runcall(item, cntx)
                        .then(
                            result => {
                                if (result && result.err >= this.#skipTrigger) {
                                    console.log(`: Critical Error -> exit from chain ;`, i);
                                    cntx.status.proceed = false;
                                } else if (result == undefined) {
                                    result = { err: 0, msg: 'Normal' };
                                }
                                cntx.status.stats.push({ indx: i, result })
                            }
                        ) : cntx.status.stats.push({ indx: i, result: { err: -1, msg: 'Skipping' } })
                ), Promise.resolve(cntx)
            )
    }

    async queuecall(cntx, done) {
        console.log(`Execute New Queue ${this._seqfuncs_.length} calls`);
        cntx.status = { proceed: true, stats: [] };
        await this.seqcall(this._seqfuncs_,cntx);
        if (done) done(cntx.status.stats);
    }

    skipTrigger(trigger) {
        return this.#skipTrigger = trigger ? trigger : this.#skipTrigger;
    }
}

module.exports = smartChain