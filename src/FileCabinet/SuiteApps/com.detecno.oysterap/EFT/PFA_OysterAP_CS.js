/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/http', 'N/https', 'N/record', 'N/runtime','N/ui/message', 'N/url'],
    /**
     * @param{currentRecord} currentRecord
     * @param{http} http
     * @param{https} https
     * @param{record} record
     * @param{runtime} runtime
     * @param{message} message
     * @param{url} url
     */
    function(currentRecord, http, https, record, runtime, message, url) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }


        function contactOysterApSl(pfaRecId, txtFileId) {

            try {

                var myMsg = message.create({
                    title: "Oyster AP",
                    message: "Enviando detalles de pago a Oyster AP",
                    type: message.Type.INFORMATION
                });
                myMsg.show();

                console.log("pfaRecId: " + pfaRecId);
                console.log("txtFileId: " + txtFileId);
                var uri = url.resolveScript({
                    scriptId: "customscript_radi_pfa_oysap_sl",
                    deploymentId: "customdeploy_radi_pfa_oysterap_sl_dep",
                    params: {
                        pfaRecId: pfaRecId,
                        txtFileId: txtFileId
                    }
                });

                log.debug("uri",uri);


                https.get.promise({
                    url: uri
                    //headers: headerObj
                }).then(function(response){
                    log.debug("response",response);
                    var responseBody = JSON.parse(response.body);
                    log.debug("responseBody",responseBody);
                    if(responseBody.success){
                        //todo Go to same record with param success
                        var output = url.resolveRecord({
                            recordType: "customrecord_2663_file_admin",
                            recordId: pfaRecId,
                            params: {
                                'sent': true
                            }
                        });

                        window.location.href = output;//showSuccess(data);
                    }else{
                        //TODO go to same record with error param
                    }

                    })
                    .catch(function onRejected(reason) {
                        log.debug({
                            title: 'Invalid Get Request: ',
                            details: reason
                        });
                    })




               /* var response = https.get({
                    url: uri
                });*/


            } catch (e) {
                log.error("contactOysterApSl()", e);
            }



          /*  var language = runtime.getCurrentUser().getPreference('LANGUAGE').split('_')[0];
            var myMsg = message.create({
                title: "Oyster AP",
                message: "Enviando detalles de pago a Oyster AP",
                type: message.Type.INFORMATION
            });
            myMsg.show();

            var body = {
                "Receiver":{
                    "AccountId":runtime.accountId
                },
                "Payload":{
                    "additionalInformation":{
                        "attributes":[
                            {
                                "Value":"Onboarding_AP", //AP, Onboarding
                                "Name":"Type" //Type
                            }
                        ]
                    },
                    "business":{
                        "legalName":subsLegalName,
                        "address":{
                            "attributes":[
                                {
                                    "Value":"",
                                    "Name":""
                                }
                            ]
                        },
                        "phone":"",
                        "taxId":rfc,
                        "name":subsName,
                        "detail":{
                            "minEmployeesNumber":"",
                            "maxYearsOfOperation":"",
                            "siteUrl":"",
                            "minYearsOfOperation":"",
                            "maxEmployeesNumber":"",
                            "givesOutInvoices":"",
                            "minMonthlyIncome":"",
                            "industry":"",
                            "maxMonthlyIncome":""
                        },
                        "clabe":""
                    },
                    "user":{
                        "firstName":"",
                        "lastName":"",
                        "address":{
                            "attributes":[
                                {
                                    "Value":"",
                                    "Name":""
                                }
                            ]
                        },
                        "nationality":"",
                        "birthState":"",
                        "phone":"",
                        "taxId":"",
                        "birthCountry":"",
                        "email":"",
                        "curp":"",
                        "secondName":""
                    }
                }
            }

            //If body contains RFC then send request to SL for onboarding
            if (body.Payload.business.taxId) {

                var reqBody = {};
                reqBody.type = "Create_Onboarding_Link";
                reqBody.subsidiary = currentRecord.get().getValue("id");
                reqBody.body = body;

                var uri = url.resolveScript({
                    scriptId: "customscript_oyster_ap_cs_auth_sl",
                    deploymentId: "customdeploy_oyster_ap_cs_auth_dep"
                });
                var headerObj = {
                    "Content-Type": "application/json"
                };

                var response = https.post({
                    url: uri,
                    body: JSON.stringify(reqBody),
                    headers: headerObj
                });

                location.reload();


            }*/


        }



        return {
            pageInit: pageInit,
            contactOysterApSl: contactOysterApSl
        };

    });
