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
        // --- ESM DYNAMIC IMPORT FIX ---
        const { 
            default: makeWASocket, 
            useMultiFileAuthState, 
            delay, 
            Browsers, 
            makeCacheableSignalKeyStore 
        } = await import('@whiskeysockets/baileys');
        // ------------------------------

        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.ubuntu("Chrome")
            });

            if (!sock.authState.creds.registered) {
                await delay(3000);
                if (num) {
                    num = num.replace(/[^0-9]/g, '');
                    const code = await sock.requestPairingCode(num);
                    const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
                    
                    if (!res.headersSent) {
                        await res.send({ code: formatted });
                    }
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
                        let desc = `*BILAL-MD CONNECTED SUCCESSFULLY* ✅`; 
                        await sock.sendMessage(sock.user.id, { text: desc });

                    } catch (e) {
                        console.log("Upload Error:", e);
                    }
                    
                    await delay(2000);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log("Session Created, Process Exiting...");
                    process.exit(0);

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(2000);
                    GIFTED_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("Service Error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
   return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
