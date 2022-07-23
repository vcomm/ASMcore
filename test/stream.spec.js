const { streamProcessor } = require('../index');

const transcode = new streamProcessor(true); 
transcode.init('transcode', [    
    (cntx) => { 
      cntx.trans = cntx.chunk.toString().toUpperCase()
    }
],(cntx) => console.log(`: Chain Stats: `, cntx))

process.stdin.pipe(transcode).pipe(process.stdout)