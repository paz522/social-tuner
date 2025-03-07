"use client"

import React, { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, AlertTriangle, BarChart2, FileText, MessageSquare, Zap, Lightbulb, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// 問題のある表現のパターン
const problematicPatterns = [
  { pattern: /至急対応/g, level: "high", message: "強いプレッシャーを与える表現" },
  { pattern: /ご確認ください/g, level: "medium", message: "命令的に聞こえる可能性" },
  { pattern: /すぐに/g, level: "medium", message: "急かしている印象" },
  { pattern: /遅延/g, level: "low", message: "否定的な印象" },
  { pattern: /問題/g, level: "low", message: "否定的な印象" },
  { pattern: /失敗/g, level: "medium", message: "責める印象" },
  { pattern: /なぜ/g, level: "medium", message: "詰問する印象" },
  { pattern: /どうして/g, level: "medium", message: "詰問する印象" },
  // 追加のパターン
  { pattern: /早急に/g, level: "high", message: "強いプレッシャーを与える表現" },
  { pattern: /必ず/g, level: "high", message: "強制的な印象を与える表現" },
  { pattern: /絶対に/g, level: "high", message: "強制的な印象を与える表現" },
  { pattern: /当然/g, level: "high", message: "相手を責める印象を与える表現" },
  { pattern: /理解できない/g, level: "high", message: "相手の能力を否定する印象" },
  { pattern: /遅い/g, level: "medium", message: "批判的な印象" },
  { pattern: /待っている/g, level: "medium", message: "プレッシャーを与える表現" },
  { pattern: /期待していた/g, level: "medium", message: "間接的な批判になる可能性" },
  { pattern: /残念/g, level: "medium", message: "否定的な感情表現" },
  { pattern: /不満/g, level: "medium", message: "否定的な感情表現" },
  { pattern: /疑問/g, level: "low", message: "批判的に聞こえる可能性" },
  { pattern: /指摘/g, level: "low", message: "上から目線に聞こえる可能性" },
];

// 改善提案のパターン
const improvementSuggestions = [
  { trigger: /至急|早急/g, suggestion: "「お手数ですが」などのクッション言葉を追加し、具体的な理由と期限を明示する", example: "至急対応ください → お手数ですが、〇日までにご対応いただけますと、△△の準備が間に合うため助かります" },
  { trigger: /ご確認/g, suggestion: "「可能でしたら」などの表現を追加し、確認が必要な理由を説明する", example: "ご確認ください → 可能でしたら、〇〇についてご確認いただけますでしょうか。△△を進めるために必要となります" },
  { trigger: /すぐに/g, suggestion: "具体的な期限と理由を示し、相手の状況を考慮した表現にする", example: "すぐに返信ください → ご多忙中恐れ入りますが、〇日までにご返信いただけますと、次の工程に進めるため助かります" },
  { trigger: /遅延|問題|失敗/g, suggestion: "事実を客観的に伝え、非難せずに解決策を提案する", example: "納品の遅延が問題です → 納品予定日を過ぎておりますが、今後のスケジュールを調整したいと思います。何か障害があればお知らせください" },
  { trigger: /なぜ|どうして/g, suggestion: "「〜についてお伺いしたい」という表現に変更し、質問の意図を明確にする", example: "なぜ連絡がないのですか → 進捗状況についてお伺いできればと思います。何かお手伝いできることがあればお知らせください" },
  { trigger: /必ず|絶対/g, suggestion: "「できましたら」などの柔軟性を持たせる表現に変更する", example: "必ず期限を守ってください → できましたら期限内でのご対応をお願いいたします" },
  { trigger: /当然|理解できない/g, suggestion: "相手の立場を尊重し、自分の理解不足の可能性を認める表現にする", example: "当然ご存知だと思いますが → 既にご存知かもしれませんが、念のためお伝えします" },
  { trigger: /待っている|期待/g, suggestion: "相手への信頼を示しつつ、状況確認を丁寧に行う表現にする", example: "返信を待っています → ご多忙中恐れ入りますが、ご返信いただける時期について教えていただけますと幸いです" },
  { trigger: /残念|不満/g, suggestion: "感情表現を控え、事実と希望を客観的に伝える", example: "対応が遅く残念です → 予定より対応が遅れているようですが、今後のスケジュールについてご相談させていただけますか" },
];

// ポジティブ/ネガティブな表現
const sentimentPatterns = {
  positive: [
    /ありがとう/g, /感謝/g, /助かります/g, /幸いです/g, /よろしく/g, /期待/g, /楽しみ/g, /素晴らしい/g, /嬉しい/g,
    /ご協力/g, /お手数/g, /恐れ入り/g, /申し訳/g, /ご理解/g, /ご検討/g
  ],
  negative: [
    /残念/g, /申し訳/g, /遅延/g, /問題/g, /失敗/g, /不満/g, /困難/g, /難しい/g, /不具合/g, /クレーム/g,
    /至急/g, /早急/g, /必ず/g, /絶対/g, /当然/g, /理解できない/g, /遅い/g, /待っている/g, /疑問/g, /指摘/g
  ]
};

// 敬語・丁寧語のパターン
const politePatterns = [
  /でしょうか/g, /いただけますと/g, /お願いいたします/g, /ございます/g, /拝見/g, /承知/g, /恐れ入り/g, /存じ/g, /申し上げ/g,
  /いただき/g, /させていただき/g, /頂戴/g, /ご確認/g, /ご検討/g, /ご連絡/g, /ご返信/g, /ご理解/g, /ご協力/g
];

// 文章の複雑さを評価する関数
const evaluateComplexity = (text: string) => {
  const sentences = text.split(/[。.!?！？]/g).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / (sentences.length || 1);
  
  // 一文の平均文字数に基づいて複雑さを評価
  if (avgLength > 70) return { level: "high", message: "文章が長すぎます。一文を40文字以内に収めるよう分割してください" };
  if (avgLength > 50) return { level: "medium", message: "文章がやや長いです。簡潔な表現を心がけてください" };
  if (avgLength < 15) return { level: "low", message: "文章が短すぎる可能性があります。十分な情報を提供してください" };
  return { level: "good", message: "適切な長さの文章です" };
};

// 文章の明確さを評価する関数
const evaluateClarity = (text: string) => {
  // 曖昧な表現のパターン
  const ambiguousPatterns = [
    /かもしれません/g, /思います/g, /だいたい/g, /おそらく/g, /など/g, /等/g, /いろいろ/g, /諸々/g,
    /場合によっては/g, /可能性があります/g, /検討します/g, /考えます/g, /予定です/g, /するつもりです/g
  ];
  
  let ambiguousCount = 0;
  ambiguousPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) ambiguousCount += matches.length;
  });
  
  // 曖昧な表現の数に基づいて明確さを評価
  if (ambiguousCount > 4) return { level: "high", message: "曖昧な表現が多すぎます。具体的な内容や日時を明示してください" };
  if (ambiguousCount > 2) return { level: "medium", message: "いくつかの曖昧な表現があります。より具体的な表現に置き換えてください" };
  if (ambiguousCount === 0 && text.length > 100) return { level: "low", message: "柔軟性を持たせる表現が少ない可能性があります" };
  return { level: "good", message: "適度に明確な表現が使われています" };
};

