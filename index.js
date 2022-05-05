// Place your server entry point code here
const express = require('express')
const app = express()

// get command line args
const args = require('minimist')(process.argv.slice(2));

// could be command line argument...
const port = args.port || process.env.PORT || 5000

// make the server
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`)
  });

// Serve static HTML files
app.use(express.static('./public'));

//// a04 database stuff ////

const morgan = require('morgan')
const fs = require('fs')

// require database
const db = require("./src/services/database.js")

// use express' own built in body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Store help text
const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// start stream
if (args.log === 'true') {
  const accessLog = fs.createWriteStream('access.log', { flags: 'a'})
  app.use(morgan('combined', {stream: accessLog}))
}

// Middleware
app.use((req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
}
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent);
  next()
})
// Middleware

// add the debug endpoints
if(args.debug == true){
  console.log(args['debug'])
  app.get('/app/log/access', (req, res) =>{
    console.log("all records in access log")
    const stmt = db.prepare('SELECT * FROM accesslog').all()
    res.status(200).json(stmt)
  })
  app.get('/app/error', (req,res) =>{
    throw new Error('Error test successful.')
  })
}

// bring all the functions from coin assignment
function coinFlip() {
  if (Math.random() > 0.5) {
    return "heads";
  } else {
    return "tails";
  }
}

function coinFlips(flips) {
  const res = [];
  for(let step = 0; step < flips; step++) {
    res[step] = coinFlip();
  }
  return res;
}

function countFlips(array) {
  let head_count = 0;
  let tail_count = 0;
  for(let step = 0; step < array.length; step++) {
    if (array[step] == "heads") {
      head_count++;
    } else if (array[step] == "tails") {
      tail_count++;
    }
  }
  if (head_count == 0) {
    return {'tails': tail_count}
  } else if (tail_count == 0) {
    return {'heads': head_count}
  } else {
    return {'heads': head_count, 'tails': tail_count}
  }
}

function flipACoin(call) {
  let flipped = coinFlip();
  let result = "lose";
  if (flipped == call) {
    result = "win";
  }
  return { call: call, flip: flipped, result: result };
}

// initial app status
app.get('/app', (req, res) => {
    res.type('text/plain')
    res.status(200).end('OK')
})

// endpoint for flip
app.get('/app/flip', (req, res) => {
    res.type('application/json')
    res.status(200).json({ 'flip': coinFlip() })
});

// endpoint for app/flip/coin
app.get('/app/flip/coin', (req, res) => {
    res.type('application/json')
    res.status(200).json({ 'flip': coinFlip() })
  });

// endpoint for flips/:number
app.post('/app/flips/:number', (req, res) => {
  const raw = coinFlips(req.body.number)
  const summary = countFlips(raw)
  res.type('application/json')
  res.status(200).json({ 'raw': raw, 'summary': summary })
});

// a05 type stuff

// endpoint for app/flip/coins
app.post('/app/flip/coins/', (req, res, next) => {
    const flips = coinFlips(req.body.number)
    const count = countFlips(flips)
    res.status(200).json({"raw":flips,"summary":count})
})

app.post('/app/flip/call/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
})

app.get('/app/flip/call/:guess(heads|tails)/', (req, res, next) => {
    const game = flipACoin(req.body.guess)
    res.status(200).json(game)
  })

// // endpoint for call/heads
// app.get('/app/flip/call/heads', (req, res) => {
//   res.status(200).json(flipACoin('heads'))
//   res.type('application/json')
// });

// // endpoint for call/tails
// app.get('/app/flip/call/tails', (req, res) => {
//   res.status(200).json(flipACoin('tails'))
//   res.type('application/json')
// });


// non-existent endpoint handling
app.use(function (req, res, next) {
    res.json({ "message": "Error 404: Not found!" })
    res.status(404)
  })