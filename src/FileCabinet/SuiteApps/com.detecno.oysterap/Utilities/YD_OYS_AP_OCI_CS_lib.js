
define(['N/search', 'N/log', 'N/runtime', 'N/ui/message', 'N/currentRecord', 'N/record', 'N/https', 'N/url'],

function (search, log, runtime, message, currentRecord, record, https, url) {

   function createPaymentLink(body, businessIdentifier){

      if (body && businessIdentifier) {

         var recId = "";

         var language = runtime.getCurrentUser().getPreference('LANGUAGE').split('_')[0];
         var myMsg = message.create({
            title: language == "es" ? 'Links de pago' : 'Payment links',
            message: language == "es" ? 'Creando link de pago...' : 'Creating payment link...',
            type: message.Type.INFORMATION
         });
         myMsg.show({
            duration: 15000
         });

            recId = currentRecord.get().getValue("id");
         

         var payLinkRec = record.create({
             type: 'customrecord_payment_links',
             isDynamic: false
         });

         payLinkRec.setValue({
             fieldId: "custrecord_payment_link_invoice",
             value: recId
         });
         payLinkRec.setValue({
             fieldId: "custrecord_payment_link_status",
             value: "1"
         });

         var idPayLinkRec = payLinkRec.save();

           var headerObj = {
              "Content-Type": "application/json"
          };

         var reqBody = {};
          reqBody.type = "Create_Payment_Link"
          reqBody.idPayLinkRec = idPayLinkRec;
          reqBody.businessIdentifier = businessIdentifier;
          reqBody.body = body;


          var uri = url.resolveScript({
              scriptId: "customscript_payment_links_cs_auth_sl",
              deploymentId: "customdeploy_payment_links_cs_auth_dep"
          });
          log.debug("Sending create link request...","");
          var response = https.post({
              url: uri,
              body: JSON.stringify(reqBody),
              headers: headerObj
          });




     }
   }



    return {
        createPaymentLink: createPaymentLink
    };

});