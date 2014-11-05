angular.module('wakery', [])
    .controller('WakeryController', ['$scope', function ($scope) {
        $scope.result = null;

        $scope.ipEndpoint = null;
        $scope.macAddress = null;

        $scope.wakeOnLan = function () {
            var socket = new Promise(function (resolve, reject) {
                chrome.sockets.udp.create(
                    new chrome.sockets.udp.SocketProperties(), resolve
                );
            });

            var bind = socket.then(function (socketID) {
                return new Promise(function (resolve, reject) {
                    chrome.sockets.udp.bind(socketID, "0.0.0.0", 0, function (result) {
                        return result ? resolve(socketID) : reject(socketID);
                    });
                });
            });

            var send = bind.then(function (socketID) {
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
                        writeMACAddress(view, (j+1)*6, $scope.macAddress);
                    }

                    chrome.sockets.udp.send(
                        socketID, buffer, $scope.ipEndpoint, 9, function (result, bytesSent) {
                            return result === 0 ? resolve(bytesSent) : reject(result);
                        }
                    );
                });
            });

            send.then(function (bytesSent) {
                $scope.result = bytesSent;
            });
        };
    }]);