// 文の構造を評価する関数
const evaluateStructure = (text: string) => {
  // 主語の欠落をチェック
  const sentences = text.split(/[。.!?！？]/g).filter(s => s.trim().length > 0);
  const subjectMissingCount = sentences.filter(s => 
    !s.match(/は|が|も|には|からは|では|私|わたし|弊社|当社|我々|われわれ|チーム|部署|[名氏]様|殿|さん/)
  ).length;
  
  const subjectMissingRatio = subjectMissingCount / sentences.length;
  
  if (subjectMissingRatio > 0.5 && sentences.length > 2) {
    return { level: "high", message: "主語が不明確な文が多いです。「私は」「弊社は」などの主語を明示してください" };
  }
  if (subjectMissingRatio > 0.3 && sentences.length > 2) {
    return { level: "medium", message: "一部の文で主語が不明確です。誰が何をするのか明確にしてください" };
  }
  return { level: "good", message: "文の構造は概ね適切です" };
};

// スコア計算の関数
const calculateScore = (
  warnings: { level: string; text: string; message: string; index: number }[],
  sentimentBalance: number,
  complexityLevel: string,
  clarityLevel: string,
  structureLevel: string,
  politenessLevel: string
): number => {
  // 基本スコア
  let score = 100;
  
  // 警告による減点
  const highWarnings = warnings.filter(w => w.level === "high").length;
  const mediumWarnings = warnings.filter(w => w.level === "medium").length;
  const lowWarnings = warnings.filter(w => w.level === "low").length;
  
  score -= highWarnings * 20; // より厳しく
  score -= mediumWarnings * 10;
  score -= lowWarnings * 5;
  
  // 感情バランスによる調整
  if (sentimentBalance < -0.5) score -= 15;
  else if (sentimentBalance < -0.2) score -= 10;
  else if (sentimentBalance > 0.5) score += 5;
  
  // 複雑さによる調整
  if (complexityLevel === "high") score -= 15;
  else if (complexityLevel === "medium") score -= 5;
  else if (complexityLevel === "good") score += 5;
  
  // 明確さによる調整
  if (clarityLevel === "high") score -= 15;
  else if (clarityLevel === "medium") score -= 5;
  else if (clarityLevel === "good") score += 5;
  
  // 構造による調整
  if (structureLevel === "high") score -= 15;
  else if (structureLevel === "medium") score -= 5;
  else if (structureLevel === "good") score += 5;
  
  // 丁寧さによる調整
  if (politenessLevel === "low") score -= 10;
  else if (politenessLevel === "high") score += 5;
  
  // スコアの範囲を0-100に制限
  return Math.max(0, Math.min(100, score));
};

