/**
 * Created by abhishek on 14/01/17.
 */
'use strict';
 
const ping = require('ping');
const config = require('./config');
const helper = require('sendgrid').mail;
const moment = require('moment');


let intervalTime = 20000;
let anyProblem = false;

const hosts = [
    {
        hostname : "google.com",
        description : "Public Google .com"
    },
    {
        hostname: "103.82.44.1",
        description: "ANB Core (CCR-1009)"
    },
    {
        hostname : "103.82.44.6",
        description : "ANB NAS INDERLOK (RB3011 UiaS)"
    },
    {
        hostname : "103.82.44.128",
        description : "Synnefo"
    }
];


function checkHosts() {
    anyProblem  = false;
    hosts.forEach(function (host) {
        ping.sys.probe(host.hostname , function (isAlive) {
            if(isAlive)
                return;


            anyProblem = true;
            let from = "network-monitor@alphanetbroadband.com",
                to = new helper.Email("sales@alphanetbroadband.com"),
                subject = "Network WatchDog Ping Failed",
                content = new helper.Content("text/html" , `
            Ping to the following host failed: ${host.hostname}  </br>
            Description : ${host.description}
            Last checked : ${moment().format("dddd, MMMM Do YYYY, h:mm:ss a")}
            `);

            const mail = new helper.Mail(from , subject , to , content);
            const sg = require('sendgrid')(config.sendgrindAPI);
            const request = sg.emptyRequest({
                method : 'POST',
                path : '/v3/mail/send',
                body : mail.toJSON()
            });

            sg.API(request , function (err , response) {
                if(err)
                {
                    console.error("cannot send host email. Error : " , err);
                }
                else
                {
                    console.log("Email Sent!");
                    intervalTime = 2000;
                }
            });
        });
    });


    if(! anyProblem )
        intervalTime = 20000;


    setTimeout(checkHosts , intervalTime );
}


setTimeout(checkHosts , intervalTime);



