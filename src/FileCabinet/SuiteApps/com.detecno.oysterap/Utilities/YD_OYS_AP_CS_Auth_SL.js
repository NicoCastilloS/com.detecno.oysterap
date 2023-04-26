/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/https','N/record', './configuration'],
    /**
 * @param{https} https
 * @param{record} record
 */
    (https, record, configuration) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            try {

                if (scriptContext.request.method === 'GET') {
                    log.debug('Method...', 'GET');
                }else if (scriptContext.request.method === 'POST') {
                    log.debug('Method...', 'POST');
                    handlePost(scriptContext);

                }
            } catch (error) {

            }
        }

        function handlePost(sc){
            var reqBody = sc.request.body;
            config = configuration.getConfig();
            log.debug("config obj",config);

            //TODO: REPLACE ALL custsecret ocurrences with config object. Seguir con los demás scripts y ya
            //Send POST "create payment link request" to OCI-Oyster
            if (typeof(reqBody) != "object") {
                reqBody = JSON.parse(reqBody);
            }
            log.debug("reqBody.type", reqBody.type);
            switch (reqBody.type) {
                case "Create_Payment_Link" :
                    createPaymentLink(reqBody);
                    break;
                case "Create_Onboarding_Link" :
                    createOnboardingLink(reqBody);
                    break;
            }

            log.debug("Done!","")

            sc.response.write("OK");

        }

        function createPaymentLink (reqBody){
            log.audit("En createPaymentLink", "");
            var headerObj = {
                "Content-Type": "application/json",
                "Accept": "*/*",
                //"Authorization": https.createSecureString({input:'{custsecret_radi_oys_oci_token}'}),
                "Authorization": config.token,
                "BusinessIdentifier": reqBody.businessIdentifier
            };
            var response = https.post({
                //url: https.createSecureString({input:'{custsecret_radi_oys_oci_pay_link_url}'}),
                url: config.linkUrl,
                body: JSON.stringify(reqBody.body),
                headers: headerObj
            });
            log.debug('Full response: ',response);
            log.debug('Response body: ',response.body);

            var responseBody = response.body;

            if (typeof(responseBody) != "object") {
                responseBody = JSON.parse(responseBody);
            }

            //Update record
            record.submitFields({
                type: "customrecord_payment_links",
                id: reqBody.idPayLinkRec,
                values: {
                    custrecord_response_link_req: JSON.stringify(responseBody),
                    custrecord_link_req_id:responseBody.IdRequest
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            });

        }

        function createOnboardingLink (reqBody){
        log.audit("En createOnboardingLink", "");
        log.debug("reqBody", JSON.stringify(reqBody));
        log.debug("22","22");
            log.debug("config.token",config.token);
            //send https request POST
            var headerObj = {
                "Content-Type": "application/json",
                "Accept": "*/*",
                //"Authorization": https.createSecureString({input:'{custsecret_radi_oys_oci_token}'})
                "Authorization": config.token
            };
            log.debug("Header formed", "");
            log.debug("Sending POST...", "");

            var response = https.post({
                url: config.onboardingUrl,
                body: JSON.stringify(reqBody.body),
                headers: headerObj
            });
            log.debug("got respose", response);

            var responseBody = JSON.parse(response.body);
            log.debug('responseBody',responseBody);


            var subRec = record.load({
                type: record.Type.SUBSIDIARY,
                id: reqBody.subsidiary
            });

            subRec.setValue('custrecord_response_onboarding_req_oysap',JSON.stringify(responseBody));
            subRec.setValue('custrecord_subs_onboarding_req_id_oys_ap',responseBody.IdRequest);

            if (responseBody.Code == "201") {
                subRec.setValue('custrecord_status_oyster_ap',2);
            }else{
                subRec.setValue('custrecord_status_oyster_ap',5);
            }

            subRec.save();

        }


        return {onRequest}

    });
