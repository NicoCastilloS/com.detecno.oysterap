define(['N/runtime', 'N/search', 'N/encode'], function (runtime, search, encode) {

    function getConfig(){
        try {
            var config = {
                onboardingUrl:{},
                linkUrl:{},
                token:{}
            }

            var customrecord_radi_oyster_ap_configSearchObj = search.create({
                type: "customrecord_radi_oyster_ap_config",
                filters:
                    [
                        ["internalidnumber","equalto","1"]
                    ],
                columns:
                    [
                        "custrecord_radi_oys_oci_onb_url",
                        "custrecord_radi_oys_oci_ap_link",
                        "custrecord_radi_oys_oci_token"
                    ]
            });
            var searchResultCount = customrecord_radi_oyster_ap_configSearchObj.runPaged().count;
            log.debug("customrecord_radi_oyster_ap_configSearchObj result count",searchResultCount);
            customrecord_radi_oyster_ap_configSearchObj.run().each(function(result){
                config.onboardingUrl = result.getValue("custrecord_radi_oys_oci_onb_url");
                config.linkUrl = result.getValue("custrecord_radi_oys_oci_ap_link");
                config.token = encode.convert({
                    string: result.getValue("custrecord_radi_oys_oci_token"),
                    inputEncoding: encode.Encoding.BASE_64,
                    outputEncoding: encode.Encoding.UTF_8
                });
            });

            log.debug("Returning config:",config);
            return config;
        } catch (e) {
            log.error("getConfig()", e);
        }
    }

    function getServiceURL(serviceName) {
        var environment = runtime.envType;
        log.debug("URL Resolver call", "service name: " + serviceName)
        if (SERVICES.hasOwnProperty(serviceName)) {
            log.debug("URL Resolver return", "url: " + SERVICES[serviceName][environment])
            return SERVICES[serviceName][environment]
        } else throw "Service " + serviceName + " is invalid for " + environment + " environment or does not exist."
    }

    function getSearchURL(searchId, searchType) {
        var account = runtime.accountId.toLowerCase()
        account = account.replace('_', '-')
        var searchUrl = "https://" + account + ".app.netsuite.com/app/common/search/searchresults.nl?"
        if (searchType != null && searchType != "") {
            searchUrl += "seartype=" + searchType
            searchUrl += "&searchid=" + searchId
        } else searchUrl += "searchid=" + searchId

        return searchUrl
    }

    return {
        getSearchURL: getSearchURL,
        getServiceURL: getServiceURL,
        getConfig:getConfig
    }
})