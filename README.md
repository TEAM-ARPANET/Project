# CSCI 2356 Final Project
## Setting up the server
1. Navigate to server directory ``cd server``
2. Install required packages ``npm install express multer cors openai``
3. Put your own auth tokens in the ``server/authenticated.json`` file.
4. Put your own auth token in the ``extension/content.js``
5. Put OpenAI API key in ``server/apikey.txt``
6. Put private key in ``server/private.key``
7. Put certificate in ``server/server.crt``

## Running the server
To run: ``node server`` from the ``server/`` folder.