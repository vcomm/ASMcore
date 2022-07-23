const { Transform } = require('stream');
const { exec } = require("child_process");
const serviceDeploy = require('./service.deploy');

class streamProcessor extends Transform {
    #processType = false // through - true, final - false
    #eventname = NaN
    #content = {}
  
    constructor(type) {
        super()
        this.worker = new serviceDeploy()
        this.#processType = type || this.#processType
    }

    init(event, funclst, release, content = null) {
        this.#eventname = event;
        this.#content = content || {};
      
        console.log(`Init proc pipe stream`)
        
        this.worker.chainOn(event, [
            (cntx) => console.log(`: Run ${event} chain: `),
            funclst
        ], this.#content, (cntx) => release(cntx) || console.log(`: Free [${event}] resources: `, cntx))
    }

    _transform(chunk, encoding, callback) {

      if (this.#processType) {
          this.#content = { chunk }
        
          this.worker.waterFallPromise(this.#eventname, this.#content, 3)
              .then(stat => console.log(`: Chain Stats: `, stat))
              .then(() => {
                  console.log(`cntx: `, this.#content)
                  this.push(this.#content.trans);
                  callback();
              })
      } else {
          this.push(chunk);
          callback();
      }  
    }

    _flush(callback) {

      if (this.#processType) {
          this.push(null);
          callback();
      } else {
          this.worker.waterFallPromise(this.#eventname, this.#content, 3)
            .then(stat => console.log(`: Chain Stats: `, stat))
            .then(() => {
                this.push(null);
                callback();
            })
      }

    }

    async execute(cmd) {
        return await new Promise((resolve, reject) => {
            exec(
                cmd, {
                stdio: "pipe",
                maxBuffer: 1024 * 10092
            },
                async (error, stdout, stderr) => {
                    if (error != null) {
                        return reject(error);
                    }
                    return resolve(stdout);
                }
            );
        });
    }
}


module.exports = streamProcessor