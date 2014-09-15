// REQUIRES
var _ = require('lodash');
var S = require('string');
var he = require('he');
var Q = require('q');


var DEFAULT_OPTS = {
      maxLines: 5,
      userName: '',
      root: '.commandy',
      typeSpeed: 100,
      lineSpeed: 500
    };


// UTIL FUNCTIONS
function preserve_spaces(s){
  return s.replace(/\s+/g, "nbsp&");
}

function arrayify (s) {
  return s.split('');
}

// DOM Stuff

function addTerminal(self) {
  var container = document.querySelector(self.opts.root),
      textWrapper = document.createElement('div');
  container.appendChild(textWrapper);
  textWrapper.style.minHeight = (self.opts.maxLines * '25') + 'px';
  textWrapper.className = 'commandy-text-container';

}

function addLine(self) {
  var container = document.querySelector(self.opts.root).querySelector('div'),
      line = document.createElement('p');
  line.className = "line";
  container.appendChild(line);
  return line;
}

function processCommands(self){
  self.commands = _.chain(self.opts.commands).
                    map(arrayify).
                    // map(function(cmd){
                      // return _.map(cmd, preserve_spaces);
                    // }).
                    value();
};

function typeCommand(self, command, domLine){
  // TODO: this should return a promise when complete
  var deferred = Q.defer();

  _.each(command, function(cmd, i){

    window.setTimeout(function(){
      var lineText = domLine.innerHTML;
      domLine.innerHTML = lineText + cmd;
      if( i+1 === command.length){
        console.log("done");
        deferred.resolve('done');
      }
    }, i*self.opts.typeSpeed);

  });

  return deferred.promise;
}

function runCommands(self, command, idx, commands) {
  var next = commands[idx+1],
      domLine = addLine(self);
  if(next){
    typeCommand(self, command, domLine).
    then(function(){
      window.setTimeout(function(){
        runCommands(self, next, idx+1, commands);
      }, self.opts.lineSpeed);
    });
  }else{
    typeCommand(self, command, domLine);
  }
}

function run(self){
  // type out a command, then type another, etc.
  addTerminal(self);
  runCommands(self, self.commands[0], 0, self.commands);
};

module.exports = {
  init: function init(opts){
    this.opts = _.assign(DEFAULT_OPTS, opts)
    processCommands(this);
    run(this);
  }
}
