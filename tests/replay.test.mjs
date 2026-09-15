import test from 'node:test';
import assert from 'node:assert/strict';
import { parseReplay, frameAt } from '../src/lib/replay.ts';
import { readFileSync } from 'node:fs';
const ids = new Set([1,2]);
const valid = () => ({version:1,dataset:'male-cns:v1.0',source:{kind:'predicted',name:'Test model',normalization:'rate / 50 Hz, clamped'},frames:[{time:0,values:[[1,0]]},{time:1,values:[[1,.8]]},{time:2,values:[]}]});
test('sample-and-hold follows body IDs, explicit zero and frame time',()=>{
 const replay=parseReplay(valid(),ids);
 assert.equal(frameAt(replay,.99).values[0][1],0);
 assert.equal(frameAt(replay,1).values[0][1],.8);
 assert.deepEqual(frameAt(replay,9).values,[]);
});
test('wrong dataset, unknown IDs and duplicate IDs fail closed',()=>{
 const wrong=valid();wrong.dataset='flywire:v783';assert.throws(()=>parseReplay(wrong,ids));
 const unknown=valid();unknown.frames[0].values=[[3,.5]];assert.throws(()=>parseReplay(unknown,ids));
 const duplicate=valid();duplicate.frames[0].values=[[1,0],[1,1]];assert.throws(()=>parseReplay(duplicate,ids));
});
test('invalid values and timestamps cannot be presented as activity',()=>{
 for(const value of [NaN,Infinity,-.01,1.01,'1']) {const replay=valid();replay.frames[0].values=[[1,value]];assert.throws(()=>parseReplay(replay,ids));}
 for(const value of [-1,NaN,Infinity,0]) {const replay=valid();replay.frames[1].time=value;assert.throws(()=>parseReplay(replay,ids));}
 const unnamed=valid();unnamed.source.normalization='';assert.throws(()=>parseReplay(unnamed,ids));
});
const visibleIds = () => {
 const bytes=readFileSync(new URL('../public/data/brain-atlas/ids.bin',import.meta.url));
 const groups=readFileSync(new URL('../public/data/brain-atlas/groups.bin',import.meta.url));
 const visible=new Set();for(let i=0;i<groups.length;i++)if(groups[i]<3)visible.add(bytes.readUInt32LE(i*4));
 return visible;
};
test('bundled synthetic example uses actual visible MaleCNS IDs',()=>{
 const example=JSON.parse(readFileSync(new URL('../public/examples/model-output.example.json',import.meta.url),'utf8'));
 assert.equal(parseReplay(example,visibleIds()).source.kind,'synthetic');
});
test('garden atlas example uses real visible MaleCNS IDs and non-empty frames',()=>{
 const example=JSON.parse(readFileSync(new URL('../public/examples/garden-fly-activity.example.json',import.meta.url),'utf8'));
 const replay=parseReplay(example,visibleIds());
 assert.equal(replay.source.kind,'synthetic');
 assert.match(replay.source.name,/not from garden flies/i);
 assert.ok(replay.frames.some(frame=>frame.values.length>100));
});
