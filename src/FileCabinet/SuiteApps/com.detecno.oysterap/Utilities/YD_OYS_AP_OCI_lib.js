
define(['N/search', 'N/log', 'N/runtime', 'N/ui/message', 'N/currentRecord', 'N/record', 'N/https', 'N/encode'], 

function (search, log, runtime, message, currentRecord, record, https, encode) {

    function checkSubsPayLinkStatus(subsidiary) {

      var subEnabled = false;
      
      var subsidiarySearchObj = search.create({
          type: "subsidiary",
          filters:
          [
             ["internalidnumber","equalto",subsidiary], 
             "AND", 
             ["isinactive","is","F"], 
             "AND", 
             ["custrecord_status_oyster_ap","anyof","4"]
          ],
          columns:
          [
             "custrecord_status_oyster_ap"
          ]
       });
       var searchResultCount = subsidiarySearchObj.runPaged().count;
       
       if (searchResultCount == 1) {
          subEnabled = true;
       }
       
       return subEnabled;
  }

   function getBusinessIdentifier(subsidiary){

      var businessIdentifier = "";

      var subsidiarySearchObj = search.create({
         type: "subsidiary",
         filters:
         [
            ["internalidnumber","equalto",subsidiary]
         ],
         columns:
         [
            "custrecord_subs_business_identifier"
         ]
      });
      
      subsidiarySearchObj.run().each(function(result){

         businessIdentifier = result.getValue("custrecord_subs_business_identifier");
         
      });

      return businessIdentifier;

   }

   function createPaymentLink(body, businessIdentifier, internalId){

      if (body) {

         var recId = internalId;

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

         var url = https.createSecureString({input:'{custsecret_radi_oys_oci_pay_link_url}'});


          log.debug("Using URL: ",url);
          log.debug("Using businessIdentifier: ",businessIdentifier);

         //send https request POST
         var headerObj = {
             "Content-Type": "application/json",
             "Accept": "*/*",
             "Authorization": https.createSecureString({input:'{custsecret_radi_oys_oci_token}'}),
             "BusinessIdentifier": businessIdentifier
         };
         
         var response = https.post({
             url: url,
             body: JSON.stringify(body),
             headers: headerObj
         });

         log.debug('Full response: ',response);
         
         log.debug("Got response body: ",response.body);

         var responseBody = response.body;

         if (typeof(responseBody) != "object") {
             responseBody = JSON.parse(responseBody);
         }
            
            //Update record
            record.submitFields({
             type: "customrecord_payment_links",
             id: idPayLinkRec,
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
   }


    return {

        checkSubsPayLinkStatus: checkSubsPayLinkStatus,
        getBusinessIdentifier: getBusinessIdentifier,
        createPaymentLink: createPaymentLink
    };

});