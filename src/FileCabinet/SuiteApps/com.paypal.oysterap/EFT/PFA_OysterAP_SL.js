/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/https','N/record', 'N/file', 'N/search','N/runtime','../Utilities/configuration'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{file} file
     * @param{search} search
     * @param{runtime} runtime
     */
    (https, record, file, search, runtime, configuration) => {
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
                    handleGet(scriptContext);
                }else if (scriptContext.request.method === 'POST') {
                    log.debug('Method...', 'POST');


                }
            } catch (error) {

            }
        }

        function handleGet(scriptContext){

            try {
                var slResponse = {
                    success:false,
                    message:""
                };
                config = configuration.getConfig();

                const pfaRecId = scriptContext.request.parameters['pfaRecId'];
                log.debug("pfaRecId",pfaRecId);
                const txtFileId = scriptContext.request.parameters['txtFileId'];
                log.debug("txtFileId",txtFileId);



                body = {
                    payload:{
                        sourceAppID:"", // Id Unico del batch
                        paymentList:[], //Array de objetos de pagos
                        receiver: {
                            accountId: runtime.accountId
                        }

                    }
                }

                fillPayloadObj(pfaRecId);
                var bizId = getBusinessIdentifier(pfaRecId);
                log.debug("bizId",bizId);
                log.debug("Request body to send",body);
                if(body.payload.paymentList.length > 0 && bizId){
                    log.debug("Request body to send",body);
                    
                    var headerObj = {
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        //"Authorization": https.createSecureString({input:'{custsecret_radi_oys_oci_token}'}),
                        "Authorization": config.token,
                        "BusinessIdentifier": bizId
                    };
                    log.debug("Header formed, sending req", "");

                    var response = https.post({
                        //url: https.createSecureString({input:'{custsecret_radi_oys_oci_ap_link}'}),
                        url: config.linkUrl,
                        body: JSON.stringify(body),
                        headers: headerObj
                    });
                    log.debug("response",response);
                    log.debug("response body",JSON.parse(response.body));
                    var responseBody = JSON.parse(response.body);

                    //Todo if response success then set success to true else to false
                    //Set success to true
                    if(responseBody.Success && responseBody.Code == 200 ){
                        //Todo Almacenar IdRequest
                        slResponse.success = true;
                    }else{
                        slResponse.message = responseBody.Messages;
                    }

                    //Todo Set payment link field value in PFA record
                }








            } catch (e) {
                log.error("Error handleGet", e);
            }


            //log.debug("Done!","")
            log.debug("Responding to CS",slResponse);
            scriptContext.response.write(JSON.stringify(slResponse));
        }

        function fillPayloadObj(pfaRecId) {
            try {
                log.debug("pfaRecId",pfaRecId);
                var pfaRec = record.load({
                        type: 'customrecord_2663_file_admin',
                        id: pfaRecId,
                    });

                body.payload.sourceAppID = pfaRec.getValue("custrecord_radi_oyster_ap_batch");
                var subsBatch = pfaRec.getValue("custrecord_2663_payment_subsidiary");
                log.debug("subsBatch",subsBatch);
                var name = pfaRec.getValue("name");
                log.debug("name",name);

                //Hacer una busqueda de los bill payments que correspondan a este file
                //log.debug("Sublists: ",pfaRec.getSublists());

                fillPayloadbatch(name, subsBatch, pfaRecId);


            } catch (e) {
                log.error("Error fillPayloadObj()", e);
            }
        }

        function getBusinessIdentifier(pfaRecId) {
            try {
                var pfaLook = search.lookupFields({
                    type: "customrecord_2663_file_admin",
                    id: pfaRecId,
                    columns: ['custrecord_2663_payment_subsidiary']
                });

                var subId = pfaLook.custrecord_2663_payment_subsidiary[0].value;

                log.debug("Got subId",subId);

                var subsLook = search.lookupFields({
                    type: record.Type.SUBSIDIARY,
                    id: subId,
                    columns: ['custrecord_subs_business_identifieroysap']
                });
                var businessIdentifier = subsLook.custrecord_subs_business_identifieroysap;

                return businessIdentifier;

            } catch (e) {
                log.error("Error getBusinessIdentifier()", e);
            }
        }

        function fillPayloadbatch(name, subs, pfaRecId) {
            try {

                var searchVal = name + "/";
                log.debug("searchVal",searchVal);
                log.debug("subs",subs);
                log.debug("pfaRecId",pfaRecId);
                var vendorpaymentSearchObj = search.create({
                    type: "vendorpayment",
                    filters:
                        [
                            ["type","anyof","VendPymt"],
                            "AND",
                            ["mainline","is","T"],
                            "AND",
                            ["custbody_9997_pfa_record","anyof",pfaRecId]

                            /*["numbertext","contains",searchVal],
                            "AND",

                            ["subsidiary","anyof",subs],
                            "AND",*/

                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                var searchResultCount = vendorpaymentSearchObj.runPaged().count;
                log.debug("vendorpaymentSearchObj result count",searchResultCount);
                vendorpaymentSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    var billPaym = result.id
                    log.debug("billPaym",billPaym);

                    var paymObj = {
                        paymentId: "", //oyster id
                        businessName: "", //entity
                        email: "", //email del vendor/entity record
                        rfc:"", //RFC del vendor
                        invoceNumber: "", //Ref no Sublista
                        dueDate: "", //Date due sublista
                        amount: "", // total
                        currency: "", //currency
                        accountClabe: ""
                    }

                    var billPaymRec = record.load({
                            type: record.Type.VENDOR_PAYMENT,
                            id: billPaym,
                        });

                    paymObj.paymentId = billPaymRec.getValue("custbody_radi_oyster_ap_paym_id");
                    paymObj.businessName = billPaymRec.getText("entity");
                    var vendId = billPaymRec.getValue("entity");
                    var suiteTaxEnabled = checkForSuiteTax();
                    if (suiteTaxEnabled){
                        var vendLook = search.lookupFields({
                            type: record.Type.VENDOR,
                            id: vendId,
                            columns: ['email', 'custentity_mx_rfc']
                        });
                        paymObj.rfc = vendLook.custentity_mx_rfc;
                    }else {
                        var vendLook = search.lookupFields({
                            type: record.Type.VENDOR,
                            id: vendId,
                            columns: ['email', 'taxidnum']
                        });
                        paymObj.rfc = vendLook.taxidnum;
                    }


                    paymObj.email = vendLook.email;


                    paymObj.invoceNumber = billPaymRec.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'refnum',
                        line: 0
                    });

                    var dueDate = billPaymRec.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'duedate',
                        line: 0
                    });

                    var day = dueDate.getDate().toString().padStart(2, '0');
                    var month = (dueDate.getMonth() + 1).toString().padStart(2, '0');
                    var year = dueDate.getFullYear().toString();

                    paymObj.dueDate = `${day}-${month}-${year}`;
                    //TODO Uncomment below line to use actual amounts
                    //paymObj.amount = billPaymRec.getValue("total") * 100;
                    paymObj.amount = 50000;
                    //TODO Uncomment below line for prod
                    //paymObj.currency = billPaymRec.getText("currency");
                    paymObj.currency = "MXN";
                    var vendRecord = record.load({
                            type: record.Type.VENDOR,
                            id: vendId,
                        });

                    paymObj.accountClabe = vendRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_psg_mx_bank_info_entity',
                        fieldId: 'custrecord_psg_mx_acct_num',
                        line: 0
                    });

                    body.payload.paymentList.push(paymObj);

                    //log.debug("paymObj",paymObj);

                    return true;
                });

                /*
                vendorpaymentSearchObj.id="customsearch1680129848862";
                vendorpaymentSearchObj.title="Bill Payment by tranid contains (copy)";
                var newSearchId = vendorpaymentSearchObj.save();
                */

            } catch (e) {
                log.error("Error fillPayloadbatch()", e);
            }
        }

        function checkForSuiteTax() {
            try {
                var suiteTax = false;
                suiteTax = runtime.isFeatureInEffect({
                    feature: 'SUITETAXENGINE'
                });

            } catch (e) {
                log.error("Error checkForSuiteTax()", e);
            }

            return suiteTax;
        }





    /*    function createPaymentLink (reqBody){
            log.audit("En createPaymentLink", "");
            var headerObj = {
                "Content-Type": "application/json",
                "Accept": "*!/!*",
                "Authorization": https.createSecureString({input:'{custsecret_radi_oys_oci_token}'}),
                "BusinessIdentifier": reqBody.businessIdentifier
            };
            var response = https.post({
                url: https.createSecureString({input:'{custsecret_radi_oys_oci_pay_link_url}'}),
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
            log.debug("reqBody", JSON.stringify(reqBody))
            //send https request POST
            var headerObj = {
                "Content-Type": "application/json",
                "Accept": "*!/!*",
                "Authorization": https.createSecureString({input:'{custsecret_radi_oys_oci_token}'})
            };
            log.debug("Header formed...", "");

            var response = https.post({
                url: https.createSecureString({input:'{custsecret_radi_oys_oci_onb_url}'}),
                body: JSON.stringify(reqBody.body),
                headers: headerObj
            });

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

        }*/


        return {onRequest}

    });
