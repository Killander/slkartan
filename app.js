const fs = require('fs');
const http = require('http');
const path = require('path');

const port = 7070;
const directoryName = './public';

const types = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml',
    gif: 'image/gif',
    json: 'application/json',
    xml: 'application/xml',
};

const root = path.normalize(path.resolve(directoryName));

const server = http.createServer((req, res) => {
    // Strip query parameters
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
    const extension = path.extname(pathname).slice(1);
    const type = extension ? types[extension] : types.html;
    const supportedExtension = Boolean(type);

    if (!supportedExtension) {
        res.writeHead(404, {
            'Content-Type': 'text/html'
        });
        res.end('404: File not found');
        return;
    }

    let fileName = pathname;
    if (pathname === '/') {
        fileName = 'index.html';
    } else if (!extension) {
        try {
            fs.accessSync(path.join(root, pathname + '.html'), fs.constants.F_OK);
            fileName = pathname + '.html';
        } catch (e) {
            fileName = path.join(pathname, 'index.html');
        }
    }

    const filePath = path.join(root, fileName);
    const isPathUnderRoot = path
        .normalize(path.resolve(filePath))
        .startsWith(root);

    if (!isPathUnderRoot) {
        res.writeHead(404, {
            'Content-Type': 'text/html'
        });
        res.end('404: File not found');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, {
                'Content-Type': 'text/html'
            });
            res.end('404: File not found');
        } else {
            res.writeHead(200, {
                'Content-Type': type
            });
            res.end(data);
        }
    });
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});