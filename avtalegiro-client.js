"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const soap = require("soap");
const uuid_1 = require("uuid");
const path = require("path");
const fs = require("fs");
let privCert = fs.readFileSync(`${__dirname}/certificates/private.pem`);
let pubCert = fs.readFileSync(`${__dirname}/certificates/public.pem`);
class AvtaleGiroClient {
    constructor(accountNumber) {
        this.accountNumber = accountNumber;
    }
    get client() {
        if (AvtaleGiroClient.soapClient)
            return Promise.resolve(AvtaleGiroClient.soapClient);
        const wsdlPath = path.join(__dirname, "/wsdl.xml");
        return soap.createClientAsync(wsdlPath);
    }
    async fetchMandate(kid) {
        const messageId = uuid_1.v4();
        const client = await this.client;
        client.setSecurity(new soap.WSSecurityCert(privCert, pubCert, ""));
        return client.getAtgMandateAsync({
            auditInformation: {
                messageIdentifier: messageId
            },
            creditAccount: this.accountNumber,
            kid: kid
        }).then((response) => {
            AvtaleGiroClient.mandatesCache.push(response.data);
            return response.data;
        }).catch((err) => {
            console.log("failed to fetch mandate:" + err);
            return undefined;
        });
    }
    async hasActiveMandate(accountId) {
        var _a;
        const kid = this.getKid(accountId, false);
        let mandate = (_a = AvtaleGiroClient.mandatesCache.find(m => m.mandate_reference == kid)) !== null && _a !== void 0 ? _a : await this.fetchMandate(kid);
        if (!mandate)
            return false;
        return (mandate === null || mandate === void 0 ? void 0 : mandate.mandate_acceptance_result.status) === "ACTIVE";
    }
    getKid(accountId, withControlDigit) {
        let strAccountId = "000" + accountId.toString();
        while (strAccountId.length < 19)
            strAccountId += 0;
        if (!withControlDigit)
            return strAccountId;
        let weight = 1;
        let total = 0;
        for (let i = 0; i < strAccountId.length; i++) {
            const num = Number(strAccountId[i]);
            const result = num * weight;
            if (result > 9) {
                const strResult = result.toString();
                for (let x = 0; x < strResult.length; x++)
                    total += Number(strResult[i]);
            }
            else {
                total += result;
            }
            weight = weight == 1 ? 2 : 1;
        }
        const lastResultDigit = Number([...total.toString()].pop());
        const controlDigit = 10 - lastResultDigit;
        return strAccountId + controlDigit;
    }
}
exports.AvtaleGiroClient = AvtaleGiroClient;
AvtaleGiroClient.mandatesCache = [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZ0YWxlZ2lyby1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhdnRhbGVnaXJvLWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUE2QjtBQUU3QiwrQkFBa0M7QUFDbEMsNkJBQTZCO0FBQzdCLHlCQUF5QjtBQUV6QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3hFLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLDBCQUEwQixDQUFDLENBQUM7QUFpQnRFLE1BQWEsZ0JBQWdCO0lBYzVCLFlBQW1CLGFBQXFCO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3BDLENBQUM7SUFaRCxJQUFZLE1BQU07UUFDakIsSUFBRyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzdCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBUU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFXO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLFNBQUksRUFBRSxDQUFDO1FBQ3pCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbkUsT0FBTyxNQUFNLENBQUMsa0JBQWtCLENBQUM7WUFDaEMsZ0JBQWdCLEVBQUU7Z0JBQ2pCLGlCQUFpQixFQUFFLFNBQVM7YUFDNUI7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