// Live Share server for the faruk-hasan.com sandbox.
//
// Yjs 13 WebSocket relay running on Node.js.
import http from 'node:http'
import { WebSocketServer } from 'ws'
import { setupWSConnection, docs } from 'y-websocket/bin/utils'

const PORT = Number(process.env.PORT || 1234)
const HOST = process.env.HOST || '0.0.0.0'
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
  'https://faruk-hasan.com,https://www.faruk-hasan.com,http://localhost:8765,http://127.0.0.1:8765')
  .split(',').map(s => s.trim()).filter(Boolean)

const MAX_PEERS_PER_ROOM = Number(process.env.MAX_PEERS_PER_ROOM || 5)
const MAX_ROOMS = Number(process.env.MAX_ROOMS || 200)
const MAX_MESSAGE_BYTES = Number(process.env.MAX_MESSAGE_BYTES || 1024 * 1024)
const EMPTY_ROOM_TTL_MS = Number(process.env.EMPTY_ROOM_TTL_MIN || 10) * 60 * 1000
const MAX_ROOM_AGE_MS = Number(process.env.MAX_ROOM_AGE_HOURS || 6) * 60 * 60 * 1000

const ROOM_RE = /^[A-Za-z0-9_-]{10,50}$/
const roomCreatedAt = new Map()
const emptySince = new Map()

const log = (...a) => console.log(new Date().toISOString(), ...a)

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, rooms: docs.size }))
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Sandbox Live Share server')
})

const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MESSAGE_BYTES })

function reject(socket, code, reason) {
  socket.write(`HTTP/1.1 ${code} ${reason}\r\nConnection: close\r\n\r\n`)
  socket.destroy()
}

server.on('upgrade', (req, socket, head) => {
  const origin = req.headers.origin || ''
  if (!ALLOWED_ORIGINS.includes(origin)) return reject(socket, 403, 'Forbidden')

  const docName = (req.url || '').slice(1).split('?')[0]
  if (!ROOM_RE.test(docName)) return reject(socket, 400, 'Bad Room')

  const existing = docs.get(docName)
  if (existing && existing.conns.size >= MAX_PEERS_PER_ROOM) return reject(socket, 429, 'Room Full')
  if (!existing && docs.size >= MAX_ROOMS) return reject(socket, 503, 'Server Busy')

  wss.handleUpgrade(req, socket, head, (ws) => {
    if (!roomCreatedAt.has(docName)) {
      roomCreatedAt.set(docName, Date.now())
      log('room opened:', docName)
    }
    setupWSConnection(ws, req, { docName })
  })
})

// Periodic TTL prune
setInterval(() => {
  const now = Date.now()
  for (const [name, doc] of docs) {
    const tooOld = now - (roomCreatedAt.get(name) || now) > MAX_ROOM_AGE_MS
    if (doc.conns.size === 0) {
      if (!emptySince.has(name)) emptySince.set(name, now)
    } else {
      emptySince.delete(name)
    }
    const expired = emptySince.has(name) && now - emptySince.get(name) > EMPTY_ROOM_TTL_MS
    if (expired || tooOld) {
      for (const conn of doc.conns.keys()) {
        try { conn.close(4000, 'Session expired') } catch {}
      }
      docs.delete(name)
      emptySince.delete(name)
      roomCreatedAt.delete(name)
      log('room closed:', name)
    }
  }
}, 30 * 1000).unref()

server.listen(PORT, HOST, () => {
  log(`Live Share server on ${HOST}:${PORT}`)
  log('Allowed origins:', ALLOWED_ORIGINS.join(', '))
})
