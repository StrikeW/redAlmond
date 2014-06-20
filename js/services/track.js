(function () {
    var track;
    track = function ($window, teleMethod, GA_ACCOUNT) {
        this.event = (function (_this) {
            return function (category, action, label) {
                return $window.ga('send', 'event', category, action, label)
            }
        })(this);
        this.pv = (function (_this) {
            return function (url) {
                if (url == null) {
                    url = void 0
                }
                if (url) {
                    return $window.ga('send', 'pageview', url)
                } else {
                    return $window.ga('send', 'pageview')
                }
            }
        })(this);
        this.init = (function (_this) {
            return function () {
                return $window.ga('create', GA_ACCOUNT, 'auto')
            }
        })(this);
        teleMethod.registerService('track', this, ['event', 'pv']);
        return this
    };
    define(['../app', './teleMethod'], function (app) {
        return app.service('track', track)
    })
}).call(this);
