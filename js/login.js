(function () {
    var AccountController, LoginController, MainController, libs;
    MainController = function ($scope, $rootScope, $location, $timeout, storage, track) {
        $rootScope.state = "account";
        $rootScope.name = '';
        $rootScope.isVirgin = !storage.get('lastLoginName');
        if ($rootScope.isVirgin) {
            track.event('virgin-login-0528', 'visit')
        }
        $scope.source = function () {
            return $location.search().source
        };
        return $rootScope.switchState = function (state) {
            return $rootScope.state = state
        }
    };
    AccountController = function ($scope, $rootScope, $http, $timeout, $log, validate, track, SERVER, userManager, pageManager, storage) {
        var doRegister;
        $scope.focuses = {
            name: true
        };
        $rootScope.$watch('state', function (newVal) {
            if (newVal === 'account') {
                return $scope.focuses.name = true
            }
        });
        $scope.checkName = function (name) {
            return validate.phone(name) || validate.email(name)
        };
        $scope.checkNameExistence = function () {
            var field, name;
            field = $scope.account.name;
            field.$stateVisible = true;
            name = $rootScope.name;
            if ($scope.account.$valid) {
                $scope.disableInput = true;
                return $http({
                    method: 'GET',
                    url: "https://" + SERVER + "/user/name",
                    params: {
                        name: name
                    }
                }).success(function (resp) {
                    $scope.disableInput = false;
                    if (resp.exists) {
                        $rootScope.switchState('login');
                        if ($rootScope.isVirgin) {
                            return track.event('virgin-login-0528', 'login-start')
                        }
                    } else {
                        return doRegister()
                    }
                }).error(function () {
                    $scope.disableInput = false;
                    return alert('网络出现错误，请稍后重试')
                })
            }
        };
        return doRegister = function () {
            $scope.disableInput = true;
            return $http({
                method: 'POST',
                url: "https://" + SERVER + "/user/register_with_name",
                params: {
                    name: $rootScope.name
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (resp) {
                if (resp.error) {
                    alert(resp.message);
                    return $scope.disableInput = false
                } else {
                    track.pv("/chrome-extension/register/success");
                    if ($rootScope.isVirgin) {
                        track.event('virgin-login-0528', 'register-success')
                    }
                    userManager.load(resp);
                    userManager.checkin().then(function () {
                        return pageManager.gotoOptions("#domains?source=afterRegister")
                    });
                    return storage.set('afterRegister', true)
                }
            }).error(function () {
                $scope.disableInput = false;
                return alert('网络错误，请稍后重试')
            })
        }
    };
    LoginController = function ($scope, $rootScope, $http, $log, $timeout, userManager, pageManager, validate, track, SERVER) {
        $scope.focuses = {
            password: false
        };
        $scope.password = '';
        $scope.resetPasswordUrl = "https://" + SERVER + "/user/password/reset";
        $rootScope.$watch('state', function (state) {
            if (state === 'login') {
                return $scope.focuses.password = true
            }
        });
        return $scope.doLogin = function () {
            var field;
            field = $scope.login.password;
            field.$stateVisible = true;
            if (!$scope.login.$valid) {
                return false
            }
            $scope.disableInput = true;
            $http({
                method: 'POST',
                url: "https://" + SERVER + "/user/login",
                params: {
                    name: $rootScope.name,
                    password: $scope.password
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (resp) {
                if (resp.error) {
                    if (resp.error === 'PASSWORD') {
                        field.$setValidity('errorPassword', false)
                    } else {
                        alert(resp.message)
                    }
                    return $scope.disableInput = false
                } else {
                    track.pv("/chrome-extension/login/success");
                    if ($rootScope.isVirgin) {
                        track.event('virgin-login-0528', 'login-success')
                    }
                    userManager.load(resp);
                    userManager.checkin().then(function () {
                        return pageManager.gotoOptions()
                    });
                    return $log.info('login ok!')
                }
            }).error(function () {
                $scope.disableInput = false;
                return alert('网络错误，请稍后重试')
            });
            return false
        }
    };
    libs = ['underscore', 'angular', 'angular_ui_keypress', 'angular_ui_utils', 'angular_strap_tpl', 'services/domainUtils', 'services/validate', 'services/pageManager', 'services/storage', 'services/userManager', 'services/track', 'directives/focusBind', 'directives/fixAutoFill', 'directives/formState'];
    require(['config'], function () {
        return requireWithRetry(libs, function (_, angular) {
            var login;
            login = angular.module('login', ['ui.keypress', 'mgcrea.ngStrap', 'app', 'ui.utils']);
            login.controller({
                MainController: MainController,
                AccountController: AccountController,
                LoginController: LoginController
            });
            login.run(function (track) {
                return track.pv('/chrome-extension/login')
            });
            return angular.element(document).ready(function () {
                return angular.bootstrap(document, ['login'])
            })
        })
    })
}).call(this);
