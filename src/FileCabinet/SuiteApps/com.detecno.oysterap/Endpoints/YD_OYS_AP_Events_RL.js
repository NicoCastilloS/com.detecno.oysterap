/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/record', 'N/search', 'N/email', 'N/render'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{email} email
 * @param{render} render
 */
    (record, search, email,render) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {
             log.debug('Received GET request: ', JSON.stringify(requestParams));
        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {
            log.debug('Received PUT request: ', JSON.stringify(requestBody));
        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {

            try {


                  log.debug('requestBody en string',JSON.stringify(requestBody));
                  //log.debug('requestId',requestBody.requestId);
                  //PL Events and Onboarding events for AP & PL.
                  switch(requestBody.type) {
                    /*case "Onboarding_PaymentLinks":
                    if(requestBody.requestId && requestBody.url && requestBody.success)
                    {
                    //Create Onboarding link record
                    var recOnboarding = record.create({
                        type: "customrecord_yd_oys_onboard_links",
                        isDynamic: true
                    });

                    recOnboarding.setValue('custrecord_yd_oys_request_id',requestBody.requestId);
                    recOnboarding.setValue('custrecord_yd_oys_onboarding_link',requestBody.url);
                    recOnboarding.save();

                   }

                      break;*/

                      case "Onboarding_AP":
                          if(requestBody.requestId && requestBody.url && requestBody.success)
                          {
                              //Create Onboarding link record
                              var recOnboarding = record.create({
                                  type: "customrecord_yd_oys_ap_onboard_links",
                                  isDynamic: true
                              });

                              recOnboarding.setValue('custrecord_yd_oys_ap_request_id',requestBody.requestId);
                              recOnboarding.setValue('custrecord_yd_oys_ap_onboarding_link',requestBody.url);
                              recOnboarding.save();

                          }

                          break;

                    case "onboarding_completed":
                        if(requestBody.payload.businessId && requestBody.payload.businessRfc && requestBody.payload.status == "ONBOARDING_COMPLETED")
                        {
                            //Find subsidiary with matching RFC and no business identifier
                            var subsId = findMatchingSubs(requestBody.payload.businessRfc);
                            setBusinessIdentifier(subsId, requestBody.payload.businessId);

                        }

                        break;

                   /*case "payment_link":

                   if (requestBody.requestId && requestBody.success && requestBody.paymentLink.metadata.paymentLinkUrl && requestBody.paymentLink.paymentLinkId) {

                    createReqLinksRec(requestBody.requestId,requestBody.paymentLink.metadata.paymentLinkUrl, requestBody.paymentLink.paymentLinkId);
                    var data = updatePayLinkRec(requestBody.requestId, requestBody.paymentLink.metadata.paymentLinkUrl, requestBody.paymentLink.paymentLinkId);
                    var pdfFile = buildPDFAtt(data);
                    sendCustomerEmail(data, pdfFile);
                    
                   }

                      break;*/
                   
                 /*  case "order_paid":
                   if (requestBody.payload.paymentOrder.paymentLinkId && requestBody.payload.paymentOrder.status) {

                    var invId = updatePayLinkRecStatus(requestBody.payload.paymentOrder.paymentLinkId, requestBody.payload.paymentOrder.status);
                    if (invId) {
                        createPayment(invId);
                    }

                    }

                    break;*/

                    case "business_change_status":
                          if(requestBody.payload.rfc && requestBody.payload.status == "REJECTED") {
                              //Find subsidiary with matching RFC and no business identifier
                              var subsId = findMatchingSubsByRFC(requestBody.payload.rfc);
                              setRejectStatus(subsId);
                          }
                     break;
                      case "AP_Dispersed":
                          if (requestBody.payload.paymentId && requestBody.payload.status == "DISPERSION_SUCCESS") {
                              setPaymentAsDispersed(requestBody.payload.paymentId, requestBody.payload.cepUrl);
                          }else if(requestBody.payload.paymentId && requestBody.payload.status == "DISPERSION_FAIL"){
                            log.debug("This payment failed: ",requestBody.payload.paymentId);
                               deleteBillPayment(requestBody.payload.paymentId);
                          }
                          break;


                  }
                //Create AP Link

                if(requestBody.hasOwnProperty("receiver") && requestBody.receiver.hasOwnProperty("type")){
                    switch(requestBody.receiver.type) {
                        case "AP_LINK":
                            if (requestBody.receiver.sourceAppID && requestBody.payload.accountsPayableLink.metadata.accountsPayableLinkUrl) {
                                setOysterAPLink(requestBody.receiver.sourceAppID, requestBody.payload.accountsPayableLink.metadata.accountsPayableLinkUrl);

                            }
                            break;
                    }
                }




           
            } catch (error) {
                log.error('POST Error',error);
            }


        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {
            log.debug('Received DELETE request: ', JSON.stringify(requestParams));
        }

        function createReqLinksRec(reqId, url, idLink) {
            
            try{
                var newRec = record.create({
                    type: 'customrecord_req_links',
                    isDynamic: true
                });

                newRec.setValue({
                    fieldId: "custrecord_req_id",
                    value: reqId
                });
                newRec.setValue({
                    fieldId: "custrecord_pay_link",
                    value: url
                });
                newRec.setValue({
                    fieldId: "custrecord_payment_req_link_id",
                    value: idLink
                });

                newRec.save();
            }catch (e) {
               log.error("Error en createReqLinksRec()",e);
            }

        }

        function updatePayLinkRec(reqId, url, linkId) {

             try{
                 log.audit('In updatePayLinkRec()','');
                 var data = {};
                 var customrecord_payment_linksSearchObj = search.create({
                     type: "customrecord_payment_links",
                     filters:
                         [
                             ["custrecord_link_req_id","is",reqId]
                         ],
                     columns:
                         [
                             "internalid", "custrecord_payment_link_invoice"
                         ]
                 });
                 var searchResultCount = customrecord_payment_linksSearchObj.runPaged().count;
                 log.debug("customrecord_payment_linksSearchObj result count",searchResultCount);
                 customrecord_payment_linksSearchObj.run().each(function(result){

                     //Update record
                     record.submitFields({
                         type: "customrecord_payment_links",
                         id: result.getValue('internalid'),
                         values: {
                             custrecord_payment_link_status: '3',
                             custrecord_payment_link:url,
                             custrecord_payment_link_id:linkId
                         },
                         options: {
                             enableSourcing: false,
                             ignoreMandatoryFields : true
                         }
                     });

                     data.invIntId = parseInt(result.getValue('custrecord_payment_link_invoice'));
                     data.invName = result.getText('custrecord_payment_link_invoice');
                     data.paymentLink = url;

                 });
                 return data;

                 }catch (e) {
                   log.error("Error en updatePayLinkRec()", e);
                 }
            
        }

        function updatePayLinkRecStatus(linkId, status){

            try {
                var recID = "";
                var invoice = "";

                var customrecord_payment_linksSearchObj = search.create({
                    type: "customrecord_payment_links",
                    filters:
                        [
                            ["custrecord_payment_link_id","is",linkId]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                var searchResultCount = customrecord_payment_linksSearchObj.runPaged().count;
                log.debug("customrecord_payment_linksSearchObj result count",searchResultCount);
                customrecord_payment_linksSearchObj.run().each(function(result){
                    recID = result.getValue("internalid");
                });

                if (status == "PAYMENT_CONFIRMATION_RECEIVED" && recID) {
                    record.submitFields({
                        type: "customrecord_payment_links",
                        id: recID,
                        values: {
                            custrecord_payment_link_status: '4'
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });

                    var searchRec = search.lookupFields({
                        type: 'customrecord_payment_links',
                        id: recID,
                        columns: ['custrecord_payment_link_invoice']
                    });

                    invoice = searchRec['custrecord_payment_link_invoice'][0].value;
                }


                return invoice;
            } catch (e) {
                log.error("Error en updatePayLinkRecStatus()", e);
            }
       
        }

        function createPayment(invId){

            try {
                var paymemtRec = record.transform({
                    fromType: record.Type.INVOICE,
                    fromId: invId,
                    toType: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: false
                });
                var paymentRecId = paymemtRec.save();
                log.debug('Created payment record with id:',paymentRecId);
            } catch (e) {
                log.error("Error en createPayment()", e);
            }
            
        }

        function findMatchingSubs(rfc){

            try {
                var subsId = "";

                var subsidiarySearchObj = search.create({
                    type: "subsidiary",
                    filters:
                        [
                            ["taxregistrationnumber","is",rfc],
                            "AND",
                            ["custrecord_subs_business_identifier","isempty",""],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                //var searchResultCount = subsidiarySearchObj.runPaged().count;
                //log.debug("subsidiarySearchObj result count",searchResultCount);
                subsidiarySearchObj.run().each(function(result){
                    subsId = result.getValue("internalid")
                });

                return subsId;
            } catch (e) {
                log.error("Error en findMatchingSubs()", e);
            }
        }

        function findMatchingSubsByRFC(rfc){

            try {
                var subsId = "";

                var subsidiarySearchObj = search.create({
                    type: "subsidiary",
                    filters:
                        [
                            ["taxregistrationnumber","is",rfc],
                            "AND",
                            ["isinactive","is","F"]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                //var searchResultCount = subsidiarySearchObj.runPaged().count;
                //log.debug("subsidiarySearchObj result count",searchResultCount);
                subsidiarySearchObj.run().each(function(result){
                    subsId = result.getValue("internalid")
                });

                return subsId;
            } catch (e) {
                log.error("Error en findMatchingSubs()", e);
            }
        }

        function setBusinessIdentifier(subsId, bI){

            try{
                var recSub = record.load({
                    type: record.Type.SUBSIDIARY,
                    id: subsId,
                });

                /*recSub.setValue("custrecord_subs_business_identifier", bI);
                recSub.setValue("custrecord_subs_onboarding_link", "");
                recSub.setValue("custrecord_status_subs_links_pagos", "4");*/

                //Oyster AP Fields
                recSub.setValue("custrecord_subs_business_identifieroysap", bI);
                recSub.setValue("custrecord_subs_onboarding_link_oys_ap", "");
                recSub.setValue("custrecord_status_oyster_ap", "4");


                recSub.save();
            }catch (e) {
                log.error("Error en setBusinessIdentifier()", e);
            }




        }

        function buildPDFAtt(data){

            try {
                var pdfFile = "";

                var emailConfigSea = search.lookupFields({
                    type: 'customrecord_yd_oys_email_config',
                    id: 1,
                    columns: ['custrecord_yd_oys_inv_att_template']
                });

                var pdfTemplateId = emailConfigSea.custrecord_yd_oys_inv_att_template[0].value;
                log.debug("pdfTemplateId",pdfTemplateId);
                var renderer = render.create();
                renderer.setTemplateById(pdfTemplateId);
                var myContent = renderer.addRecord({
                    templateName: 'record',
                    record: record.load({
                        type: record.Type.INVOICE,
                        id: data.invIntId
                    })
                });

                pdfFile = renderer.renderAsPdf();
                pdfFile.name = data.invName + ".pdf";


                return pdfFile;
            } catch (e) {
                log.error("Error en buildPDFAtt()", e);
            }

        }

        function sendCustomerEmail(data, pdfFile){

            try {
                log.audit("In sendCustomerEmail...","");



                var emailConfigSea = search.lookupFields({
                    type: 'customrecord_yd_oys_email_config',
                    id: 1,
                    columns: ['custrecord_yd_oys_email_sender', 'custrecord_yd_oys_send_email', "custrecord_yd_oys_email_template"]
                });
                var sendEmail = emailConfigSea.custrecord_yd_oys_send_email;

                if (sendEmail){
                    var senderId = emailConfigSea.custrecord_yd_oys_email_sender[0].value;
                    var invSearch = search.lookupFields({
                        type: search.Type.INVOICE,
                        id: data.invIntId,
                        columns: ['entity']
                    });
                    var recipientId = invSearch.entity[0].value;

                    var emailTemplateId = emailConfigSea.custrecord_yd_oys_email_template[0].value;
                    log.debug("emailTemplateIdemailTemplateId",emailTemplateId);

                    var mergeResult = render.mergeEmail({
                        templateId: emailTemplateId,
                        transactionId: data.invIntId
                    });
                    log.debug("mergeResult", JSON.stringify(mergeResult));
                    var emailSubject = mergeResult.subject;
                    log.debug('emailSubject',emailSubject);
                    var emailBody = mergeResult.body;
                    log.debug('emailBody',emailBody);
                    log.debug("typeof emailBody",typeof(emailBody));
                    //emailBody = emailBody.replace("*linkdepago*", data.paymentLink);
                    emailBody = emailBody.replace(/linkdepago/gi, data.paymentLink);
                    log.debug('emailBody después del replace',emailBody);

                    //log.debug("Payment link to be used in replace: ",data.paymentLink);


                    email.send({
                        author: senderId,
                        recipients: recipientId,
                        subject: emailSubject,
                        body: emailBody,
                        attachments: [pdfFile],
                        /*relatedRecords: {
                            entityId: recipientId,
                            customRecord:{
                                id:recordId,
                                recordType: recordTypeId //an integer value
                            }
                        }*/
                    });
                    log.debug("Sent...","");

                }
            } catch (e) {
                log.error("Error en sendCustomerEmail()", e);
            }

        }

        function setRejectStatus (subsId){

            try {
                var subRec = record.load({
                        type: record.Type.SUBSIDIARY,
                        id: subsId,
                    });
                //subRec.setValue("custrecord_status_subs_links_pagos",6);
                subRec.setValue("custrecord_status_oyster_ap",6);
                subRec.save();

            } catch (e) {
                log.error("Error setRejectStatus()", e);
            }

        }

        function setOysterAPLink(uuid, url) {
            try {
                var recId = "";

                //Search for record with matching uuid
                var customrecord_2663_file_adminSearchObj = search.create({
                    type: "customrecord_2663_file_admin",
                    filters:
                        [
                            ["custrecord_radi_oyster_ap_batch","is",uuid]
                        ],
                    columns:
                        [
                            "internalid"
                        ]
                });
                var searchResultCount = customrecord_2663_file_adminSearchObj.runPaged().count;
                log.debug("customrecord_2663_file_adminSearchObj result count",searchResultCount);
                customrecord_2663_file_adminSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    recId = result.getValue("internalid");
                });

                //Set Url
                record.submitFields({
                    type: "customrecord_2663_file_admin",
                    id: recId,
                    values: {
                        custrecord_radi_oyster_ap_funding_url: url
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
            } catch (e) {
                log.error("Error setOysterAPLink()", e);
            }
        }

        function setPaymentAsDispersed(uuid, cepUrl) {
            try {
                var recId = "";
                log.debug("Looking for bill payment with uuid ",uuid);
                var vendorpaymentSearchObj = search.create({
                    type: "vendorpayment",
                    filters:
                        [
                            ["type","anyof","VendPymt"],
                            "AND",
                            ["custbody_radi_oyster_ap_paym_id","is",uuid],
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
                    recId = result.getValue("internalid");
                });

                record.submitFields({
                    type: record.Type.VENDOR_PAYMENT,
                    id: recId,
                    values: {
                        custbody_radi_oyster_ap_paym_estatus: 1,
                        custbody_radi_oyster_ap_paym_cepurl: cepUrl
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });

            } catch (e) {
                log.error("Error setPaymentAsDispersed()", e);
            }
        }

        function deleteBillPayment(uuid) {
            try {
                var recId = "";
                log.debug("Looking for bill payment with uuid ",uuid);
                var vendorpaymentSearchObj = search.create({
                    type: "vendorpayment",
                    filters:
                        [
                            ["type","anyof","VendPymt"],
                            "AND",
                            ["custbody_radi_oyster_ap_paym_id","is",uuid],
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
                    recId = result.getValue("internalid");
                });
                log.debug("DELETING BillPayment Rec " +  recId,"");
                //Delete record
                record.delete({
                    type: record.Type.VENDOR_PAYMENT,
                    id: recId,
                });

            } catch (e) {
                log.error("Error setPaymentAsDispersed()", e);
            }
        }


        return {get, put, post, delete: doDelete}

    });
