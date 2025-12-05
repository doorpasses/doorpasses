const http = require('http')
const httpProxy = require('http-proxy')

const proxy = httpProxy.createProxyServer({
	ws: true,
})

const targets = {
	'doorpasses.me:2999': 'http://localhost:3002',
	'app.doorpasses.me:2999': 'http://localhost:3001',
	'studio.doorpasses.me:2999': 'http://localhost:3003',
	'docs.doorpasses.me:2999': 'http://localhost:3004',
	'admin.doorpasses.me:2999': 'http://localhost:3005',
	'cms.doorpasses.me:2999': 'http://localhost:3006',
	'api.doorpasses.me:2999': 'http://localhost:3007',
}

const server = http.createServer((req, res) => {
	const host = req.headers.host
	const target = targets[host]

	if (target) {
		proxy.web(req, res, { target }, (err) => {
			console.error('Proxy error:', err)
			res.writeHead(500, { 'Content-Type': 'text/plain' })
			res.end('Proxy error')
		})
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' })
		res.end('Not Found')
	}
})

server.on('upgrade', function (req, socket, head) {
	const host = req.headers.host
	const target = targets[host]
	if (target) {
		proxy.ws(req, socket, head, { target })
	} else {
		socket.destroy()
	}
})

const port = 2999
server.listen(port, '127.0.0.1', () => {
	console.log(`Reverse proxy listening on port ${port}`)
})
