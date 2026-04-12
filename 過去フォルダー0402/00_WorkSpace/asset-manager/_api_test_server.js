import http from "http";

http.createServer(async (req, res) => {
    if (req.url === "/test") {
        const r = await fetch("http://localhost:3000/api/db?file=characters")
        const j = await r.json()

        console.log("API RESULT:", j)

        res.writeHead(200, { "Content-Type": "text/plain" })
        res.end("check console")
    }
}).listen(4000)

console.log("test server 4000")
