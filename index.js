"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const avtalegiro_client_1 = require("./avtalegiro-client");
console.log("Start");
(async () => {
    const avtalegiro = new avtalegiro_client_1.AvtaleGiroClient("15030699952");
    const result = await avtalegiro.hasActiveMandate(2091201);
    console.log("Finished, result = ");
    console.log(result);
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQUF1RDtBQUV2RCxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3JCLENBQUMsS0FBSyxJQUFtQixFQUFFO0lBQzFCLE1BQU0sVUFBVSxHQUFHLElBQUksb0NBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdkQsTUFBTSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyJ9