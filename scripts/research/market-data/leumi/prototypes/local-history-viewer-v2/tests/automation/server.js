const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = 4173;
const ROOT = path.resolve(__dirname, "../..");

const MIME_TYPES = Object.freeze({
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8"
});

function send(response, statusCode, body, contentType) {
    response.writeHead(statusCode, {
        "Content-Type": contentType,
        "Cache-Control": "no-store"
    });
    response.end(body);
}

function resolveRequestPath(requestUrl) {
    const url = new URL(
        requestUrl,
        "http://" + HOST + ":" + PORT
    );

    const relativePath = decodeURIComponent(
        url.pathname
    ).replace(/^\/+/, "");

    const resolvedPath = path.resolve(
        ROOT,
        relativePath
    );

    if (
        resolvedPath !== ROOT &&
        !resolvedPath.startsWith(
            ROOT + path.sep
        )
    ) {
        return null;
    }

    return resolvedPath;
}

const server = http.createServer(
    (request, response) => {
        const resolvedPath = resolveRequestPath(
            request.url ?? "/"
        );

        if (!resolvedPath) {
            send(
                response,
                403,
                "Forbidden",
                "text/plain; charset=utf-8"
            );
            return;
        }

        fs.stat(
            resolvedPath,
            (statError, stats) => {
                if (
                    statError ||
                    !stats.isFile()
                ) {
                    send(
                        response,
                        404,
                        "Not Found",
                        "text/plain; charset=utf-8"
                    );
                    return;
                }

                fs.readFile(
                    resolvedPath,
                    (readError, contents) => {
                        if (readError) {
                            send(
                                response,
                                500,
                                "Internal Server Error",
                                "text/plain; charset=utf-8"
                            );
                            return;
                        }

                        const extension =
                            path.extname(
                                resolvedPath
                            ).toLowerCase();

                        send(
                            response,
                            200,
                            contents,
                            MIME_TYPES[extension] ??
                                "application/octet-stream"
                        );
                    }
                );
            }
        );
    }
);

server.listen(
    PORT,
    HOST,
    () => {
        console.log(
            "Market Flow browser-test server listening at " +
            "http://" +
            HOST +
            ":" +
            PORT
        );
    }
);

function shutdown() {
    server.close(() => {
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
