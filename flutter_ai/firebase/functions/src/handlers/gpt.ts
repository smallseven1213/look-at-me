// 只顯示局部程式碼
import * as functions from "firebase-functions";
import OpenAI from "openai";
import { DeviceRepository } from "./repositories/DeviceRepository";
import { UserRepository } from "./repositories/UserRepository";
import { ProUsageRepository } from "./repositories/ProUsageRepository";



export function createGPTHandlers(
  deviceRepository: DeviceRepository,
  userRepository: UserRepository,
  proUsageRepository: ProUsageRepository
) {
  const openai = new OpenAI({
    apiKey: process.env.GPT_AI_TOKEN,
  });

  async function chat(
    data: any,
    context: functions.https.CallableContext
  ): Promise<{
    completion: string;
    usageZeny: number;
    zenyType: string;
  }> {
    const { deviceId, completionType, questionSide, answerSide, model, locale = "en_US" } = data;

    const userId = context.auth ? context.auth.uid : null;
    const modelName = GPT_MODEL_MAPPING[model] || GPT_MODEL_LIGHT;
    // 檢查使用者權限和 Zeny
    const checkResult = await checkPermissionAndZeny(userId, deviceId);

    let systemMessage = "";
    let userMessage = "";

    if (completionType === 1) {
      systemMessage = "return any message you are given as JSON.";
      userMessage = `
        *********
      `;
    } else if (completionType === 2) {
      systemMessage = "return any message you are given as JSON.";
      userMessage = `
        *********
        Return as JSON: {section_title: String, content: String}
      `;
    } else {
      throw new functions.https.HttpsError(
        "unimplemented",
        "function_no_longer_supported"
      );
    }

    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        model: modelName,
        response_format: { type: "json_object" },
      });

      const totalTokens = completion.usage?.total_tokens || 0;

      // 計算使用者消耗的 Zeny
      const zenyCost = calculateUserZenyCost(totalTokens, modelName);

      // 有transaction的decutZeny 
      await deductZeny(
        userId,
        deviceId,
        zenyCost,
        checkResult,
        "CHAT_COMPLETION",
        userMessage
      );

      return {
        completion: completion.choices[0].message.content,
        usageZeny: zenyCost,
        zenyType: checkResult.type,
      };
    } catch (error) {
      console.error("===GPT error===", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to fetch content from OpenAI API"
      );
    }
  }
