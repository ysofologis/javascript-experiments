
!function(global, $, undefined) {
    var VotedStateObserver = function (appName, messaging) {
        const MSG_TYPE_MODIFY = appName + '_modifyState';
        const MSG_TYPE_VALIDATE = appName + '_validate';

        var that = this;
        var _stateMap = {};

        var getFinalState = function (stateKeys, votes) {
            var allVoted = true;
            var finalState = {
                anyModified: false,
                modifiedStates: [],
            };
            for (var ix = 0; ix < stateKeys.length; ix ++) {
                var k = stateKeys[ix];
                if (votes[k].voted) {
                    if (votes[k].modified) {
                        finalState.modifiedStates.push(votes[k].name);
                        finalState.anyModified = true;
                    }
                } else {
                    allVoted = false;
                    break;
                }
            }
            if (allVoted) {
                return finalState;
            } else {
                return null;
            }
        };
        that.registerState = function(stateKey, stateName, listener) {
            _stateMap[stateKey] = {
                modified: false,
                name: stateName,
                listener: listener,
            };
            messaging.subscribe(MSG_TYPE_VALIDATE, listener);
        };
        that.unregisterState = function (stateKey) {
            var state = _stateMap[stateKey];
            messaging.unsubscribe(state.listener);
            state.listener = null;
            delete _stateMap[stateKey];
        };
        that.setModified = function (stateKey, modified) {
            _stateMap[stateKey].modified = modified;
            messaging.broadcastMessage( MSG_TYPE_MODIFY, { key: stateKey, modified: modified });
        };
        that.checkState = function () {
            var result = $.Deferred();
            var stateKeys = Object.keys(_stateMap);
            var votedState = {};
            for (var ix = 0; ix < stateKeys.length; ix ++) {
                var k = stateKeys[ix];
                votedState[k] = {
                    voted: false,
                    modified: false,
                    name: _stateMap[k].name,
                };
            }

            var stateListener = {
                messageArrived: function (stateInfo) {
                    votedState[stateInfo.key].voted = true;
                    votedState[stateInfo.key].modified = stateInfo.modified;
                    var finalState = getFinalState(votedState);
                    if (finalState) {
                        messaging.unsubscribe(stateListener);
                        if (finalState.anyModified) {
                            result.reject(finalState.modifiedStates);
                        } else {
                            result.resolve();
                        }
                    }
                },
            };
            messaging.subscribe(MSG_TYPE_MODIFY, stateListener);
            messaging.broadcastMessage(MSG_TYPE_VALIDATE, {});
            return result;
        };
    };
    global.createStateObserver = function (appName) {
        return new VotedStateObserver(appName, global.appMessaging);
    };
}(this, jQuery);