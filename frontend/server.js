const { createServer } = require("http")
const next = require("next")
const { Server } = require("socket.io")
const os = require("os") // Modul os untuk membaca network interface laptop

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Fungsi untuk mendeteksi IP Wi-Fi laptop secara otomatis & akurat
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  let fallbackIp = '127.0.0.1';

  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();
    
    // ABAIKAN interface virtual yang sering mengecoh IP asli (Docker, VirtualBox, Bridge, dll)
    if (
      lowerName.includes("docker") || 
      lowerName.includes("vbox") || 
      lowerName.includes("virtual") || 
      lowerName.includes("br-") || 
      lowerName.includes("veth") || 
      lowerName.includes("lo")
    ) {
      continue;
    }

    for (const iface of interfaces[name]) {
      // Cari IPv4 yang aktif dan bukan internal loopback
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prioritaskan segmen IP Wi-Fi Rumah Sakit / Network Anda saat ini
        if (iface.address.startsWith("172.16.152.")) {
          return iface.address; 
        }
        // Fallback untuk jaringan lokal standar lainnya (172.16.x.x atau 192.168.x.x)
        if (iface.address.startsWith("172.16.") || iface.address.startsWith("192.168.")) {
          fallbackIp = iface.address;
        }
      }
    }
  }
  
  // Jika laptop tidak mendeteksi network, gunakan IP Wi-Fi Anda yang valid sebagai default terakhir
  return fallbackIp === '127.0.0.1' ? '172.16.152.121' : fallbackIp;
}

const localIp = getLocalIp();

// Suntikkan URL API Laravel secara dinamis (Backend port 8000)
process.env.NEXT_PUBLIC_API_URL = `http://${localIp}:8000`;
process.env.NEXT_PUBLIC_TV_URL = `http://${localIp}:4000`;

let io;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => (body += chunk))
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
  })
}

function send(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const url = req.url || ""
    const method = req.method || ""

    // Endpoint broadcast khusus untuk Laravel Backend
    if (method === "POST" && url.startsWith("/broadcast/")) {
      try {
        const entity = url.split("/")[2] // jadwal, paramedic, posisi, pj
        const body = await parseBody(req)

        if (!entity) {
          return send(res, 400, { message: "entity required" })
        }

        const eventName = `${entity}-updated`

        io.emit(eventName, {
          ...body,
          timestamp: Date.now(),
        })

        console.log(`📡 [Laravel -> WS] EMIT: ${eventName}`, body)

        return send(res, 200, { success: true })
      } catch (err) {
        console.error("❌ WS BROADCAST ERROR:", err.message)
        return send(res, 500, { success: false })
      }
    }

    handle(req, res)
  })

  // Inisialisasi Socket.io Server dengan CORS terbuka
  io = new Server(server, {
    cors: { origin: "*" },
  })

  io.on("connection", (socket) => {
    console.log("🟢 Client Terhubung ke WebSocket:", socket.id)

    socket.on("disconnect", () => {
      console.log("🔴 Client Terputus dari WebSocket:", socket.id)
    })
  })

  // Mengikat server ke 0.0.0.0 agar Next.js dan WebSocket dapat diakses HP/perangkat lain dalam satu Wi-Fi
  server.listen(4000, "0.0.0.0", () => {
    console.log("\n=============================================")
    console.log(`🚀 Next.js & Socket.io Server BERHASIL DIALIRKAN!`)
    console.log(`💻 Akses Lokal  : http://localhost:4000`)
    console.log(`📱 Akses Jaringan: http://${localIp}:4000`)
    console.log(`🔗 Target API Backend Laravel: http://${localIp}:8000`)
    console.log("=============================================\n")
  })
})