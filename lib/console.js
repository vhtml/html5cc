var log = console.log.bind(console);
console.log = function(){
	log((new Date()).toLocaleString() + '--------' + JSON.stringify(arguments));
};

module.exports = console;