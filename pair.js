const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { upload } = require('./mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function GIFTED_MD_PAIR_CODE() {
        const { 
            default: makeWASocket, 
            useMultiFileAuthState, 
            delay, 
            Browsers, 
            makeCacheableSignalKeyStore 
        } = await import('@whiskeysockets/baileys');

        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }),
                // FIXED: Chrome Desktop browser signal pairing ke liye sabse best hai
                browser: ["Ubuntu", "Chrome", "20.0.04"]
            });

            if (!sock.authState.creds.registered) {
                // Wait for socket to be ready
                await delay(2000); 
                num = num.replace(/[^0-9]/g, '');
                
                // Request pairing code
                const code = await sock.requestPairingCode(num);
                const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
                
                if (!res.headersSent) {
                    await res.send({ code: formatted });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "BILAL-MD~" + string_session;
                        
                        await sock.sendMessage(sock.user.id, { text: md });
                        await sock.sendMessage(sock.user.id, { text: "*BILAL-MD CONNECTED SUCCESSFULLY* ✅" });

                    } catch (e) {
                        console.log("Upload error", e);
                    }
                    
                    await delay(1000);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    process.exit(0);

                } else if (connection === "close") {
                    let reason = lastDisconnect?.error?.output?.statusCode;
                    if (reason !== 401) {
                        GIFTED_MD_PAIR_CODE();
                    }
                }
            });
        } catch (err) {
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
   return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
