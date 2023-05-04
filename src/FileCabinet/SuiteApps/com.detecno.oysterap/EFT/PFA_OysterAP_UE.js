/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/ui/message'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{message} message
 */
    (record, search, message) => {
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
                    // Insert button if conditions are met
                if(scriptContext.type == "view") {
                    var pfaRec = scriptContext.newRecord;
                    var pfaRecId = pfaRec.id;
                    var params = scriptContext.request.parameters;
                    const form = scriptContext.form;
                    var txtFileId = pfaRec.getValue("custrecord_2663_file_ref");
                    var processedStatus = pfaRec.getValue("custrecord_2663_file_processed");
                    var paymentType = pfaRec.getValue("custrecord_2663_payment_type");
                    var bankCurrency = pfaRec.getValue("custpage_2663_bank_currency");
                    var sentCbx = pfaRec.getValue("custrecord_radi_oyster_ap_sent");
                    log.debug("Vals:",txtFileId + "," + processedStatus+ "," + paymentType + "," + bankCurrency);
                    //TODO: Uncomment for MXN only
                    //if(txtFileId && processedStatus == 4 && paymentType == 1 && bankCurrency == "MXN" && !sentCbx && !params.sent){
                    if(txtFileId && processedStatus == 4 && paymentType == 1 && !sentCbx && !params.sent){
                        scriptContext.form.clientScriptModulePath = './PFA_OysterAP_CS';
                        //Pasarle al client el id del archivo
                        scriptContext.form.addButton({
                            id: 'custpage_pfa_oyster_ap',
                            label: 'Pagar con Oyster AP',
                            functionName: 'contactOysterApSl(' + JSON.stringify(pfaRecId) + ',' + JSON.stringify(txtFileId) +')'
                            //functionName: 'formOysterTxtFile(' + JSON.stringify(rfc) + ',' + JSON.stringify(subsName) + ',' + JSON.stringify(subsLegalName) + ')'

                        });
                    }

                    //Set sent checkbox
                    if (params.sent) {
                        //set form
                        form.updateDefaultValues({
                            custrecord_radi_oyster_ap_sent: true
                        });
                        //set record
                        record.submitFields({
                            type: "customrecord_2663_file_admin",
                            id: pfaRecId,
                            values: {
                                custrecord_radi_oyster_ap_sent: true
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });
                        if(!pfaRec.getValue("custrecord_radi_oyster_ap_funding_url")){
                            showUserMessage("success", form);
                        }


                    }



                }

            } catch (e) {
                log.error("Error beforeLoad", e);
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
            try {
                //log.debug("En beforeSubmit...","");
                var newRec = scriptContext.newRecord;

                var batchId = newRec.getValue("custrecord_radi_oyster_ap_batch");
                var lastPrInit = newRec.getValue("custrecord_2663_last_process");
                var fileProcessed = newRec.getValue("custrecord_2663_file_processed");
                var fileId = newRec.getValue("custrecord_2663_file_ref");
                //log.debug("batchId, fileId",batchId + "," + fileId);

                if(!batchId && fileId){
                    log.debug("Generating UUID","");
                    var newUUID = generateUUID();
                    log.debug("newUUID",newUUID);
                    newRec.setValue("custrecord_radi_oyster_ap_batch", newUUID);
                }
            } catch (e) {
                log.error("Error beforeSubmit", e);
            }

        }

        function generateUUID() {
            var timestamp = new Date().getTime();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var random = Math.random() * 16;
                random = (timestamp + random) % 16 | 0;
                timestamp = Math.floor(timestamp / 16);
                return (c === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
            });
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

        function showUserMessage(messageType, form) {

            var msgType;
            var msgTitle;
            var msgText;

            log.debug("messageType "+messageType);

            if(messageType === "success") {
                msgType = message.Type.CONFIRMATION;
                msgTitle = "Exitoso";
                msgText = "Se ha envíado la información a Oyster AP.";
            }else {
                msgType = message.Type.ERROR;
                msgTitle = "Error";
                msgText = "Ocurrió un error en la respuesta de Oyster AP";
            }

            form.addPageInitMessage({
                title: msgTitle,
                message: msgText,
                type: msgType
            });
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
