const { copyFileSync, existsSync, createReadStream } = require('fs');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const Router = require('koa-router');
const auth = require('../controllers/authMiddleware');

const upload_options = {
    multipart: true,
    formidable: {
        // upload directory MUST EXIST to work
        // so create it yourself before POSTing file uploads, if required
        uploadDir: '/tmp/api/uploads'
    }
}
const koaBody = require('koa-body')(upload_options);

const prefix = '/api/v1';
const router = Router({prefix: prefix});

// point to some persistent directory to persist the public uploads
const fileStore = '/var/tmp/api/public/images';

router.post('/images', auth, koaBody, async ctx => {
    try {
        // we access the file sent by the client with key 'upload'
        // the koa-body library stores the file(s) in the uploadDir set above
        const {path, name, type} = ctx.request.files.upload;
        const extension = mime.extension(type);

        // copy the uploaded files to persistent location with a UNIQUE name
        // NB: destination directory 'fileStore' MUST EXIST to work
        const imageName = uuidv4()
        const newPath = `${fileStore}/${imageName}`;
        copyFileSync(path, newPath);

        // add some logging to help with troubleshooting
        console.log('Uploaded file details:')
        console.log(`path: ${path}`);
        console.log(`filename: ${name}`);
        console.log(`type: ${type}`);
        console.log(`fileExtension: ${extension}`);
        console.log('Saved file details:')
        console.log(`path: ${newPath}`);

        ctx.status = 201;
        ctx.body = {
            links: {
                path: router.url('get_image', imageName)
            }
        };
    } catch(err) {
        console.log(`error ${err.message}`);
        ctx.throw(500, 'upload error', {message: err.message});
    }
});

router.get('get_image', '/images/:uuid([0-9a-f\\-]{36})', async ctx => {
    const uuid = ctx.params.uuid;
    const path = `${fileStore}/${uuid}`;
    console.log('client requested image with path', path);
    try {
        if (existsSync(path)) {
            console.log('image found');
            const src = createReadStream(path);
            ctx.type = 'image/jpeg';
            ctx.body = src;
            ctx.status = 200;
        } else {
            console.log('image not found');
            ctx.status = 404;
        }
    } catch (err) {
        console.log(`error ${err.message}`);
        ctx.throw(500, 'image download error', {message: err.message});
    }
});

module.exports = router;
