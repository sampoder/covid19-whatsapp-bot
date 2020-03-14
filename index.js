// General imports
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const accountSid = process.env.accountSid;
const authToken = process.env.authToken;
const unirest = require("unirest");

// Twilio imports
const client = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// API Route for receiving messages on WhatsApp
app.post('/incoming', (req, res) => {
  let message = ""; 
  const twiml = new MessagingResponse();

  let req2 = unirest("GET", "https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats");

  req2.query({
    "country": req.body.Body
  });

  req2.headers({
    "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
    "x-rapidapi-key": "fe99bf059emsh51221a7597c3c35p1cd895jsnf1677d537c99"
  });
  
  req2.end(function (res2) {
    if (res2.error) throw new Error(res2.error);
      if (res2.body.message == "OK"){
        let totaldeaths = 0;
        let totalcases = 0;
        let recoveredcases = 0;

        for (let i = 0; i < res2.body.data.covid19Stats.length; i++) {
          totaldeaths += res2.body.data.covid19Stats[i].deaths;
        }

        for (let i = 0; i < res2.body.data.covid19Stats.length; i++) {
          totalcases += res2.body.data.covid19Stats[i].confirmed;
        }

        for (let i = 0; i < res2.body.data.covid19Stats.length; i++) {
          recoveredcases += res2.body.data.covid19Stats[i].recovered;
        }
        
        let country = res2.body.data.covid19Stats[0].country;

        message = "Currently " + country + " has " + totalcases+ " confirmed cases of which " + totaldeaths + " have died and " + recoveredcases + " have recovered.";

        twiml.message(message);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());

      } else if (req.body.Body == "World") {
        let totaldeaths = 0;
        let totalcases = 0;
        let recoveredcases = 0;

        for (let i = 0; i < res2.body.data.covid19Stats.length; i++) {
          totaldeaths += res2.body.data.covid19Stats[i].deaths;
        }

        for (let i = 0; i < res2.body.data.covid19Stats.length; i++) {
          totalcases += res2.body.data.covid19Stats[i].confirmed; 
        }

        for (let i = 0; i < res2.body.data.covid19Stats.length; i++) {
          recoveredcases += res2.body.data.covid19Stats[i].recovered;
        }

        let country = res2.body.data.covid19Stats[0].country;

        message = "Currently the World has " + totalcases+ " confirmed cases of which " + totaldeaths + " have died and " + recoveredcases + " have recovered.";

        twiml.message(message);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(twiml.toString());

      }
    else {
      let message = "We've hit an error here! It is likely your country was not found.";
      twiml.message(message);
      res.writeHead(200, {'Content-Type': 'text/xml'});
      res.end(twiml.toString());
    }
  });
});

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/views/index.html');
});

const port = 3000;
app.listen(port, () => console.log(`[+] Express server started on port ${port}`));