const { streamProcessor } = require('../index');

const reverse = new streamProcessor(false)
reverse.init('reverse', [            
    async (cntx) => {
        try {
            const cmd = `ffmpeg -y -i ${cntx.original} -filter_complex "[0:v:0]reverse[v]; [0:a:0]areverse[a]" -map '[v]' -map '[a]' ${cntx.reversed}`;
            console.log(cmd);
            //await reverse.execute(cmd);
        } catch (err) {
            console.error('MMPEG ', err);
        }
    }
], (cntx) => console.log(`: Chain Stats: `, cntx), {
    original: 'clone.mp4',
    reversed: 'clone-reversed.mp4'
});

const rotate = new streamProcessor(false);
rotate.init('rotate', [    
    async (cntx) => { 
        try {
            const cmd = `ffmpeg -y -i ${cntx.reversed} -vf rotate=angle=-20*PI/180:fillcolor=brown ${cntx.rotated}`;
            console.log(cmd);
            //await rotate.execute(cmd);                    
        } catch (err) {
            console.error('MMPEG ', err);
        }
    }
], (cntx) => console.log(`: Chain Stats: `, cntx), {
    reversed: 'clone-reversed.mp4',
    rotated:  'clone-rotated.mp4'
}); 


const { createReadStream, createWriteStream } = require('fs');
const readStream = createReadStream('/Users/developer/Movies/soldat.mp4')
const writeStream = createWriteStream('./clone.mp4')

readStream.pipe(reverse).pipe(rotate).pipe(writeStream)
