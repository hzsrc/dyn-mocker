var fs = require('fs');
var mime = require('mime')//引入mime模块
var url = require('url')
var path = require('path')

function byStatic(config, req, res, next) {
    var urlPart = url.parse(req.url);
    if (config.static) {
        var pathname = urlPart.pathname;
        var staticFile = path.join(config.relativePath, config.static.path, pathname);
        if (fs.existsSync(staticFile)) {
            if (fs.statSync(staticFile).isDirectory()) {
                staticFile = path.join(staticFile, urlPart.index || 'index.html');
            }
            staticByFile(req, res, staticFile, config);
        } else {
            next()
        }
    } else {
        next()
    }
}

function staticByFile(req, res, staticFile, config) {
    fs.readFile(staticFile, (err, data) => {
        if (err) {
            console.error(err)
            res.writeHead(500, {});
            res.end('Internal error');
        } else {
            var headers = {
                'content-type': mime.getType(staticFile) //通过后缀名指定mime类型
            }
            var mockData = { body: data, headers: headers, resolved: 'static' }
            if (config.beforeResponse) config.beforeResponse(mockData, req);

            res.writeHead(200, mockData.headers);
            res.end(mockData.body);
        }
    })
}

module.exports = byStatic


