const fsmLogic = require('./manual.json');
const { serviceContent, serviceDeploy } = require('../index');

class serviceManager extends serviceDeploy {
    constructor() {
        super();
    }
    initLogic() {
        this.emitOn('efConfig', [
          (cntx)=>console.log('efConfig'),
          async (cntx)=>{
              return new Promise(resolve => {
                  setTimeout(() => resolve(cntx), 3000)
              })
              .then(data => {
                  console.log(`: Run async func: Anominus 1`);
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
            const promise = new Promise((resolve,reject) => {
                setTimeout(() => resolve(cntx), 1000)
            })
            const data = await promise
            console.log(`: Run async func: Anominus 2`);
          },
          (cntx)=>cntx.setState(cntx.getNextSate()),
          (cntx)=>cntx.unlock()
        ], {});
    }
}

const content  = new serviceContent(fsmLogic);
const manager  = new serviceManager();
manager.initLogic();

async function runLoop(trig, cntx, srvmng) {
    const state = await cntx.eventLoop(trig, srvmng);
    console.debug(` EvProc[${trig}] => nextState[${state}]:`)
}

(async (cntx, srvmng) => {
    await runLoop('evCheck', cntx, srvmng)
    await runLoop('evReplay', cntx, srvmng)
    await runLoop('evComplete', cntx, srvmng)
})(content, manager);