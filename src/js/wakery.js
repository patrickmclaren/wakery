angular.module('wakery', [])
    .controller('WakeryController', ['$scope', '$q', function ($scope, $q) {
        chrome.storage.sync.get({ machines: [] }, function (data) {
            $scope.machines = data.machines;

            $scope.$apply();
        });

        $scope.syncMachines = function () {
            chrome.storage.sync.set({ machines: $scope.machines }, function () {
                $scope.addLastError();
            });
        };

        $scope.createMachine = function () {
            $scope.machines.push({
                name: $scope.machine.name,
                ipAddress: $scope.machine.ipAddress,
                macAddress: $scope.machine.macAddress
            });

            $scope.syncMachines();

            $scope.$apply();
        };

        $scope.deleteMachine = function () {
            $scope.machines.splice($scope.machines.indexOf($scope.machine), 1);
            $scope.syncMachines();

            $scope.machine = null;

            $scope.$apply();
        };

        // TODO(patrick): move to service
        $scope._addMsg = function (msg, listName) {
            if (!angular.isDefined($scope[listName])) {
                $scope[listName] = [msg];
            } else {
                $scope[listName].push(msg);
            }
        };

        $scope.clearMessages = function () {
            $scope.infoMessages = [];
            $scope.errorMessages = [];
        };

        $scope.addInfo = function (info) {
            $scope._addMsg(info, "infoMessages");
        };

        $scope.addError = function (error) {
            $scope._addMsg(error, "errorMessages");
        };

        $scope.addLastError = function () {
            var lastError = chrome.runtime.lastError;
            if (lastError) {
                $scope.addError(lastError.message);
            }
        };

        $scope.wakeOnLan = function () {
            $q(function (resolve, reject) {
                $scope.addInfo('Creating socket');
                
                chrome.sockets.udp.create(function (socket) {
                    resolve(socket.socketId);
                });
            })
                .then(function (socketID) {
                    $scope.addInfo('Binding socket to 0.0.0.0');

                    return new Promise(function (resolve, reject) {
                        chrome.sockets.udp.bind(socketID, "0.0.0.0", 0, function (result) {
                            if (result >= 0) {
                                resolve(socketID);
                            } else {
                                reject(result);
                            }
                        });
                    });
                })
                .then(function (socketID) {
                    // NOTE(patrick): Don't make a habit of doing this
                    // kind of thing.
                    var message = 'Sending "Magic Packet" to ';
                    message += $scope.machine.ipAddress;
                    message += ':9 (';
                    message += $scope.machine.macAddress + ')';
                    
                    $scope.addInfo(message);

                    return new Promise(function (resolve, reject) {
                        function writeMACAddress(buffView, offset, mac) {
                            angular.forEach(mac.split(':'), function (elm, idx) {
                                buffView.setInt8(offset + idx, parseInt(elm, 16));
                            });
                        }

                        var buffer = new ArrayBuffer(102);
                        var view = new DataView(buffer);

                        for (var i = 0; i < 6; i++) {
                            view.setInt8(i, 255);
                        }

                        for (var j = 0; j < 16; j++) {
                            writeMACAddress(view, (j+1)*6, $scope.machine.macAddress);
                        }

                        chrome.sockets.udp.send(
                            socketID, buffer, $scope.machine.ipAddress, 9, function (result) {
                                if (result.resultCode >= 0) {
                                    resolve(result.bytesSent);
                                } else {
                                    $scope.addLastError();
                                    reject(result);
                                }
                            }
                        );
                    });
                })
                .then(function (bytesSent) {
                    $scope.addInfo('Sent ' + bytesSent + ' bytes!');
                })
                .finally(function () {
                    $scope.$apply();
                });
        };

        $scope.$watch('machine', function (machine) {
            $scope.clearMessages();
        });
    }])
    .directive('newMachine', function () {
        return {
            restrict: 'E',
            template: '<button class="btn btn-default">New Machine</button>',
            link: function (scope, element, attrs) {
                element.click(function () {
                    scope.machine = {};
                    scope.$apply();

                    var machineForm = document.getElementsByClassName('machine-form')[0];
                    angular.element(machineForm).removeClass('hide');

                    var existingMachine = document.getElementsByClassName('main')[0];
                    angular.element(existingMachine).addClass('hide');
                });
            }
        };
    })
    .directive('createMachine', function () {
        return {
            restrict: 'E',
            template: '<button class="btn btn-primary">Add Machine</button>',
            link: function (scope, element, attrs) {
                element.click(function () {
                    scope.createMachine();

                    var machineForm = document.getElementsByClassName('machine-form')[0];
                    angular.element(machineForm).addClass('hide');

                    var existingMachine = document.getElementsByClassName('main')[0];
                    angular.element(existingMachine).removeClass('hide');
                });
            }
        };
    });
