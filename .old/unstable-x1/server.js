console.log(`\n${"#".repeat(10)} SERVER: RESTART ${"#".repeat(10)}\n`)

function broadcast(msg, exclude) {
  opensockets.forEach((socket) => {
    if (!exclude.includes(socket)) {
      socket.send(msg);
    }
  });
  listeners.forEach((socket) => {
    socket.send("CALL");
  });
}

var http = require("http");
var ws = require("ws");
var fs = require("fs");

var opensockets = [];
var listeners = [];

var httpserver = http.createServer((req, res) => {
  if (true) { //NEEDED FOR BACKWARDS-COMPATIBILITY
    if (req.url === "/call?pw=" + process.env.PW) {
      res.write(fs.readFileSync("./client.html"));
    } else {
      res.write("This is Polyphony Preview. Please ensure that you have the correct calling URL to continue.");
    }
  } else {
    res.write("Polyphony requires HTTPS to work. Please ensure that you are using the correct URL to continue.");
  }
  res.end();
});

var sockserver = new ws.Server({server: httpserver});
sockserver.on("connection", (sock, req) => {
  if (req.url === "/ws?pw=" + process.env.PW) {
    console.log("New WebSocket connection");
    opensockets.push(sock);

    sock.on("message", (data) => {
      broadcast(data, [sock]);
    });

    sock.on("close", (code, info) => {
      console.log("WebSocket closed");
      opensockets.splice(opensockets.indexOf(sock), 1);
      //broadcast(new Blob([(sock.clientnamelen + 50).toString(), sock.clientname]), [])
    });
  } else if (req.url == "/wsecho") {
    console.log("New WebSocket echoer");

    sock.on("message", (data) => {
      console.log("ECHO: " + data);
      sock.send(data);
    });

    console.log("Echoing...");
  } else if (req.url == "/wsnot") {
    console.log("New WebSocket listener");
    listeners.push(sock);

    sock.on("close", (code, info) => {
      listeners.splice(listeners.indexOf(sock), 1);
    });
  } else {
    console.log("Bad WebSocket url: " + req.url);
    sock.close();
  }

});

httpserver.listen(8080);