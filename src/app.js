var express = require("express");
var server = express();
var bodyParser = require("body-parser");

model = {
  clients: {}
}

model.reset = function () {
  model.clients = {}
}

model.addAppointment = (client, date) => {
  if (!model.clients[client]) {
    model.clients[client] = [];
    model.clients[client].push({ ...date, status: 'pending' });
  }
  else {
    model.clients[client].push({ ...date, status: 'pending' })
  }
}

model.attend = (name, date) => {
  let apointment = model.clients[name].find(d => d.date === date);
  apointment.status = 'attended';
}

model.expire = (name, date) => {
  let apointment = model.clients[name].find(d => d.date === date);
  apointment.status = 'expired';
}

model.cancel = (name, date) => {
  let apointment = model.clients[name].find(d => d.date === date);
  apointment.status = 'cancelled';
}

model.erase = (name, param) => {
  if (param === 'cancelled' || param === 'attended' || param === 'expired') {
    let apointments = model.clients[name].filter(d => d.status !== param);
    model.clients[name] = apointments;
  }
  else {
    let apointment = model.clients[name].find(d => d.date === param);
    let index = model.clients[name].indexOf(apointment);
    model.clients[name].splice(index, 1);
  }
}

model.getAppointments = (name, param) => {
  if (param) {
    let apointments = model.clients[name].filter(d => d.status === param);
    return apointments
  }
  else {
    return model.clients[name]
  }
}

model.getClients = () => {
  return Object.keys(model.clients)
}

server.use(bodyParser.json());

server.get('/api', (req, res) => {
  res.send(model.clients)
})

server.post('/api/Appointments', (req, res) => {
  if (!req.body.client) {
    res.status(400).send('the body must have a client property');
  }
  else if (typeof req.body.client !== 'string') {
    res.status(400).send('client must be a string');
  }
  else {
    model.addAppointment(req.body.client, req.body.appointment)
    let apointment = model.clients[req.body.client].find(d => d.date === req.body.appointment.date)
    res.send(apointment)
  }
})

server.get('/api/Appointments/:name', (req, res) => {
  let clients = model.getClients()
  let client = clients.includes(req.params.name)
  if(req.params.name === 'clients') {
    res.send(clients)
  }
  else if (req.params.name !== 'clients' && client === false) {
    res.status(400).send('the client does not exist');
  }
  else {
    let date = decodeURI(req.query.date)  
    let apointments = model.clients[req.params.name]
    if (!apointments.find(d => d.date === date)) {
      res.status(400).send('the client does not have a appointment for that date');
    }
    else if (req.query.option !== 'attend' && req.query.option !== 'expire' && req.query.option !== 'cancel') {
      res.status(400).send('the option must be attend, expire or cancel');
    }
    else if(req.query.option === 'attend') {
      model.attend(req.params.name, date);
      let apointments2 = model.getAppointments(req.params.name)
      let apointment = apointments2.find(d => d.date === date)
      res.send(apointment);
    }
    else if (req.query.option === 'expire') {
      model.expire(req.params.name, date)
      let apointments2 = model.getAppointments(req.params.name)
      let apointment = apointments2.find(d => d.date === date)
      res.send(apointment);
    }
    else if (req.query.option === 'cancel') {
      model.cancel(req.params.name, date)
      let apointments2 = model.getAppointments(req.params.name)
      let apointment = apointments2.find(d => d.date === date)
      res.send(apointment);
    }
  }
});

server.get('/api/Appointments/:name/erase', (req, res) => {
  let clients = model.getClients()
  let client = clients.includes(req.params.name)
  if (client === false) {
    res.status(400).send('the client does not exist');
  }
  else if(req.query.date === 'cancelled' || req.query.date === 'attended' || req.query.date === 'expired'){
    let apointments = model.getAppointments(req.params.name)
    let apointment = apointments.filter(d => d.status === req.query.date)
    model.erase(req.params.name, req.query.date)
    res.send(apointment)
  }
  else{
    let apointments = model.getAppointments(req.params.name)
    let apointment = apointments.filter(d => d.date === req.query.date)
    model.erase(req.params.name, req.query.date)
    res.send(apointment)
  }
})

server.get('/api/Appointments/getAppointments/:name', (req, res) => {
  res.send(model.getAppointments(req.params.name, req.query.status))
})


server.listen(3000);
module.exports = { model, server };
