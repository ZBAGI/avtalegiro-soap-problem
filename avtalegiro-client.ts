/* eslint-disable camelcase */
import * as soap from "soap";
import { Client as SoapClient } from "soap";
import { v4 as uuid } from "uuid";
import * as path from "path";
import * as fs from "fs"; 

let privCert = fs.readFileSync(`${__dirname}/certificates/private.pem`);
let pubCert = fs.readFileSync(`${__dirname}/certificates/public.pem`);

export interface AvtaleGiroMandate {
	mandate_reference: string,
	mandate_currency: {
		currency: string;
	}
	mandate_notification: {
		other: {
			notification: "Yes" | "No"
		}
	}
	mandate_acceptance_result: {
		status: "ACTIVE" | "INACTIVE" | "PENDING"
	},
}

export class AvtaleGiroClient {
	private static soapClient: SoapClient | undefined;
	private static mandatesCache: AvtaleGiroMandate[] = [];

	private get client(): Promise<SoapClient> {
		if(AvtaleGiroClient.soapClient)
			return Promise.resolve(AvtaleGiroClient.soapClient);
		
		const wsdlPath = path.join(__dirname, "/wsdl.xml");
		return soap.createClientAsync(wsdlPath);
	}

	private readonly accountNumber: string;

	public constructor(accountNumber: string) {
		this.accountNumber = accountNumber;
	}

	private async fetchMandate(kid: string): Promise<AvtaleGiroMandate | undefined> {
		const messageId = uuid();
		const client = await this.client;
		client.setSecurity(new soap.WSSecurityCert(privCert, pubCert, ""));
		
		console.log(`[${new Date()}]: Sending getAtgMandate`);
		return client.getAtgMandateAsync({
			auditInformation: {
				messageIdentifier: messageId
			},
			creditAccount: this.accountNumber,
			kid: kid
		}).then((response: any) => {
			AvtaleGiroClient.mandatesCache.push(response.data);
			
			return response.data;
		}).catch((err: any) => {
			console.log(`[${new Date()}]: failed to fetch mandate:` + err);

			return undefined;
		});
	}

	public async hasActiveMandate(accountId: number): Promise<boolean> {
		const kid = this.getKid(accountId, false);
		let mandate = AvtaleGiroClient.mandatesCache.find(m => m.mandate_reference == kid) ?? await this.fetchMandate(kid);
		if(!mandate)
			return false;
		
		return mandate?.mandate_acceptance_result.status === "ACTIVE";
	}

	/*
	Step 1 – Multiply each digit of the KID by the weighting, alternating the weights between 2 and 1, starting from the right and moving left.
	Step 2 – Add all the digits of the resulting products from step 1. Note that if a product result is a multi-digit number, each individual digit should be summed, not the whole number.
	Step 3 – The single last digit of the result of step 2 (7 in the below example) is subtracted from 10. If the single digit from step 2 is 0, the control digit will be 0.

	KID Digits	    1   2   3   4   5   6   7   0   1   1   2   3   4   5
	Weighting	    1   2   1    2   1    2   1    2   1   2   1   2    1   2
	Products	    1   4   3   8   5  12  7   0   1   2   2   6   4  10
	Sum of digits   1+4 +3+8 +5+1+2+7+0+1+2+2+6+4+1+0 = 47

	Control digit = 10 – 7 = 3

	Read more: https://www.nets.eu/developer/AvtaleGiro/Processes%20Communication/Pages/KID.aspx
	*/
	private getKid(accountId: number, withControlDigit: boolean): string {
		// There is not test madates without numbers at the end, so we need to hard-code 000 at the beinging
		// to match the test mandate structure.
		let strAccountId = "000" + accountId.toString();

		// Bring KID to correct lenght
		while(strAccountId.length < 19)
			strAccountId += 0;

		// No need to generate control digit, then we are done
		if(!withControlDigit)
			return strAccountId;

		let weight = 1;
		let total: number = 0;
		for (let i = 0; i < strAccountId.length; i++) {
			const num = Number(strAccountId[i]);
			const result = num * weight;
			if(result > 9) {
				const strResult = result.toString();
				for (let x = 0; x < strResult.length; x++)
					total += Number(strResult[i]);
			} else {
				total += result;
			}
			weight = weight == 1 ? 2 : 1;
		}

		const lastResultDigit = Number([...total.toString()].pop());
		const controlDigit = 10 - lastResultDigit;
		
		return strAccountId + controlDigit;
	}
}
