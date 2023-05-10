/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],
    /**
 * @param{record} record
 */
    (record) => {
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
                log.debug("En beforeSubmit...","");
                if(scriptContext.type === scriptContext.UserEventType.CREATE) {

                }
                var newRec = scriptContext.newRecord;

                var paymId = newRec.getValue("custbody_radi_oyster_ap_paym_id");

                if(!paymId){
                    log.debug("Generating UUID","");
                    var newUUID = generateUUID();
                    log.debug("newUUID",newUUID);
                    newRec.setValue("custbody_radi_oyster_ap_paym_id", newUUID);
                }
            } catch (e) {
                log.error("Error beforeSubmit", e);
            }
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

        function generateUUID() {
            var timestamp = new Date().getTime();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var random = Math.random() * 16;
                random = (timestamp + random) % 16 | 0;
                timestamp = Math.floor(timestamp / 16);
                return (c === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
            });
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
