# papers
## implementing vms for interactive UI and heavy calculations
diagram
[ frontEnd vm(browser)] -- [ backEnd (browser main thread/worker/nodejs) ] -- [more service vms] 
### motivation
Interactive UI with heavy calculations is a challange.
Heavy calculations should reside on the local browser worker combined with remote servers
- server - less interactive (can not really support D&D)
- client main thread - browser freezing

This paper suggests architecture & protocols to implement dynamic distributed interactive UI

major ideas
- the FE protocol is delta-HTML <-> high level user events
- server state is called headless widget and contains
  - the html sent to the client
  - stored contexts to handle user events
  - watchable data stores
  - passive data stores
- highly interactive flows code is sent to the front-end. E.g. D&D



    - code is json - code path
    - watchable json data (data)
    - simple client 'state' is sent to server on request
    - data mapping as json-paths on html

