const Koa = require('koa');
const koaBody = require('koa-body');
const path = require('path');
const fs = require('fs');
const app = new Koa();
const mkdirp = require('mkdirp-promise');

const port = process.argv[2] || 3000;
const targetDir = process.argv[3] || path.join(__dirname, "public");



app.use(koaBody({
  formidable: {
    uploadDir: path.join(__dirname, "tmp")
  },
  keepExtensions: true,
  multipart: true
}));

app.use(async ctx => {
  console.log(JSON.stringify(ctx.request.body, null, 2));

  let dir = ctx.request.body.fields.dir;
  if(dir){
    dir = path.join(targetDir,dir);
    await mkdirp(dir);
  }else{
    dir = targetDir
  }

  await moveFile(ctx.request.body.files.filename.path, path.join(dir, ctx.request.body.files.filename.name));
  fs.unlinkSync(ctx.request.body.files.filename.path);
  ctx.body = `ok`;
});


function moveFile(from, to) {
  const source = fs.createReadStream(from);
  const dest = fs.createWriteStream(to);

  return new Promise((resolve, reject) => {
    source.on('end', resolve);
    source.on('error', reject);
    source.pipe(dest);
  });
}

app.listen(port);
console.log("listen: ",port);
console.log("文件上传根目录：",targetDir);
