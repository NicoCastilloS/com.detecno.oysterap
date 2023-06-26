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
    
   
    function onboardSubsidiary(rfc, subsName, subsLegalName) {

      var language = runtime.getCurrentUser().getPreference('LANGUAGE').split('_')[0];
      var myMsg = message.create({
         title: language == "es" ? 'Oyster AP' : 'Oyster AP',
         message: language == "es" ? 'Solicitando link de onboarding...' : 'Requesting onboarding link...',
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
                scriptId: "customscript_oyster_ap_sl",
                deploymentId: "customdeploy_oyster_ap_dep"
            });
            var headerObj = {
                "Content-Type": "application/json"
            };
            console.log("URI: " + uri);
            https.post.promise({
                url: uri,
                body: JSON.stringify(reqBody),
                headers: headerObj
            })
                .then(function(response){
                    //console.log("Response: " + response);
                    log.debug({
                        title: 'Response',
                        details: response
                    });
                    location.reload();
                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                    location.reload();
                })




        }

      
    }



    return {
        pageInit: pageInit,
        onboardSubsidiary: onboardSubsidiary
    };
    
});
