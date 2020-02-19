#!/bin/bash

curl -v -H "Content-Type: application/javascript" --data-binary @test.js "http://127.0.0.1:23119/debug-bridge/execute?password=02a9a6a7-ae92-4983-85df-3eb6fb506054"
