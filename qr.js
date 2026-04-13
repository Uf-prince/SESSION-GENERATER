const { makeid } = require('./gen-id');
const express = require('express');
const QRCode = require('qrcode');
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

    async function GIFTED_MD_PAIR_CODE() {
        // --- DYNAMIC IMPORT FIX START ---
        const { 
            default: makeWASocket, 
            useMultiFileAuthState, 
            delay, 
            makeCacheableSignalKeyStore, 
            Browsers, 
            jidNormalizedUser 
        } = await import("@whiskeysockets/baileys");
        // --- DYNAMIC IMPORT FIX END ---

        const {
            state,
            saveCreds
        } = await useMultiFileAuthState('./temp/' + id);

        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items);
            
            let sock = makeWASocket({
                auth: state,
                printQRInTerminal: false,
                logger: pino({
                    level: "silent"
                }),
                browser: Browsers.macOS("Desktop"),
            });
            
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect,
                    qr
                } = s;
                
                if (qr) {
                    if (!res.headersSent) {
                        res.setHeader('Content-Type', 'image/png');
                        await res.end(await QRCode.toBuffer(qr));
                    }
                }

                if (connection == "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;
                    
                    function generateRandomText() {
                        const prefix = "3EB";
                        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        let randomText = prefix;
                        for (let i = prefix.length; i < 22; i++) {
                            const randomIndex = Math.floor(Math.random() * characters.length);
                            randomText += characters.charAt(randomIndex);
                        }
                        return randomText;
                    }

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "POPKID;;;" + string_session;
                        
                        let desc = `┏━━━━━━━━━━━━━━😘\n┃👑┃ *BILAL-MD CONNECTED* \n┃👑┃ *SESSION-ID RECEIVED*\n┗━━━━━━━━━━━━━━━😘\n*________________________________*\n*👑 BILAL-MD REPO 👑*\n*github.com/BilalTech05/BILAL-MD*\n*________________________________*\n▬▬▬▬▬▬▬▬▬▬▬▬\n*👑 BILAL-MD HELP 👑*\n▬▬▬▬▬▬▬▬▬▬▬▬\n*________________________________*\n*👑 WHATSAPP GROUP 👑*\n*https://chat.whatsapp.com/BwWffeDwiqe6cjDDklYJ5m?mode=ems_copy_t*\n\n*________________________________*\n*👑 DEVELPER 👑*\n*https://akaserein.github.io/Bilal/*\n*________________________________*\n*_PLEASE BILAL-MD REPO KO STAR LAZMI KARNA 🥰❤️_*\n*________________________________*`;

                        let code = await sock.sendMessage(sock.user.id, { text: md });
                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "👑 BILAL-MD BOT 👑",
                                    thumbnailUrl: "https://files.catbox.moe/kunzpz.png",
                                    sourceUrl: "https://whatsapp.com/channel/0029Vaj3Xnu17EmtDxTNnQ0G",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }  
                            }
                        }, { quoted: code });

                    } catch (e) {
                        console.log("Error sending session:", e);
                    }

                    await delay(2000);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} Connected ✅`);
                    process.exit();

                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    GIFTED_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.log("Service restarted due to error");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                res.status(503).send({ code: "❗ Service Unavailable" });
            }
        }
    }
    await GIFTED_MD_PAIR_CODE();
});

setInterval(() => {
    console.log("☘️ Restarting process...");
    process.exit();
}, 1800000); // 30 mins fix (original was 3 mins)

module.exports = router;
