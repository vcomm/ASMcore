const fsmLogic = require('./manual.json');
const { serviceContent, serviceDeploy } = require('../index');

class serviceManager extends serviceDeploy {
    constructor() {
        super();
    }
    initFSM() {
        this.emitOn('efConfig', [
          (cntx)=>console.log('efConfig'),
          async (cntx)=>{
              return new Promise(resolve => {
                  setTimeout(() => resolve(cntx), 3000)
              })
              .then(data => {
                  console.log(`: Run async func: Anominus`);
              }) 
          },
          (cntx)=>cntx.setState(cntx.getNextSate()),
          (cntx)=>cntx.unlock()
        ], {});
        this.emitOn('efReport', [
          (cntx)=>console.log('efReport'),
          (cntx)=>cntx.setState(cntx.getNextSate()),
          (cntx)=>cntx.unlock()
        ], {});
        this.emitOn('efRequest', [
          (cntx)=>console.log('efRequest'),
          async (cntx)=>{
              return new Promise(resolve => {
                  setTimeout(() => resolve(cntx), 1000)
              })
              .then(data => {
                  console.log(`: Run async func: Anominus`);
              }) 
          },
          (cntx)=>cntx.setState(cntx.getNextSate()),
          (cntx)=>cntx.unlock()
        ], {});
    }
}

const content = new serviceContent(fsmLogic)
const mng  = new serviceManager()
mng.initFSM();

async function runLoop(param, cntx) {
    const state = await cntx.eventLoop(param, mng);
    console.debug(` EvProc[${param}] => nextState[${state}]:`)
}

(async () => {
    await runLoop('evCheck', content)
    await runLoop('evReplay', content)
    await runLoop('evComplete', content)
})();