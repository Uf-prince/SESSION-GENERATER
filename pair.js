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
                // FIXED: Naya Chrome version aur Desktop signal jo 100% pairing accept karta hai
                browser: ["Ubuntu", "Chrome", "121.0.6167.160"],
                // Extra security for pairing
                syncFullHistory: false,
                markOnlineOnConnect: true
            });

            if (!sock.authState.creds.registered) {
                // Wait for socket to stabilize
                await delay(3000); 
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
                        await sock.sendMessage(sock.user.id, { 
                            text: "*BILAL-MD CONNECTED SUCCESSFULLY* ✅\n\n*Session ID:* `" + md + "`" 
                        });

                    } catch (e) {
                        console.log("Upload error", e);
                    }
                    
                    await delay(2000);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    process.exit(0);

                } else if (connection === "close") {
                    let reason = lastDisconnect?.error?.output?.statusCode;
                    if (reason !== 401) {
                        // Re-initialize if connection lost but not logged out
                        setTimeout(() => GIFTED_MD_PAIR_CODE(), 3000);
                    }
                }
            });
        } catch (err) {
            console.error("Pairing Error:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
   return await GIFTED_MD_PAIR_CODE();
});

module.exports = router;
