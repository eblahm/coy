#!/usr/bin/env node
var app = require('../server/app');
var config = require('config');
const PROJECT_NAME = config.get('project_name');
const PORT = config.get('port');
const NODE_ENV = process.env.NODE_ENV;

console.log('staring the %s project on port %s with "%s" configuration', PROJECT_NAME, PORT, NODE_ENV);

app.listen(PORT);
