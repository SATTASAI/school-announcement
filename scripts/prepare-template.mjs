import {readFile,writeFile,access} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {validateManifest} from '../lib/template-manifest.ts';

// Designer supplies the image and exact layout; this validates and packages a sidecar.
const source=process.argv[2];
if(!source||process.argv.length!==3){console.error('ใช้: node --experimental-strip-types scripts/prepare-template.mjs /path/definition.json');process.exit(1);}
try{
 const sourcePath=resolve(source), definition=validateManifest(JSON.parse(await readFile(sourcePath,'utf8')));
 const imagePath=join(dirname(sourcePath),definition.file),target=imagePath+'.template.json';
 await access(imagePath);
 if(target===sourcePath)throw Error('ไฟล์ต้นฉบับเป็นไฟล์กำกับอยู่แล้ว');
 await writeFile(target,JSON.stringify(definition,null,2)+'\n',{encoding:'utf8',flag:'wx'});
 console.log('พร้อมใช้งาน: '+imagePath+' และ '+target);
}catch(e){console.error('สร้างไฟล์กำกับไม่สำเร็จ: '+(e instanceof Error?e.message:String(e)));process.exitCode=1;}
