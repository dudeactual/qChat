// Hello there, weary traveller. This is the code which makes it tick.

const ws = require("ws");
const url = require("url");

var vclients = {};
var tclients = {};

exports.init = server => {
	const ss = new ws.Server({server: server});
	ss.on("connection", function(/*WebSocket*/socket, req) {
		const rurl = url.parse(req.url, true);
		if (rurl.pathname == "/vc") {
			if (!vclients[rurl.query.p || "$public"]) vclients[rurl.query.p || "$public"] = [];
			vclients[rurl.query.p || "$public"].push(socket);
			socket.on("message", msg => vclients[rurl.query.p || "$public"].forEach(vsk => vsk.send(msg)));
			socket.on("close", code => vclients[rurl.query.p || "$public"].splice(vclients[rurl.query.p || "$public"].indexOf(socket), 1));
		} else if (rurl.pathname == "/tc") {
			const uname = rurl.query.n || "Anonymous" + Math.floor(Math.random() * 101);;
			if (!tclients[rurl.query.p || "$public"]) tclients[rurl.query.p || "$public"] = [];
			tclients[rurl.query.p || "$public"].push(socket);
			tclients[rurl.query.p || "$public"].forEach(tsk => tsk.send(`j${uname}`));
			socket.on("message", msg => tclients[rurl.query.p || "$public"].forEach(tsk => tsk.send(`m${uname};${msg}`)));
			socket.on("close", code => {
				tclients[rurl.query.p || "$public"].splice(tclients[rurl.query.p || "$public"].indexOf(socket), 1);
				tclients[rurl.query.p || "$public"].forEach(tsk => tsk.send(`x${uname}`));
			});
		}
	});
};