export function EmailAnalyzer({ isDarkMode, onScoreUpdate }: { isDarkMode?: boolean, onScoreUpdate?: (score: number) => void }) {
  const [emailContent, setEmailContent] = useState("")
  const [analysis, setAnalysis] = useState<null | {
    score: number
    warnings: string[]
    suggestions: string[]
    sentiment: {
      positive: number
      negative: number
      balance: number
    }
    complexity: {
      level: string
      message: string
      sentenceCount: number
      avgSentenceLength: number
    }
    politeness: {
      level: string
      count: number
      percentage: number
    }
    clarity: {
      level: string
      message: string
    }
    structure: {
      level: string
      message: string
    }
    detailedSuggestions: {
      trigger: string
      suggestion: string
      example: string
    }[]
  }>(null)
  const [realtimeWarnings, setRealtimeWarnings] = useState<{
    text: string;
    level: string;
    message: string;
    index: number;
  }[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // リアルタイム分析
  useEffect(() => {
    if (!emailContent) {
      setRealtimeWarnings([]);
      return;
    }

    const warnings: {
      text: string;
      level: string;
      message: string;
      index: number;
    }[] = [];

    problematicPatterns.forEach(({ pattern, level, message }) => {
      let match;
      pattern.lastIndex = 0; // 正規表現のインデックスをリセット
      
      while ((match = pattern.exec(emailContent)) !== null) {
        warnings.push({
          text: match[0],
          level,
          message,
          index: match.index,
        });
      }
    });

    setRealtimeWarnings(warnings);
  }, [emailContent]);

  // 文面をクリアする関数
  const clearEmailContent = () => {
    setEmailContent("");
    setAnalysis(null);
    setActiveTab("overview");
  };

  const analyzeEmail = () => {
    setIsAnalyzing(true);
    
    // 少し遅延を入れて分析中の状態を表示
    setTimeout(() => {
      // 警告の数と種類に基づいてスコアを計算
      const highWarnings = realtimeWarnings.filter(w => w.level === "high").length;
      const mediumWarnings = realtimeWarnings.filter(w => w.level === "medium").length;
      const lowWarnings = realtimeWarnings.filter(w => w.level === "low").length;
      
      // 改善提案を生成
      const suggestions: string[] = [];
      const detailedSuggestions: { trigger: string; suggestion: string; example: string }[] = [];
      
      improvementSuggestions.forEach(({ trigger, suggestion, example }) => {
        trigger.lastIndex = 0;
        if (trigger.test(emailContent) && !suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
          detailedSuggestions.push({
            trigger: trigger.toString().replace(/\//g, '').replace(/g/g, ''),
            suggestion,
            example
          });
        }
      });

      // 警告メッセージを生成
      const warningMessages = realtimeWarnings.map(w => 
        `「${w.text}」という表現は${w.message}があります。`
      );

      // 重複を削除
      const uniqueWarnings = [...new Set(warningMessages)];

      // 感情分析
      let positiveCount = 0;
      let negativeCount = 0;
      
      sentimentPatterns.positive.forEach(pattern => {
        pattern.lastIndex = 0;
        const matches = emailContent.match(pattern);
        if (matches) positiveCount += matches.length;
      });
      
      sentimentPatterns.negative.forEach(pattern => {
        pattern.lastIndex = 0;
        const matches = emailContent.match(pattern);
        if (matches) negativeCount += matches.length;
      });
      
      const totalSentiment = positiveCount + negativeCount;
      const sentimentBalance = totalSentiment === 0 ? 0 : (positiveCount - negativeCount) / totalSentiment;

      // 文章の複雑さ分析
      const sentences = emailContent.split(/[。.!?！？]/g).filter(s => s.trim().length > 0);
      const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / (sentences.length || 1);
      const complexityEval = evaluateComplexity(emailContent);

      // 敬語・丁寧語の分析
      let politeCount = 0;
      politePatterns.forEach(pattern => {
        pattern.lastIndex = 0;
        const matches = emailContent.match(pattern);
        if (matches) politeCount += matches.length;
      });
      
      const words = emailContent.split(/\s+/).length;
      const politePercentage = words === 0 ? 0 : (politeCount / words) * 100;
      let politenessLevel = "low";
      if (politePercentage > 15) politenessLevel = "high";
      else if (politePercentage > 5) politenessLevel = "medium";

      // 文章の明確さ分析
      const clarityEval = evaluateClarity(emailContent);
      
      // 文の構造分析
      const structureEval = evaluateStructure(emailContent);
      
      // 総合スコアの計算
      const score = calculateScore(
        realtimeWarnings, 
        sentimentBalance, 
        complexityEval.level, 
        clarityEval.level, 
        structureEval.level, 
        politenessLevel
      );

      const result = {
        score,
        warnings: uniqueWarnings,
        suggestions,
        sentiment: {
          positive: positiveCount,
          negative: negativeCount,
          balance: sentimentBalance
        },
        complexity: {
          level: complexityEval.level,
          message: complexityEval.message,
          sentenceCount: sentences.length,
          avgSentenceLength
        },
        politeness: {
          level: politenessLevel,
          count: politeCount,
          percentage: politePercentage
        },
        clarity: {
          level: clarityEval.level,
          message: clarityEval.message
        },
        structure: {
          level: structureEval.level,
          message: structureEval.message
        },
        detailedSuggestions
      };

      setAnalysis(result);
      setIsAnalyzing(false);
      setActiveTab("overview");
      
      // スコアを親コンポーネントに通知
      if (onScoreUpdate) {
        onScoreUpdate(result.score);
      }
    }, 500); // 500ミリ秒の遅延
  };

  // テキストに警告をハイライト表示する関数
  const highlightText = () => {
    if (!emailContent || realtimeWarnings.length === 0) {
      return <div>{emailContent}</div>;
    }

    // 警告箇所をインデックスでソート
    const sortedWarnings = [...realtimeWarnings].sort((a, b) => a.index - b.index);
    
    let lastIndex = 0;
    const elements: JSX.Element[] = [];

    sortedWarnings.forEach((warning, i) => {
      // 警告の前のテキスト
      if (warning.index > lastIndex) {
        elements.push(
          <span key={`text-${i}`}>
            {emailContent.substring(lastIndex, warning.index)}
          </span>
        );
      }

      // 警告テキスト
      const warningColor = 
        warning.level === "high" ? "bg-red-200 text-red-800" :
        warning.level === "medium" ? "bg-amber-200 text-amber-800" :
        "bg-yellow-100 text-yellow-800";

      elements.push(
        <span 
          key={`warning-${i}`} 
          className={`${warningColor} rounded px-1 relative group cursor-help`}
          title={warning.message}
        >
          {emailContent.substring(warning.index, warning.index + warning.text.length)}
          <span className="absolute bottom-full left-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {warning.message}
          </span>
        </span>
      );

      lastIndex = warning.index + warning.text.length;
    });

    // 残りのテキスト
    if (lastIndex < emailContent.length) {
      elements.push(
        <span key="text-last">
          {emailContent.substring(lastIndex)}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap">{elements}</div>;
  };

  // 感情バランスのゲージを表示する関数
  const renderSentimentGauge = () => {
    if (!analysis) return null;
    
    const { balance } = analysis.sentiment;
    const percentage = ((balance + 1) / 2) * 100; // -1〜1の範囲を0〜100%に変換
    
    let color = "bg-amber-500";
    if (balance > 0.3) color = "bg-green-500";
    else if (balance < -0.3) color = "bg-red-500";
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span>ネガティブ</span>
          <span>ニュートラル</span>
          <span>ポジティブ</span>
        </div>
        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4">
      <Card className={`${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}>
        <CardHeader>
          <CardTitle>メール文面診断</CardTitle>
          <CardDescription className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            メール文面を入力して、ストレスを与える可能性のある表現を検出します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-content" className={`${isDarkMode ? 'text-white' : 'text-black'}`}>メール文面</Label>
            <Textarea
              id="email-content"
              placeholder="ここにメール文面を入力してください..."
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              className={`min-h-[200px] ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-black border-gray-300'}`}
            />
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearEmailContent} className={`${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-700'}`}>
              クリア
            </Button>
            <Button onClick={analyzeEmail} disabled={emailContent.trim().length === 0 || isAnalyzing} className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  分析中...
                </>
              ) : (
                "分析"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {analysis && (
        <Card className={`${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}>
          <CardHeader>
            <CardTitle>分析結果</CardTitle>
            <CardDescription className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              スコア: <span className={
                analysis.score > 80 ? "text-green-400" : 
                analysis.score > 60 ? "text-amber-400" : 
                "text-red-400"
              }>{analysis.score}/100</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} grid grid-cols-2 mb-4`}>
                <TabsTrigger value="overview" className={`data-[state=active]:${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>概要</TabsTrigger>
                <TabsTrigger value="detailed" className={`data-[state=active]:${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>詳細分析</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                {analysis.warnings.length > 0 && (
                  <Alert variant="destructive" className={`${isDarkMode ? 'bg-red-900 border-red-800' : 'bg-red-50 border-red-200'} ${isDarkMode ? 'text-white' : 'text-red-800'}`}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>注意点</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysis.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {analysis.suggestions.length > 0 && (
                  <Alert className={`${isDarkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-200'} ${isDarkMode ? 'text-white' : 'text-blue-800'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>改善提案</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                {analysis.warnings.length === 0 && analysis.suggestions.length === 0 && (
                  <Alert className={`${isDarkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-200'} ${isDarkMode ? 'text-white' : 'text-green-800'}`}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>良好な文面です</AlertTitle>
                    <AlertDescription>
                      問題となる表現は検出されませんでした。詳細分析タブで文章の構造や明確さについて確認できます。
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-6">
                {/* 感情分析 */}
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 className={`h-5 w-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                    <h3 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>感情分析</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white'} p-3 rounded-md text-center`}>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-1`}>ポジティブな表現</div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{analysis.sentiment.positive}</div>
                    </div>
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white'} p-3 rounded-md text-center`}>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-1`}>ネガティブな表現</div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{analysis.sentiment.negative}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>感情バランス</h4>
                    {renderSentimentGauge()}
                  </div>
                </div>
                
                {/* 文章の複雑さ */}
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className={`h-5 w-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                    <h3 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>文章の複雑さ</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white'} p-3 rounded-md text-center`}>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-1`}>文の数</div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{analysis.complexity.sentenceCount}</div>
                    </div>
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white'} p-3 rounded-md text-center`}>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} mb-1`}>平均文字数/文</div>
                      <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{Math.round(analysis.complexity.avgSentenceLength)}</div>
                    </div>
                  </div>
                  
                  <Alert className={`
                    ${analysis.complexity.level === "high" ? 
                      (isDarkMode ? "bg-red-900 border-red-800" : "bg-red-50 border-red-200") : 
                    analysis.complexity.level === "medium" ? 
                      (isDarkMode ? "bg-amber-900 border-amber-800" : "bg-amber-50 border-amber-200") : 
                      (isDarkMode ? "bg-green-900 border-green-800" : "bg-green-50 border-green-200")} 
                    ${isDarkMode ? 'text-white' : analysis.complexity.level === "high" ? 'text-red-800' : analysis.complexity.level === "medium" ? 'text-amber-800' : 'text-green-800'}
                  `}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {analysis.complexity.message}
                    </AlertDescription>
                  </Alert>
                </div>
                
                {/* 敬語・丁寧語 */}
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className={`h-5 w-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                    <h3 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>敬語・丁寧語の使用</h3>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>丁寧さレベル</span>
                      <span className={`text-sm ${
                        analysis.politeness.level === "high" ? (isDarkMode ? "text-green-400" : "text-green-600") : 
                        analysis.politeness.level === "medium" ? (isDarkMode ? "text-amber-400" : "text-amber-600") : 
                        (isDarkMode ? "text-red-400" : "text-red-600")
                      }`}>
                        {analysis.politeness.level === "high" ? "高" : 
                         analysis.politeness.level === "medium" ? "中" : "低"}
                      </span>
                    </div>
                    <div className={`h-2 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                      <div 
                        className={`h-full ${
                          analysis.politeness.level === "high" ? "bg-green-500" : 
                          analysis.politeness.level === "medium" ? "bg-amber-500" : 
                          "bg-red-500"
                        } rounded-full`} 
                        style={{ width: `${Math.min(100, analysis.politeness.percentage * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    敬語・丁寧語の使用数: <span className={`${isDarkMode ? 'text-white' : 'text-black'} font-medium`}>{analysis.politeness.count}</span>
                  </div>
                </div>
                
                {/* 文章の明確さ */}
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className={`h-5 w-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                    <h3 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>文章の明確さ</h3>
                  </div>
                  
                  <Alert className={`
                    ${analysis.clarity.level === "high" ? 
                      (isDarkMode ? "bg-red-900 border-red-800" : "bg-red-50 border-red-200") : 
                    analysis.clarity.level === "medium" ? 
                      (isDarkMode ? "bg-amber-900 border-amber-800" : "bg-amber-50 border-amber-200") : 
                      (isDarkMode ? "bg-green-900 border-green-800" : "bg-green-50 border-green-200")} 
                    ${isDarkMode ? 'text-white' : analysis.clarity.level === "high" ? 'text-red-800' : analysis.clarity.level === "medium" ? 'text-amber-800' : 'text-green-800'}
                  `}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {analysis.clarity.message}
                    </AlertDescription>
                  </Alert>
                </div>
                
                {/* 構造分析 */}
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className={`h-5 w-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                    <h3 className={`text-md font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>文の構造</h3>
                  </div>
                  
                  <Alert className={`
                    ${analysis.structure.level === "high" ? 
                      (isDarkMode ? "bg-red-900 border-red-800" : "bg-red-50 border-red-200") : 
                    analysis.structure.level === "medium" ? 
                      (isDarkMode ? "bg-amber-900 border-amber-800" : "bg-amber-50 border-amber-200") : 
                      (isDarkMode ? "bg-green-900 border-green-800" : "bg-green-50 border-green-200")} 
                    ${isDarkMode ? 'text-white' : analysis.structure.level === "high" ? 'text-red-800' : analysis.structure.level === "medium" ? 'text-amber-800' : 'text-green-800'}
                  `}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {analysis.structure.message}
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

