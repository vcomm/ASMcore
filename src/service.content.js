const { EventEmitter } = require('events');

class serviceContent extends EventEmitter  {
    constructor(logic, initState) {
      super();
      this.logic = logic;
      this.state = initState || logic.states.init.key;
      this._locked = false;
    }
    setState(state) {
      this.state = state;
      console.log(`Update Current state to:`,this.state);
    }
    getState() {
      console.log(`Current state is:`,this.state)
      return this.state;
    }
    setNextState(nextState) {
      console.log(`nextState will be is:`,nextState)
      this.nextState = nextState
    }
    getNextSate() {
      return this.nextState
    }
    async lock() {
      console.log(`Lock Content:`);
      const promise = new Promise((resolve,reject) => {
        super.on('release', (reason)=>resolve(reason));
        if (!this._locked) {
            this._locked = true;
            super.emit('release',false);
        }
      })
      await promise
    }
    unlock() {
      super.emit('release',true);
      super.off('release', (reason)=>resolve(reason));
      this._locked = false;
      console.log(`UnLock Content:`);
    }
    transDetermine(phrase) {
        console.log(`Incoming phrase:`,phrase);
        const currState = this.logic.states[this.getState()];
        const trans =  (currState && currState.transitions) ? currState.transitions : null;
        if (!trans) return null;
        for (let [key, tran] of Object.entries(trans)) {
             if(tran.input === phrase) {
                return {
                  output: tran.output,
                  nextstate: tran.nextstatename
                };
             }
        }
        return null;      
    }
    async eventLoop(trig, mng) {
        await this.lock();
        const trans = this.transDetermine(trig);
        if (trans) {
            console.log(`Transition:`,trans)
            this.setNextState(trans.nextstate);
            mng.emitEvent(trans.output, this);
            return trans.nextstate;
        } else {
            console.warn(`Error: Wrong transition input[${trig}] for current state`);
            return NaN;
        }        
    }
    bios() {
        throw new Error('You have to implement the method doSomething!');
    }  
}

module.exports = serviceContent