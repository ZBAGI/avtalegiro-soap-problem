import { AvtaleGiroClient } from "./avtalegiro-client";

console.log("Start");
(async (): Promise<void> => {
	const avtalegiro = new AvtaleGiroClient("15030699952");
	const result = await avtalegiro.hasActiveMandate(2091201);
	console.log("Finished, result = ");
	console.log(result)
})();
