"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { EmptyState } from "@/components/common/empty-state";
import { SkillTagList } from "@/components/common/skill-tag";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { analyzeResume } from "@/features/resumes";
import type { AIAnalysis } from "@/lib/ai";

type ResumeData = {
  id: string;
  fileUrl: string;
  fileName: string | null;
  analysisStatus: string;
  aiAnalysis: unknown;
  analyzedAt: Date | null;
} | null;

interface AIAnalysisCardProps {
  resume: ResumeData;
  companyId: string;
  applicantId: string;
}

export function AIAnalysisCard({
  resume,
  companyId,
  applicantId,
}: AIAnalysisCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!resume) {
    return (
      <EmptyState
        title="履歴書がありません"
        description="この応募者には履歴書がアップロードされていません。"
      />
    );
  }

  const handleAnalyze = () => {
    setError(null);
    startTransition(async () => {
      const result = await analyzeResume({
        companyId,
        applicantId,
        resumeId: resume.id,
      });
      if (!result.success) {
        setError(result.error);
      }
    });
  };

  // 解析中
  if (resume.analysisStatus === "processing" || isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="mb-4 h-8 w-8 animate-spin" />
        <p>AI解析中...</p>
        <p className="text-sm">しばらくお待ちください</p>
      </div>
    );
  }

  // 未解析
  if (resume.analysisStatus === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <EmptyState
          title="未解析"
          description="履歴書のAI解析がまだ実行されていません。"
        />
        <Button onClick={handleAnalyze} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          AI解析を実行
        </Button>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // 解析失敗
  if (resume.analysisStatus === "failed") {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <EmptyState
          title="解析に失敗しました"
          description="履歴書のAI解析中にエラーが発生しました。再度お試しください。"
        />
        <Button onClick={handleAnalyze} variant="outline" className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          再解析
        </Button>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  // 解析完了
  const analysis = resume.aiAnalysis as AIAnalysis | null;
  if (!analysis) {
    return (
      <EmptyState
        title="解析結果がありません"
        description="解析結果の取得に失敗しました。"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 再解析ボタン */}
      <div className="flex justify-end">
        <Button
          onClick={handleAnalyze}
          variant="outline"
          size="sm"
          disabled={isPending}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          再解析
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* サマリー */}
      {analysis.summary && (
        <div>
          <h3 className="mb-2 font-semibold">サマリー</h3>
          <p className="text-muted-foreground">{analysis.summary}</p>
        </div>
      )}

      <Separator />

      {/* スキル */}
      {analysis.skills && analysis.skills.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">スキル</h3>
          <SkillTagList skills={analysis.skills} />
        </div>
      )}

      {/* 経歴 */}
      {analysis.experience && analysis.experience.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">経歴</h3>
          <div className="space-y-4">
            {analysis.experience.map((exp) => (
              <div
                key={`${exp.company}-${exp.period}`}
                className="border-l-2 border-muted pl-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.position}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{exp.period}</p>
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 学歴 */}
      {analysis.education && analysis.education.length > 0 && (
        <div>
          <h3 className="mb-3 font-semibold">学歴</h3>
          <div className="space-y-3">
            {analysis.education.map((edu) => (
              <div
                key={`${edu.school}-${edu.period}`}
                className="border-l-2 border-muted pl-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{edu.period}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 資格 */}
      {analysis.certifications && analysis.certifications.length > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">資格</h3>
          <SkillTagList skills={analysis.certifications} />
        </div>
      )}
    </div>
  );
}
