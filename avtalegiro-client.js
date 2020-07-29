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
        console.log(`[${new Date()}]: Sending getAtgMandate`);
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
            console.log(`[${new Date()}]: failed to fetch mandate:` + err);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZ0YWxlZ2lyby1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhdnRhbGVnaXJvLWNsaWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDZCQUE2QjtBQUU3QiwrQkFBa0M7QUFDbEMsNkJBQTZCO0FBQzdCLHlCQUF5QjtBQUV6QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEdBQUcsU0FBUywyQkFBMkIsQ0FBQyxDQUFDO0FBQ3hFLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLDBCQUEwQixDQUFDLENBQUM7QUFpQnRFLE1BQWEsZ0JBQWdCO0lBYzVCLFlBQW1CLGFBQXFCO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3BDLENBQUM7SUFaRCxJQUFZLE1BQU07UUFDakIsSUFBRyxnQkFBZ0IsQ0FBQyxVQUFVO1lBQzdCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVyRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBUU8sS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFXO1FBQ3JDLE1BQU0sU0FBUyxHQUFHLFNBQUksRUFBRSxDQUFDO1FBQ3pCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbkUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFDdEQsT0FBTyxNQUFNLENB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