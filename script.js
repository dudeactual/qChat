// Hello there, weary traveller. JavaScript is a dumpster fire.

window.onload = async() => {
	let username = localStorage.username || prompt("Please enter your name: ");
	localStorage.username = username;
	document.querySelector("#svdat").innerText = location.hash ? "Server: " + location.hash.substring(1) : "Public Server";
	textsocket = new WebSocket(`ws${useSecure ? "s" : ""}://${location.host}/tc?n=${encodeURIComponent(username ? username : "Random Guest")}${location.hash?"&p="+location.hash.substring(1):""}`);
	textsocket.onmessage = tmessage;
	window.audioblob = await (await fetch("/.mp3")).blob();
};

window.playTone = () => (new Audio(URL.createObjectURL(window.audioblob))).play();
window.genCode = async() => {
	let text = await (await (await fetch("/words")).blob()).text();
	text = text.split("\n");
	return text[Math.round(Math.random() * (text.length - 1))] + "-" + text[Math.round(Math.random() * (text.length - 1))] + "-" + text[Math.round(Math.random() * (text.length - 1))];
};
window.joinPrivate = async code => {
	//code = (code || Math.floor((Math.random() * 89999999) + 10000000)).toString();
	code = code || await genCode();
	location.hash = code;
	location.reload();
};
window.toggleMic = () => {
	micActive = !micActive;
	document.querySelector("#micTgl").classList.toggle("muted");
};
window.connectDisconnect = async() => {
	if (connected) disconnect();
	else if (await connect() != "OK") return;
	connected = !connected;
	document.querySelector("#cndcn").classList.toggle("cn");
};
window.connect = () => new Promise((resolve, reject) => {
	if (!localStorage.hasConsented) {
		if (confirm("By using this service, you acknowledge that your data may be publicly visible, and that you have read the terms of service readable at https://repl.it/@dudeactualdev/ChromiumChat#README.md\nIf you are in a public server, your microphone data will be broadcast publicly to anyone, and to anyone else in the server you are in if you are using a private server.\nDo you wish to proceed?")) localStorage.hasConsented = true;
		else {
			reject("User did not consent.");
			return;
		}
	}
	(voicesocket||{close:(()=>{})}).close(); // :/
	navigator.mediaDevices.getUserMedia({audio:true,video:false}).then(userMedia => {
		voicesocket = new WebSocket(`ws${useSecure ? "s" : ""}://${location.host}/vc${location.hash?"?p="+location.hash.substring(1):""}`);
		voicesocket.onmessage = vmessage;
		recorder = new MediaRecorder(userMedia, {mimeType:"audio/webm;codecs=opus"});
		recorder.ondataavailable = ({data}) => {
			if (micActive && voicesocket) voicesocket.send(data);
		};
		recorder.start();
		packetSender = setInterval(() => {
			recorder.stop();
			recorder.start();
		}, 500);
		resolve("OK");
	}, () => {
		reject( "Microphone access denied" );
	});
});
window.disconnect = () => {
	clearInterval(packetSender);
	voicesocket.close();
	recorder.stop();
};
window.tmessage = ({data}) => {
	var sd, msg, meta;
	switch(data[0]) {
		case "j":
			meta = `${data.substring(1)} joined.`;
			break;
		case "x":
			meta = `${data.substring(1)} disconnected.`;
			break;
		case "m":
			playTone();
			sd = data.substring(1).substring(0, data.indexOf(";") - 1);
			msg = data.substring(1).substring(data.indexOf(";"));
			break;
		default:
			meta = "An erroneously constructed message was received.";
			break;
	}
	let pmsg = document.createElement("p");
	let sdr = document.createElement("b");
	let imd = document.createElement("i");
	sdr.innerText = sd ? sd : "";
	imd.innerText = meta ? meta : "";
	pmsg.appendChild(sdr);
	pmsg.appendChild(document.createTextNode(msg ? msg : ""));
	pmsg.appendChild(imd);
	document.querySelector("#chat").appendChild(pmsg);
	pmsg.scrollIntoView(); //document.querySelector("#chat").scrollTop = document.querySelector("#chat").scrollHeight;
};
window.vmessage = ({data}) => (new Audio(URL.createObjectURL(new Blob([data], {type:"audio/webm;codecs=opus"})))).play();

if (!window.WebSocket) {
	alert("Your browser appears to not be compatible with websockets. Please download the latest version of google chrome to acccess this site.");
	location.reload();
}
var voicesocket = null;
var textsocket = null;
var connected = false;
var micActive = false;
var packetSender = null;
var recorder = null;
const useSecure = location.protocol == "https:";
function myFunction(x) {
  x.classList.toggle("fa-microphone-slash");
}