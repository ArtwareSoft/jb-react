"use strict";
function init(modules) {
    var ts = modules.typescript;
    function create(info) {
        // Get a list of things to remove from the completion list from the config object.
        // If nothing was specified, we'll just remove 'caller'
        var whatToRemove = info.config.remove || ["caller"];
        // Diagnostic logging
        info.project.projectService.logger.info("I'm getting set up now! Check the log for this message.");
        // Set up decorator
        var proxy = Object.create(null);
        var _loop_1 = function (k) {
            var x = info.languageService[k];
            proxy[k] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return x.apply(info.languageService, args);
            };
        };
        for (var _i = 0, _a = Object.keys(info.languageService); _i < _a.length; _i++) {
            var k = _a[_i];
            _loop_1(k);
        }
        // Remove specified entries from completion list
        proxy.getCompletionsAtPosition = function (fileName, position) {
            var prior = info.languageService.getCompletionsAtPosition(fileName, position, null);
            var oldLength = prior.entries.length;
            prior.entries = prior.entries.filter(function (e) { return whatToRemove.indexOf(e.name) < 0; });
            // Sample logging for diagnostic purposes
            if (oldLength !== prior.entries.length) {
                var entriesRemoved = oldLength - prior.entries.length;
                info.project.projectService.logger.info("Removed " + entriesRemoved + " entries from the completion list");
            }
            return prior;
        };
        return proxy;
    }
    return { create: create };
}
module.exports = init;
