// This addon is heavily inspired on the plugins userCSP (https://github.com/patilkr/userCSP) and 
// user agent switcher (https://github.com/Fabiensk/ua-site-switch)

const {Cc,Ci,Cr} = require("chrome");

var service;
var observer;

exports.main = function() {
    observer = {
        QueryInterface: function (iid) {
            if (iid.equals(Ci.nsIObserver) ||
                iid.equals(Ci.nsISupports))
                return this;
                throw Cr.NS_ERROR_NO_INTERFACE;
        },
        observe: function(subject, topic, data)
        {
            /* Update User Agent to chrome on inbox.google.com, to battle against browser sniffing. */
            if (topic == "http-on-modify-request") {
                var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
                var host = httpChannel.getRequestHeader("Host");
                if (host == "inbox.google.com")
                    httpChannel.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36", false);
            }
            /* Update receiving Content-Security-Policy to allow blow: since that was forgotten. */
            if (topic == "http-on-examine-response") {
                var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
                if (httpChannel.responseStatus !== 200)
                    return;
                //console.log(subject.URI.spec);
                if (subject.URI.spec.substring(0,25) == "https://inbox.google.com/") {
                    httpChannel.setResponseHeader("Content-Security-Policy", "frame-src https://*.talkgadget.google.com/ 'self' blob: https://talkgadget.google.com https://accounts.google.com/ https://ssl.google-analytics.com/ https://feedback.googleusercontent.com/resources/ https://www.google.com/tools/feedback/ https://plus.google.com/ https://docs.google.com/ https://clients5.google.com/pagead/drt/dn/ https://clients5.google.com/ads/measurement/jn/ https://clients6.google.com/static/ https://mail.google.com/mail/ https://mail-attachment.googleusercontent.com/attachment/;script-src https://maps.gstatic.com/ https://*.talkgadget.google.com/ 'self' 'unsafe-inline' 'self' blob: 'unsafe-eval' 'self' https://talkgadget.google.com https://apis.google.com/ https://ajax.googleapis.com/ https://maps.googleapis.com/maps/api/ https://ssl.google-analytics.com/ https://feedback.googleusercontent.com/resources/ https://www.gstatic.com/feedback/ https://www.gstatic.com/og/ https://www.googleapis.com/appsmarket/ https://www.google.com/tools/feedback/;report-uri /cspreport", false);
                    //console.log("fixing")
                }
            }
            else if (topic == "content-document-global-created") {
                var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
                var navigator = subject.navigator;
                var userAgent = httpChannel.getRequestHeader("User-Agent");
                if (navigator.userAgent != userAgent) Object.defineProperty(XPCNativeWrapper.unwrap(navigator), "userAgent", {value : userAgent, enumerable : true});
            }
        },
        get observerService() {
            return Cc["@mozilla.org/observer-service;1"]
            .getService(Ci.nsIObserverService);
        },
        register: function()
        {
            // false: no weak reference for listener
            this.observerService.addObserver(this, "http-on-modify-request", false);
            this.observerService.addObserver(this, "content-document-global-created", false);
            this.observerService.addObserver(this, "http-on-examine-response", false);
        },
        unregister: function()
        {
            this.observerService.removeObserver(this, "http-on-modify-request");
            this.observerService.removeObserver(this, "content-document-global-created");
            this.observerService.removeObserver(this, "http-on-examine-response");
        }
    };
    observer.register();
};

exports.onUnload = function() {
    observer.unregister();
}
