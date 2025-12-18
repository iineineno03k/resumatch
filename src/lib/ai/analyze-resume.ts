import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI解析結果の型定義
 * DBのai_analysisカラムに保存される構造
 */
export type AIAnalysis = {
  summary: string;
  skills: string[];
  experience: {
    company: string;
    position: string;
    period: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    period: string;
  }[];
  certifications: string[];
};

export type AnalyzeResult = {
  success: true;
  analysis: AIAnalysis;
};

export type AnalyzeError = {
  success: false;
  error: string;
  code: "API_ERROR" | "PARSE_ERROR" | "INVALID_RESPONSE" | "RATE_LIMIT";
};

export type AnalyzeOutput = AnalyzeResult | AnalyzeError;

/**
 * AIモックモードを使用するかどうか（実行時に評価）
 */
function isAIMockEnabled(): boolean {
  return process.env.USE_AI_MOCK === "true";
}

/**
 * モック用のAI解析結果を生成
 */
function generateMockAnalysis(resumeText: string): AIAnalysis {
  // テキストからいくつかの情報を抽出してモックデータに反映
  const hasJavaScript = resumeText.toLowerCase().includes("javascript");
  const hasTypeScript = resumeText.toLowerCase().includes("typescript");
  const hasReact = resumeText.toLowerCase().includes("react");
  const hasPython = resumeText.toLowerCase().includes("python");

  const skills: string[] = [];
  if (hasJavaScript) skills.push("JavaScript");
  if (hasTypeScript) skills.push("TypeScript");
  if (hasReact) skills.push("React");
  if (hasPython) skills.push("Python");
  if (skills.length === 0) skills.push("コミュニケーション", "問題解決");

  return {
    summary:
      "【モック解析結果】経験豊富なエンジニアで、複数のプロジェクトでの開発経験があります。チームワークとコミュニケーション能力に優れています。",
    skills,
    experience: [
      {
        company: "株式会社サンプル",
        position: "ソフトウェアエンジニア",
        period: "2020年4月 - 現在",
        description:
          "Webアプリケーションの設計・開発を担当。チームリーダーとして5名のメンバーをマネジメント。",
      },
      {
        company: "テスト株式会社",
        position: "ジュニアエンジニア",
        period: "2018年4月 - 2020年3月",
        description: "バックエンド開発およびAPI設計を担当。",
      },
    ],
    education: [
      {
        school: "東京工業大学",
        degree: "情報工学部 学士",
        period: "2014年4月 - 2018年3月",
      },
    ],
    certifications: ["基本情報技術者", "応用情報技術者"],
  };
}

const RESUME_ANALYSIS_PROMPT = `あなたは履歴書・職務経歴書の解析を行うAIアシスタントです。
以下のテキストは履歴書または職務経歴書から抽出されたものです。
このテキストを分析し、以下のJSON形式で構造化してください。

出力形式（JSONのみを出力、他の説明は不要）:
{
  "summary": "候補者の概要を2-3文で簡潔に記述",
  "skills": ["スキル1", "スキル2", ...],
  "experience": [
    {
      "company": "会社名",
      "position": "役職・職種",
      "period": "在職期間（例: 2020年4月 - 2023年3月）",
      "description": "業務内容の要約"
    }
  ],
  "education": [
    {
      "school": "学校名",
      "degree": "学位・専攻",
      "period": "在学期間"
    }
  ],
  "certifications": ["資格1", "資格2", ...]
}

注意事項:
- 情報が見つからない場合は空の配列[]または空文字列""を使用
- 日本語と英語の両方に対応
- 推測や補完はせず、テキストに記載された情報のみを抽出
- JSONのみを出力し、説明文やマークダウンは含めない

履歴書テキスト:
`;

/**
 * Gemini APIクライアントを初期化
 */
function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * 履歴書テキストをAIで解析し、構造化データを生成する
 * @param resumeText 履歴書から抽出したテキスト
 * @returns 解析結果
 */
export async function analyzeResume(
  resumeText: string,
): Promise<AnalyzeOutput> {
  if (!resumeText.trim()) {
    return {
      success: false,
      error: "解析するテキストが空です",
      code: "INVALID_RESPONSE",
    };
  }

  // モックモードの場合はモックデータを返す
  if (isAIMockEnabled()) {
    // 少し遅延を入れてリアルな動作をシミュレート
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      analysis: generateMockAnalysis(resumeText),
    };
  }

  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = RESUME_ANALYSIS_PROMPT + resumeText;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // JSONをパース
    const analysis = parseAnalysisResponse(text);
    if (!analysis) {
      return {
        success: false,
        error: "AIの応答をJSONとしてパースできませんでした",
        code: "PARSE_ERROR",
      };
    }

    // 必須フィールドの検証
    const validatedAnalysis = validateAndNormalizeAnalysis(analysis);

    return {
      success: true,
      analysis: validatedAnalysis,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("RATE_LIMIT") || message.includes("429")) {
      return {
        success: false,
        error:
          "API利用制限に達しました。しばらく待ってから再試行してください。",
        code: "RATE_LIMIT",
      };
    }

    if (message.includes("API key")) {
      return {
        success: false,
        error: "APIキーが設定されていないか無効です",
        code: "API_ERROR",
      };
    }

    return {
      success: false,
      error: `AI解析中にエラーが発生しました: ${message}`,
      code: "API_ERROR",
    };
  }
}

/**
 * AIの応答テキストからJSONをパースする
 */
function parseAnalysisResponse(text: string): unknown {
  // マークダウンのコードブロックを除去
  let jsonStr = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // 最初の { から最後の } までを抽出
  const startIndex = jsonStr.indexOf("{");
  const endIndex = jsonStr.lastIndexOf("}");

  if (startIndex === -1 || endIndex === -1) {
    return null;
  }

  jsonStr = jsonStr.slice(startIndex, endIndex + 1);

  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * 解析結果を検証・正規化する
 */
function validateAndNormalizeAnalysis(data: unknown): AIAnalysis {
  const obj = data as Record<string, unknown>;

  return {
    summary: typeof obj.summary === "string" ? obj.summary : "",
    skills: normalizeStringArray(obj.skills),
    experience: normalizeExperienceArray(obj.experience),
    education: normalizeEducationArray(obj.education),
    certifications: normalizeStringArray(obj.certifications),
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeExperienceArray(value: unknown): AIAnalysis["experience"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      company: typeof item.company === "string" ? item.company : "",
      position: typeof item.position === "string" ? item.position : "",
      period: typeof item.period === "string" ? item.period : "",
      description: typeof item.description === "string" ? item.description : "",
    }));
}

function normalizeEducationArray(value: unknown): AIAnalysis["education"] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      school: typeof item.school === "string" ? item.school : "",
      degree: typeof item.degree === "string" ? item.degree : "",
      period: typeof item.period === "string" ? item.period : "",
    }));
}
