/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/https','N/record', 'N/file', 'N/search'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{file} file
     * @param{search} search
     */
    (https, record, file, search) => {
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

                const pfaRecId = scriptContext.request.parameters['pfaRecId'];
                log.debug("pfaRecId",pfaRecId);
                const txtFileId = scriptContext.request.parameters['txtFileId'];
                log.debug("txtFileId",txtFileId);



                payload = {
                    externalRefId:"", // Id Unico del batch
                    batch:[] //Array de objetos de pagos
                }

                fillPayloadObj(pfaRecId);
                log.debug("payload",payload);

            } catch (e) {
                log.error("Error handleGet", e);
            }


            //log.debug("Done!","")

            //sc.response.write(resObj);

        }

        function fillPayloadObj(pfaRecId) {
            try {

                var pfaRec = record.load({
                        type: 'customrecord_2663_file_admin',
                        id: pfaRecId,
                    });

                payload.externalRefId = pfaRec.getValue("custrecord_radi_oyster_ap_batch");
                var name = pfaRec.getValue("name");
                log.debug("name",name);

                //Hacer una busqueda de los bill payments que correspondan a este file
                //log.debug("Sublists: ",pfaRec.getSublists());

                fillPayloadbatch(name);


            } catch (e) {
                log.error("Error fillPayloadObj()", e);
            }
        }

        function fillPayloadbatch(name) {
            try {

                var searchVal = name + "/";
                log.debug("searchVal",searchVal);

                var vendorpaymentSearchObj = search.create({
                    type: "vendorpayment",
                    filters:
                        [
                            ["type","anyof","VendPymt"],
                            "AND",
                            ["numbertext","contains",searchVal],
                            "AND",
                            ["mainline","is","T"]
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
                        businessEmail: "", //email del vendor/entity record
                        refNumber: "", //Ref no Sublista
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
                    var vendLook = search.lookupFields({
                        type: record.Type.VENDOR,
                        id: vendId,
                        columns: ['email']
                    });
                    paymObj.businessEmail = vendLook.email;

                    paymObj.refNumber = billPaymRec.getSublistValue({
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

                    paymObj.amount = billPaymRec.getValue("total");
                    paymObj.currency = billPaymRec.getText("currency");

                    var vendRecord = record.load({
                            type: record.Type.VENDOR,
                            id: vendId,
                        });

                    paymObj.accountClabe = vendRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_psg_mx_bank_info_entity',
                        fieldId: 'custrecord_psg_mx_acct_num',
                        line: 0
                    });

                    payload.batch.push(paymObj);

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
