// eEeEEEEeEEeEEeE

const vc = require("./vsws.js");
const http = require("http");
const fs = require("fs");
const url = require("url");

var server = http.createServer((req, res) => {
	if (req.headers["user-agent"].includes("CrOS") && req.headers["user-agent"].includes("Chrome")) {
		res.write("We are sorry, but due to schools using chromebooks, this will no longer be allowed for people on chrome OS.");
		res.end();
		return;
	}
	const rurl = url.parse(req.url, true);
	switch (rurl.pathname) {
		case "/":
			res.write(fs.readFileSync("index.html"));
			break;
		case "/.js":
			res.write(fs.readFileSync("script.js"));
			break;
		case "/.png":
			res.write(fs.readFileSync("favicon.png"));
			break;
		case "/.mp3":
			res.write(fs.readFileSync("msgtone.mp3"));
			break;
		case "/words":
			res.write(fs.readFileSync("words.txt"));
			break;
		default:
			res.writeHead(404);
			res.write("Error 404, Not Found");
			break;
	}
	res.end();
}).listen(process.env.PORT || 8080);
vc.init(server);

console.log(`Listening on port ${process.env.PORT || 8080}`);