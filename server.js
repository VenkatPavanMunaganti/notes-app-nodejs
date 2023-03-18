const http = require("http");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: false,
    },
    {
      id: 2,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true,
    },
    {
      id: 3,
      content: "Browser can execute only JavaScript",
      important: false,
    },
    {
      id: 4,
      content: "NodeJS helps run JavaScript outside of the browser",
      important: true,
    },
    {
      id: 5,
      content: "ExpressJS makes backend even fun and easy",
      important: false,
    }
  ];

const server = http.createServer((req, res) => {
    const { pathname } = url.parse(req.url, true);
    if (req.method === "GET") {
        if (pathname === "/") {
            fs.readFile("./public/index.html", (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end();
                    return;
                } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    let notesList = "";
                    for (let i = 0; i < notes.length; i++) {
                        const note = notes[i];
                        notesList += "<li";
                        if (note.important) {
                            notesList += " class='important'";
                        }
                        notesList += ">" + note.content;
                        notesList += "<a href='/deletenote?id=" + note.id + "'> Delete </a>";
                        notesList += "</li>";
                    }
                    
                    let html = data.toString().replace("{{notesList}}", notesList);
                    res.end(html);
                    return;
                }
            });
        } else if (pathname.startsWith("/deletenote")) {
            const url_parts = url.parse(req.url, true);
            const noteId = url_parts.query.id;
            notes = notes.filter((note) => note.id != noteId);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.writeHead(301, { "Location": "/" });
            res.end();
            return;
        } else {
            res.writeHead(404);
            res.end();
            return;
        }
    } else if (req.method === "POST") {
        if (pathname === "/addnote") {
            let requestBody = "";
            req.on("data", (chunk) => {
                requestBody += chunk.toString();
            });
            req.on("end", () => {
                const parsedBody = querystring.parse(requestBody);
                const lastId= notes.length === 0? 0: notes[notes.length-1].id
                const note = {
                    content: parsedBody.content,
                    important: parsedBody.important === "on",
                    id: lastId + 1
                };
                notes.push(note);
                res.writeHead(301, {
                    Location: `http://localhost:3000/`
                }).end();
                return;
            });
        }
    } else {
        res.writeHead(404);
        res.end();
        return;
    }
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});
