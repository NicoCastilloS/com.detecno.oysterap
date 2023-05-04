/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/currentRecord', 'N/log', 'N/record','N/search', 'N/runtime'],
    /**
 * @param{currentRecord} currentRecord
 * @param{log} log
 * @param{record} record
 */
    (currentRecord, log, record, search, runtime) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try {
                
                if(scriptContext.type == "view"){

                    var subsRec = scriptContext.newRecord;
                    var form = scriptContext.form;
                    
                    var statusLinksPago = subsRec.getValue('custrecord_status_oyster_ap');
                    var reqIdLinksPago = subsRec.getValue('custrecord_subs_onboarding_req_id_oys_ap');
                    var businessId = subsRec.getValue('custrecord_subs_business_identifieroysap');

                    if (reqIdLinksPago && statusLinksPago == "2") {
                        var idRecBL = subsRec.id;
                        var subsidiaryRec = record.load({
                            type: 'subsidiary',
                            id: idRecBL,
                            isDynamic: false,
                        });
                        log.debug('Entro IF poner URL onboarding...',idRecBL);
                        var onboardingUrl = getOnboardingLink(reqIdLinksPago);
                        log.debug('Trying to set: ',onboardingUrl);
                        subsidiaryRec.setValue('custrecord_subs_onboarding_link_oys_ap',onboardingUrl);
                        subsidiaryRec.setValue('custrecord_status_oyster_ap',3);
                        subsidiaryRec.save();
                        log.debug("Updating form...",onboardingUrl);
                        form.updateDefaultValues({
                            custrecord_subs_onboarding_link_oys_ap: onboardingUrl,
                            custrecord_status_oyster_ap: 3
                        });
                    }

                    log.debug("statusLinksPago, onboardingurlap",statusLinksPago + " , " + subsRec.getValue("custrecord_subs_onboarding_link_oys_ap"));
                    if (statusLinksPago != "4" && statusLinksPago != "3" && statusLinksPago != "2") {
                    //Retrieve Mexico RFC
                    var rfc = getRFCMX(subsRec);
                    var subsName = subsRec.getValue('name');
                    var subsLegalName = subsRec.getValue('legalname');

                    let language = runtime.getCurrentUser().getPreference('LANGUAGE').split('_')[0];
                    scriptContext.form.clientScriptModulePath = './YD_OYS_AP_Onboard_Sub_CS';
                    scriptContext.form.addButton({
                        id: 'custpage_onboard_sub_oys_ap',
                        label: language == "es" ? 'Habilitar Oyster AP' : 'Enable Oyster AP',
                        functionName: 'onboardSubsidiary(' + JSON.stringify(rfc) + ',' + JSON.stringify(subsName) + ',' + JSON.stringify(subsLegalName) + ')'
                       
                    });
                    }

                    
                }
                
            } catch (error) {
                log.debug("Error beforeLoad", error);
            }
            
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        function getRFCMX(subsRec) {
            var sublistCount = subsRec.getLineCount({
                sublistId: "taxregistration"
            });
            

            for (let i = 0; i < sublistCount; i++) {
                var nexCountry = subsRec.getSublistValue({
                    sublistId: "taxregistration",
                    fieldId: "nexuscountry",
                    line: i
                });

                
                //TODO: Uncomment before depoloyment
                //if (nexCountry == "MX"){

                    var rfc = subsRec.getSublistValue({
                        sublistId: "taxregistration",
                        fieldId: "taxregistrationnumber",
                        line: i
                    });
                    

                    return rfc
                //}
                
            }
        }

        function getOnboardingLink(reqId){

            var customrecord_yd_oys_ap_onboard_linksSearchObj = search.create({
                type: "customrecord_yd_oys_ap_onboard_links",
                filters:
                [
                   ["custrecord_yd_oys_ap_request_id","is",reqId]
                ],
                columns:
                [
                   "custrecord_yd_oys_ap_onboarding_link"
                ]
             });
             var searchResultCount = customrecord_yd_oys_ap_onboard_linksSearchObj.runPaged().count;
             //log.debug("customrecord_yd_oys_ap_onboard_linksSearchObj result count",searchResultCount);
             customrecord_yd_oys_ap_onboard_linksSearchObj.run().each(function(result){
                // .run().each has a limit of 4,000 results
                onboardingLink = result.getValue('custrecord_yd_oys_ap_onboarding_link');
             });
             
             /*
             customrecord_yd_oys_ap_onboard_linksSearchObj.id="customsearch1671232138784";
             customrecord_yd_oys_ap_onboard_linksSearchObj.title="Onboarding links Search (copy)";
             var newSearchId = customrecord_yd_oys_ap_onboard_linksSearchObj.save();
             */

             return onboardingLink;
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
