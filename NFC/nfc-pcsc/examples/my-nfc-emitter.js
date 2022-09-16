"use strict";

// #############
// Logs cards' uid
// #############

import { NFC } from '../src/index';
import {withCSV} from 'with-csv';

// Server setup
var express = require('express');
var app = express();
var server = app.listen(3000);

app.use(express.static('../../app'));
console.log("Server is running");
//

// Setup socket
var socket = require('socket.io');
var io = socket(server);
io.sockets.on('connection', NewConnection);

/// Handle connection
function NewConnection(socket){
    console.log("New connection connected: " + socket.id);
    //console.log(socket);f
    // Receive from client
    // socket.on('fullscreen', handleEvent);

    // function handleEvent(data){
    //     console.log(data);
    // }
}
//




const nfc = new NFC();

nfc.on('reader', reader => {

	console.log(reader.name + ' reader attached, waiting for cards ...');

	reader.on('card', card => {
        //socket.broadcast.emit('card_id', card.uid); // emit to specifi socket
        io.sockets.emit('card_id', card.uid); // emit globally
       
        // Handle file
        var dateTime = require('node-datetime');
        var dt = dateTime.create();
        //var timeFormatted = dt.format('Ymd_HMS');
        var timeFormatted = dt.format('HMS');
        //io.sockets.emit('card_id', timeFormatted); // emit globally

        // ////////////////////////////
        // // read csv record
        // ///////////////////////////
        let fs = require('fs');

        // const records = withCSV('scan-record.csv')
        //     .query(['id'])
        //     .map(row => row.id)
        //     .includes(card.uid);
        
        // console.log(records);
       
        //csvData = 'Time, ID\n1111, 2222\n3333, 4444\n';
        // let lookupCSV = require('lookup-csv');
        // const lookupTable = lookupCSV('scan-record.csv', ['ID']);
        // var matchingRows;

        // Get rows matching lookup value
        //matchingRows = lookupTable.get(card.uid);
        //console.log(matchingRows);

        // var csvData = require("fs").readFileSync("scan-record.csv", "utf8")
        // console.log(csvData);
        // console.log("Found: " + findInCSV(csvData, card.uid, 'ID'));
        
        //console.log(csvData.filter(data => data.ID === card.uid)[0].ID);
        
        //function findEmailByName(name) {
        //    return csvData.filter(data => data.Name === name)[0].Email
        //}



        // Parse CSV string
        // var data = Papa.parse(csv);
        
        // // Parse local CSV file
        // Papa.parse(file, {
        //     complete: function(results) {
        //         console.log("Finished:", results.data);
        //     }
        // });


        //////////////////////
        // write csv record
        ////////////////////////

        var scanData = [
            [timeFormatted, card.uid],
        ];

        const stream = fs.createWriteStream("../../app/scan-record.csv", { flags: 'a'});
        for (let i of scanData) { stream.write(i.join(",") + "\r\n"); }
        stream.end();
        console.log("Record written! " + card.uid);
	});

	reader.on('error', err => {
		console.error('reader error', err);
	});

	reader.on('end', () => {
		console.log(reader.name + ' reader disconnected.');
	});


});

nfc.on('error', err => {
	console.error(err);
});
