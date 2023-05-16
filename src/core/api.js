const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

app.use(
    '/:version/:locale',
    (req, res, next) => {
        next();
    },
    router
);

const rootRouter = require('../api/root');
router.use('/', rootRouter);

const skillRouter = require('../api/skill');
router.use(
    '/skill/:skillId',
    (req, res, next) => {
        req['skillId'] = req.params['skillId'];
        next();
    },
    skillRouter
);

const downloadRouter = require('../api/download');
router.use('/download', downloadRouter);

function startAPI(port = 3000) {
    return new Promise((resolve, reject) => {
        try {
            app.listen(port, () =>
                resolve(`Listening on: http://127.0.0.1:${port}`)
            );
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    startAPI,
};
