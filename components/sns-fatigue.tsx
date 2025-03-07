"use client"

import React, { useState, useEffect } from "react"
import { Gauge, TrendingUp, AlertTriangle, Info, Clock, Activity, Users, RefreshCw, HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// モックデータ - 実際のアプリではAPIから取得
const mockFollowHistory = [
  { month: "1月", count: 120 },
  { month: "2月", count: 150 },
  { month: "3月", count: 180 },
  { month: "4月", count: 210 },
  { month: "5月", count: 250 },
  { month: "6月", count: 280 },
  { month: "7月", count: 310 },
  { month: "8月", count: 342 },
];

// SNS利用時間のモックデータ
const mockUsageTime = [
  { day: "月", minutes: 45 },
  { day: "火", minutes: 60 },
  { day: "水", minutes: 30 },
  { day: "木", minutes: 75 },
  { day: "金", minutes: 90 },
  { day: "土", minutes: 120 },
  { day: "日", minutes: 105 },
];

// ストレスレベルの計算関数
const calculateStressLevel = (followCount: number, usageMinutes: number) => {
  // フォロー数によるストレス
  let followStress = 0;
  if (followCount < 200) followStress = 25;
  else if (followCount < 400) followStress = 50;
  else followStress = 75;
  
  // 利用時間によるストレス
  let timeStress = 0;
  if (usageMinutes < 30) timeStress = 20;
  else if (usageMinutes < 60) timeStress = 40;
  else if (usageMinutes < 90) timeStress = 60;
  else timeStress = 80;
  
  // 総合ストレスレベル（フォロー数と利用時間の加重平均）
  const totalStress = (followStress * 0.4) + (timeStress * 0.6);
  
  let level = "低";
  let color = "green";
  
  if (totalStress > 70) {
    level = "高";
    color = "red";
  } else if (totalStress > 40) {
    level = "中";
    color = "amber";
  }
  
  return { 
    level, 
    percentage: Math.round(totalStress), 
    color,
    followStress: followStress,
    timeStress: timeStress
  };
};

// 推奨フォロー上限の計算
const calculateRecommendedFollows = (followCount: number, stressLevel: number) => {
  if (stressLevel > 70) return Math.max(200, followCount - 100);
  if (stressLevel > 40) return followCount;
  return followCount + 100;
};

// 推奨利用時間の計算
const calculateRecommendedTime = (currentMinutes: number) => {
  if (currentMinutes > 90) return 60;
  if (currentMinutes > 60) return 45;
  if (currentMinutes > 30) return 30;
  return currentMinutes;
};

export function SNSFatigue({ isDarkMode, onStressUpdate }: { isDarkMode?: boolean, onStressUpdate?: (stressPercentage: number, stressLevel: string, followCount: number) => void }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [followCount, setFollowCount] = useState(0);
  const [usageTime, setUsageTime] = useState(0);
  const [openHelp, setOpenHelp] = useState(false);
  const [isFirstUse, setIsFirstUse] = useState(true);
  const [helpSection, setHelpSection] = useState("basic");
  const [stressInfo, setStressInfo] = useState({
    level: "低",
    percentage: 0,
    color: "green",
    followStress: 0,
    timeStress: 0
  });
  const [recommendedFollows, setRecommendedFollows] = useState(0);
  const [recommendedTime, setRecommendedTime] = useState(0);
  
  // 平均利用時間の計算
  const avgUsageTime = mockUsageTime.reduce((sum, day) => sum + day.minutes, 0) / mockUsageTime.length;
  
  // フォロー数の増加率
  const followGrowthRate = ((mockFollowHistory[mockFollowHistory.length - 1].count - mockFollowHistory[0].count) / mockFollowHistory[0].count) * 100;
  
  // ストレスレベルの説明テキスト
  const getStressLevelExplanation = () => {
    if (isFirstUse) {
      return "あなたの利用状況を入力して、SNS疲労度を分析しましょう。";
    }
    
    if (stressInfo.level === "高") {
      return "SNSの利用がメンタルヘルスに悪影響を与えている可能性があります。フォロー数の削減と利用時間の制限を検討してください。";
    } else if (stressInfo.level === "中") {
      return "SNSの利用がやや過剰になっています。定期的に休憩を取り、利用時間を意識してください。";
    } else {
      return "健全なSNS利用状況です。このバランスを維持しましょう。";
    }
  };
  
  // 分析を開始する関数
  const startAnalysis = () => {
    // ストレス情報を計算
    const stressResult = calculateStressLevel(followCount, usageTime);
    setStressInfo({
      percentage: stressResult.percentage,
      level: stressResult.level,
      color: stressResult.color,
      followStress: stressResult.followStress,
      timeStress: stressResult.timeStress
    });
    
    // 推奨設定を計算
    const recFollows = calculateRecommendedFollows(followCount, stressResult.percentage);
    setRecommendedFollows(recFollows);
    
    const recTime = calculateRecommendedTime(usageTime);
    setRecommendedTime(recTime);
    
    // 初回利用フラグをオフに
    setIsFirstUse(false);
    
    // 分析タブに切り替え
    setActiveTab("recommendations");
    
    // ストレスレベルを親コンポーネントに通知
    if (onStressUpdate) {
      onStressUpdate(stressResult.percentage, stressResult.level, followCount);
    }
  };
  
  // サンプルデータを設定する関数
  const setSampleData = () => {
    // 一般的なSNSユーザーの平均的な値を設定
    const sampleFollowCount = 200;
    const sampleUsageTime = 60;
    
    setFollowCount(sampleFollowCount);
    setUsageTime(sampleUsageTime);
    
    // 分析を実行
    const stressResult = calculateStressLevel(sampleFollowCount, sampleUsageTime);
    setStressInfo({
      percentage: stressResult.percentage,
      level: stressResult.level,
      color: stressResult.color,
      followStress: stressResult.followStress,
      timeStress: stressResult.timeStress
    });
    
    // 推奨設定を計算
    const recFollows = calculateRecommendedFollows(sampleFollowCount, stressResult.percentage);
    setRecommendedFollows(recFollows);
    
    const recTime = calculateRecommendedTime(sampleUsageTime);
    setRecommendedTime(recTime);
    
    // 初回利用フラグをオフに
    setIsFirstUse(false);
    
    // 分析タブに切り替え
    setActiveTab("dashboard");
    
    // ストレスレベルを親コンポーネントに通知
    if (onStressUpdate) {
      onStressUpdate(stressResult.percentage, stressResult.level, sampleFollowCount);
    }
  };
  
  return (
    <div className="grid gap-4">
      <Card className={`${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-black'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SNS疲労度分析</CardTitle>
              <CardDescription className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                SNSの利用状況とストレスレベルを可視化
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        {openHelp && (
          <div className="px-6 pb-2">
            <Alert className={`${isDarkMode ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
              <AlertDescription className={`text-sm ${isDarkMode ? 'text-white' : 'text-black'}`}>
                {helpSection === "basic" && (
                  <div className="space-y-3">
                    <p className="text-sm">
                      SNS疲労度分析は、あなたのSNS利用状況を総合的に分析し、メンタルヘルスへの影響を評価するツールです。
                      {isFirstUse && (
                        <span className="block mt-1 font-medium">まずは下のフォームにあなたのSNS利用状況を入力してください。サンプルデータを使用することもできます。</span>
                      )}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                      <div className={`bg-${isDarkMode ? 'blue-800/50' : 'blue-800/50'} p-4 rounded-md`}>
                        <h4 className="text-sm font-medium flex items-center mb-2">
                          <Users className="h-4 w-4 mr-1 text-blue-400" />
                          フォロー数の影響
                        </h4>
                        <div className="space-y-2">
                          <p className="text-xs text-blue-100">
                            フォロー数が多すぎると以下のような影響が出る可能性があります：
                          </p>
                          <ul className="text-xs text-blue-100 list-disc pl-4 space-y-1">
                            <li>情報過多によるストレス</li>
                            <li>重要な情報の見逃し</li>
                            <li>タイムラインの混雑化</li>
                            <li>SNSへの依存度増加</li>
                          </ul>
                          <div className="mt-3 p-2 bg-blue-900/50 rounded text-xs">
                            <p className="font-medium text-blue-300">推奨フォロー数</p>
                            <p className="text-blue-100">一般的に200-400の範囲が推奨されています</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`bg-${isDarkMode ? 'purple-800/50' : 'purple-800/50'} p-4 rounded-md`}>
                        <h4 className="text-sm font-medium flex items-center mb-2">
                          <Clock className="h-4 w-4 mr-1 text-purple-400" />
                          利用時間の影響
                        </h4>
                        <div className="space-y-2">
                          <p className="text-xs text-purple-100">
                            長時間のSNS利用は以下のような影響をもたらす可能性があります：
                          </p>
                          <ul className="text-xs text-purple-100 list-disc pl-4 space-y-1">
                            <li>睡眠の質の低下</li>
                            <li>目の疲れと頭痛</li>
                            <li>現実生活への影響</li>
                            <li>メンタルヘルスの悪化</li>
                          </ul>
                          <div className="mt-3 p-2 bg-purple-900/50 rounded text-xs">
                            <p className="font-medium text-purple-300">推奨利用時間</p>
                            <p className="text-purple-100">1日30-60分が健全な利用時間とされています</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`bg-${isDarkMode ? 'slate-800/50' : 'slate-800/50'} p-4 rounded-md mt-4`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>健全なSNS利用のための4つのポイント</h3>
                      </div>
                      
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>1</div>
                          <div>
                            <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>フォロー整理</p>
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>定期的にフォローリストを見直し、本当に必要な人だけをフォローしましょう。</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>2</div>
                          <div>
                            <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>リスト活用</p>
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>重要な人をリストにまとめて、効率的に情報をチェックしましょう。</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>3</div>
                          <div>
                            <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>時間制限</p>
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>アプリの使用時間を設定し、通知で知らせるようにしましょう。</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>4</div>
                          <div>
                            <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>デジタルデトックス</p>
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>週に1日はSNSを使わない日を作り、リフレッシュしましょう。</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {helpSection === "stress" && (
                  <div className="space-y-4">
                    <p className="text-sm">
                      SNS疲労度（ストレスレベル）は、科学的な研究に基づいて設計された複合的な評価システムです。
                    </p>
                    
                    <div className={`bg-${isDarkMode ? 'slate-800/50' : 'slate-800/50'} p-4 rounded-md`}>
                      <h4 className="text-sm font-medium mb-3">ストレスレベルの計算方法</h4>
                      <div className="space-y-4">
                        <div className={`bg-${isDarkMode ? 'blue-900/30' : 'blue-900/30'} p-3 rounded-md`}>
                          <p className="text-sm font-medium text-blue-400 mb-2">フォロー数によるストレス (40%)</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className={`p-2 bg-${isDarkMode ? 'green-900/30' : 'green-900/30'} rounded text-center`}>
                              <p className="text-xs font-medium text-green-400">低ストレス</p>
                              <p className="text-xs text-slate-400">200未満</p>
                              <p className="text-xs text-green-400">25%</p>
                            </div>
                            <div className={`p-2 bg-${isDarkMode ? 'amber-900/30' : 'amber-900/30'} rounded text-center`}>
                              <p className="text-xs font-medium text-amber-400">中ストレス</p>
                              <p className="text-xs text-slate-400">200-400</p>
                              <p className="text-xs text-amber-400">50%</p>
                            </div>
                            <div className={`p-2 bg-${isDarkMode ? 'red-900/30' : 'red-900/30'} rounded text-center`}>
                              <p className="text-xs font-medium text-red-400">高ストレス</p>
                              <p className="text-xs text-slate-400">400以上</p>
                              <p className="text-xs text-red-400">75%</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`bg-${isDarkMode ? 'purple-900/30' : 'purple-900/30'} p-3 rounded-md`}>
                          <p className="text-sm font-medium text-purple-400 mb-2">利用時間によるストレス (60%)</p>
                          <div className="grid grid-cols-4 gap-2">
                            <div className={`p-2 bg-${isDarkMode ? 'green-900/30' : 'green-900/30'} rounded text-center`}>
                              <p className="text-xs font-medium text-green-400">低</p>
                              <p className="text-xs text-slate-400">30分未満</p>
                              <p className="text-xs text-green-400">20%</p>
                            </div>
                            <div className={`p-2 bg-${isDarkMode ? 'emerald-900/30' : 'emerald-900/30'} rounded text-center`}>
                              <p className="text-xs font-medium text-emerald-400">中低</p>
                              <p className="text-xs text-slate-400">30-60分</p>
                              <p className="text-xs text-emerald-400">40%</p>
                            </div>
                            <div className={`p-2 bg-${isDarkMode ? 'amber-900/30' : 'amber-900/30'} rounded text-center`}>
                              <p className="text-xs font-medium text-amber-400">中高</p>
                              <p className="text-xs text-slate-400">60-90分</p>
                              <p className="text-xs text-amber-400">60%</p>
                            </div>
                            <div className={`p-2 bg-${isDarkMode ? 'red-900/30' : 'red-900/30'} rounded text-center`}>
                              <p className="text-xs font-medium text-red-400">高</p>
                              <p className="text-xs text-slate-400">90分以上</p>
                              <p className="text-xs text-red-400">80%</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className={`bg-${isDarkMode ? 'slate-800' : 'slate-800'} p-3 rounded-md`}>
                          <p className="text-sm font-medium mb-2">総合ストレスレベルの計算式</p>
                          <div className={`bg-${isDarkMode ? 'slate-900' : 'slate-900'} p-2 rounded text-sm font-mono`}>
                            <p className="text-blue-400">総合ストレス = (フォローストレス × 0.4) + (時間ストレス × 0.6)</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            利用時間の影響をより重視する設計になっています。これは、過度な利用時間がメンタルヘルスに与える直接的な影響が大きいためです。
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className={`bg-${isDarkMode ? 'green-900/30' : 'green-900/30'} p-3 rounded-md`}>
                        <h4 className="text-sm font-medium text-green-400 mb-2">低ストレス (0-40%)</h4>
                        <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                          <li>健全なSNS利用状態</li>
                          <li>情報管理が適切</li>
                          <li>生活への影響が少ない</li>
                        </ul>
                      </div>
                      <div className={`bg-${isDarkMode ? 'amber-900/30' : 'amber-900/30'} p-3 rounded-md`}>
                        <h4 className="text-sm font-medium text-amber-400 mb-2">中ストレス (41-70%)</h4>
                        <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                          <li>やや過剰な利用</li>
                          <li>情報過多の兆候</li>
                          <li>生活への影響が出始める</li>
                        </ul>
                      </div>
                      <div className={`bg-${isDarkMode ? 'red-900/30' : 'red-900/30'} p-3 rounded-md`}>
                        <h4 className="text-sm font-medium text-red-400 mb-2">高ストレス (71-100%)</h4>
                        <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                          <li>過度なSNS依存</li>
                          <li>深刻な情報過多</li>
                          <li>生活への重大な影響</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {helpSection === "recommendations" && (
                  <div className="space-y-4">
                    <p className="text-sm">
                      あなたの利用状況に基づいて、最適なSNS利用方法を提案します。これらの推奨事項は、研究データと実践的な知見に基づいています。
                    </p>
                    
                    <div className={`bg-${isDarkMode ? 'slate-800/50' : 'slate-800/50'} p-4 rounded-md`}>
                      <h4 className="text-sm font-medium mb-3">推奨設定の決定方法</h4>
                      
                      <div className="space-y-4">
                        <div className={`bg-${isDarkMode ? 'blue-900/30' : 'blue-900/30'} p-3 rounded-md`}>
                          <p className="text-sm font-medium text-blue-400 mb-2">フォロー数の最適化</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${isDarkMode ? 'red-500' : 'red-500'}`}></div>
                              <p className="text-xs">高ストレス時: 現在より100減らす（最低200）</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${isDarkMode ? 'amber-500' : 'amber-500'}`}></div>
                              <p className="text-xs">中ストレス時: 現在の数を維持</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${isDarkMode ? 'green-500' : 'green-500'}`}></div>
                              <p className="text-xs">低ストレス時: 現在より100増やしても安全</p>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-blue-950 rounded">
                            <p className="text-xs text-blue-200">
                              フォロー数の調整は、情報過多を防ぎながら、必要な情報源は維持することを目的としています。
                            </p>
                          </div>
                        </div>
                        
                        <div className={`bg-${isDarkMode ? 'purple-900/30' : 'purple-900/30'} p-3 rounded-md`}>
                          <p className="text-sm font-medium text-purple-400 mb-2">利用時間の最適化</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${isDarkMode ? 'red-500' : 'red-500'}`}></div>
                              <p className="text-xs">90分以上: 60分に削減</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${isDarkMode ? 'amber-500' : 'amber-500'}`}></div>
                              <p className="text-xs">60-90分: 45分に削減</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${isDarkMode ? 'green-500' : 'green-500'}`}></div>
                              <p className="text-xs">30-60分: 30分に削減</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${isDarkMode ? 'emerald-500' : 'emerald-500'}`}></div>
                              <p className="text-xs">30分未満: 現状維持</p>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-purple-950 rounded">
                            <p className="text-xs text-purple-200">
                              研究によると、1日30分以内のSNS利用が最も健全で、メンタルヘルスへの悪影響が最小限とされています。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`bg-${isDarkMode ? 'slate-800/50' : 'slate-800/50'} p-4 rounded-md`}>
                      <h4 className="text-sm font-medium mb-3">実践的な改善ステップ</h4>
                      <div className="grid gap-3">
                        <div className={`bg-${isDarkMode ? 'slate-900/50' : 'slate-900/50'} p-3 rounded-md`}>
                          <p className="text-sm font-medium text-blue-400 mb-2">Step 1: フォロー整理</p>
                          <div className="space-y-2">
                            <p className="text-xs">1. 最近の投稿をチェック</p>
                            <p className="text-xs">2. 興味・関心の再評価</p>
                            <p className="text-xs">3. 重要度でラベル付け</p>
                            <p className="text-xs">4. 整理と削除</p>
                          </div>
                        </div>
                        
                        <div className={`bg-${isDarkMode ? 'slate-900/50' : 'slate-900/50'} p-3 rounded-md`}>
                          <p className="text-sm font-medium text-purple-400 mb-2">Step 2: 時間管理</p>
                          <div className="space-y-2">
                            <p className="text-xs">1. 利用時間帯の設定</p>
                            <p className="text-xs">2. タイマーの活用</p>
                            <p className="text-xs">3. 通知の制限</p>
                            <p className="text-xs">4. デジタルデトックス日の設定</p>
                          </div>
                        </div>
                        
                        <div className={`bg-${isDarkMode ? 'slate-900/50' : 'slate-900/50'} p-3 rounded-md`}>
                          <p className="text-sm font-medium text-green-400 mb-2">Step 3: 習慣化</p>
                          <div className="space-y-2">
                            <p className="text-xs">1. 週次の利用状況確認</p>
                            <p className="text-xs">2. 月次のフォロー見直し</p>
                            <p className="text-xs">3. ストレスレベルのモニタリング</p>
                            <p className="text-xs">4. 改善目標の設定</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <CardContent>
          {isFirstUse && (
            <div className={`p-6 rounded-lg mb-6 text-center ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>SNS疲労度分析へようこそ</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                あなたのSNS利用状況を入力して、メンタルヘルスへの影響を分析しましょう。
                フォロー数と1日の利用時間を入力するだけで、あなたのSNS利用によるストレスレベルを計算します。
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setOpenHelp(true)} variant="outline" className={`${isDarkMode ? 'border-slate-600 text-slate-300' : 'border-gray-300 text-gray-700'}`}>
                  <HelpCircle className="h-4 w-4 mr-1" />
                  使い方を見る
                </Button>
                <Button onClick={setSampleData} className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
                  サンプルデータを使用
                </Button>
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'} grid grid-cols-3 mb-4`}>
              <TabsTrigger value="dashboard" className={`data-[state=active]:${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>ダッシュボード</TabsTrigger>
              <TabsTrigger value="trends" className={`data-[state=active]:${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>トレンド</TabsTrigger>
              <TabsTrigger value="recommendations" className={`data-[state=active]:${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>推奨</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>あなたのSNS利用状況</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>フォロー数:</label>
                      <Input
                        type="number"
                        value={followCount}
                        onChange={(e) => {
                          setFollowCount(Number(e.target.value));
                          if (isFirstUse && Number(e.target.value) > 0) setIsFirstUse(false);
                        }}
                        className={`w-20 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>1日の利用時間 (分):</label>
                      <Input
                        type="number"
                        value={usageTime}
                        onChange={(e) => {
                          setUsageTime(Number(e.target.value));
                          if (isFirstUse && Number(e.target.value) > 0) setIsFirstUse(false);
                        }}
                        className={`w-20 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {(!isFirstUse || followCount > 0 || usageTime > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>SNSストレスメーター</h3>
                      <Button variant="outline" size="sm" onClick={() => setOpenHelp(true)} className={`text-xs ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-700'}`}>
                        <HelpCircle className="h-3 w-3 mr-1" />
                        詳細
                      </Button>
                    </div>
                    
                    <div className="relative w-full h-40 flex items-center justify-center">
                      <div className={`w-32 h-32 rounded-full border-4 ${
                        stressInfo.percentage > 70 ? (isDarkMode ? 'border-red-500' : 'border-red-600') : 
                        stressInfo.percentage > 40 ? (isDarkMode ? 'border-amber-500' : 'border-amber-600') : 
                        (isDarkMode ? 'border-green-500' : 'border-green-600')
                      } ${isDarkMode ? 'bg-slate-700' : 'bg-white'} flex items-center justify-center`}>
                        <div>
                          <div className={`text-3xl font-bold text-center ${
                            stressInfo.percentage > 70 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : 
                            stressInfo.percentage > 40 ? (isDarkMode ? 'text-amber-400' : 'text-amber-600') : 
                            (isDarkMode ? 'text-green-400' : 'text-green-600')
                          }`}>{stressInfo.percentage}%</div>
                          <div className={`text-xs text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>ストレスレベル</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>低ストレス</span>
                        <span className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>中ストレス</span>
                        <span className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>高ストレス</span>
                      </div>
                      <div className={`h-2 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                        <div className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full" style={{ width: `${stressInfo.percentage}%` }}></div>
                      </div>
                    </div>
                    
                    <div className={`mt-4 p-3 rounded-md ${
                      stressInfo.percentage > 70 ? (isDarkMode ? 'bg-red-900/30' : 'bg-red-50') : 
                      stressInfo.percentage > 40 ? (isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50') : 
                      (isDarkMode ? 'bg-green-900/30' : 'bg-green-50')
                    }`}>
                      <p className={`text-sm ${
                        stressInfo.percentage > 70 ? (isDarkMode ? 'text-red-300' : 'text-red-800') : 
                        stressInfo.percentage > 40 ? (isDarkMode ? 'text-amber-300' : 'text-amber-800') : 
                        (isDarkMode ? 'text-green-300' : 'text-green-800')
                      }`}>
                        {getStressLevelExplanation()}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                    <h3 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>ストレス要因分析</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>フォロー数によるストレス</span>
                          <span className={`text-sm font-medium ${
                            stressInfo.followStress > 70 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : 
                            stressInfo.followStress > 40 ? (isDarkMode ? 'text-amber-400' : 'text-amber-600') : 
                            (isDarkMode ? 'text-green-400' : 'text-green-600')
                          }`}>{stressInfo.followStress}%</span>
                        </div>
                        <div className={`h-2 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                          <div className={`h-full ${
                            stressInfo.followStress > 70 ? 'bg-red-500' : 
                            stressInfo.followStress > 40 ? 'bg-amber-500' : 
                            'bg-green-500'
                          } rounded-full`} style={{ width: `${stressInfo.followStress}%` }}></div>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          現在のフォロー数: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{followCount}</span>
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>利用時間によるストレス</span>
                          <span className={`text-sm font-medium ${
                            stressInfo.timeStress > 70 ? (isDarkMode ? 'text-red-400' : 'text-red-600') : 
                            stressInfo.timeStress > 40 ? (isDarkMode ? 'text-amber-400' : 'text-amber-600') : 
                            (isDarkMode ? 'text-green-400' : 'text-green-600')
                          }`}>{stressInfo.timeStress}%</span>
                        </div>
                        <div className={`h-2 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                          <div className={`h-full ${
                            stressInfo.timeStress > 70 ? 'bg-red-500' : 
                            stressInfo.timeStress > 40 ? 'bg-amber-500' : 
                            'bg-green-500'
                          } rounded-full`} style={{ width: `${stressInfo.timeStress}%` }}></div>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          1日の利用時間: <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{usageTime}分</span>
                        </p>
                      </div>
                      
                      <div className={`p-3 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                        <div className="flex items-center mb-2">
                          <Activity className={`h-4 w-4 mr-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>ストレス比率</h4>
                        </div>
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>フォロー</span>
                              <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>時間</span>
                            </div>
                            <div className={`h-2 w-full ${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'} rounded-full overflow-hidden flex`}>
                              <div className={`h-full bg-blue-500`} style={{ width: '40%' }}></div>
                              <div className={`h-full bg-purple-500`} style={{ width: '60%' }}></div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>40% : 60%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              {isFirstUse ? (
                <div className="bg-slate-800 p-6 rounded-md text-center">
                  <h3 className="text-lg font-medium mb-2">トレンド分析</h3>
                  <p className="text-slate-400 mb-4">あなたのSNS利用状況を入力すると、トレンド分析が表示されます</p>
                  <Button onClick={() => setActiveTab("dashboard")}>
                    ダッシュボードに戻る
                  </Button>
                </div>
              ) : (
                <>
                  <div className={`bg-${isDarkMode ? 'slate-800' : 'slate-800'} p-4 rounded-md`}>
                    <h3 className="text-sm font-medium mb-4">フォロー数の推移</h3>
                    <div className="h-60 relative">
                      {/* グラフの背景グリッド */}
                      <div className="absolute inset-0 grid grid-rows-4 gap-0">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="border-t border-slate-700 relative">
                            <span className="absolute -top-2.5 -left-6 text-xs text-slate-500">
                              {400 - i * 100}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      {/* 折れ線グラフ */}
                      <div className="absolute inset-0 flex items-end">
                        <svg className="w-full h-full overflow-visible">
                          {/* 折れ線 */}
                          <polyline
                            points={mockFollowHistory.map((point, i) => 
                              `${(i / (mockFollowHistory.length - 1)) * 100}% ${100 - (point.count / 400) * 100}%`
                            ).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* データポイント */}
                          {mockFollowHistory.map((point, i) => (
                            <circle
                              key={i}
                              cx={`${(i / (mockFollowHistory.length - 1)) * 100}%`}
                              cy={`${100 - (point.count / 400) * 100}%`}
                              r="4"
                              fill="#3b82f6"
                              stroke="#1e3a8a"
                              strokeWidth="2"
                            />
                          ))}
                        </svg>
                      </div>
                      
                      {/* X軸ラベル */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                        {mockFollowHistory.map((point, i) => (
                          <div key={i} className="text-xs text-slate-500">{point.month}</div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                      <span>8ヶ月で <span className="font-bold text-blue-500">222</span> フォロー増加 (平均: 月 <span className="font-bold">28</span> フォロー)</span>
                    </div>
                    
                    <div className="mt-2 text-xs text-slate-400">
                      <span className="text-blue-400 font-medium">増加率: {followGrowthRate.toFixed(1)}%</span> - このペースが続くと1年後には約 <span className="font-medium">{Math.round(followCount * (1 + (followGrowthRate / 100) * (12/8)))}</span> フォローに達します
                    </div>
                  </div>
                  
                  <div className={`bg-${isDarkMode ? 'slate-800' : 'slate-800'} p-4 rounded-md`}>
                    <h3 className="text-sm font-medium mb-4">1週間の利用時間</h3>
                    <div className="h-40 relative">
                      {/* 棒グラフ */}
                      <div className="h-full flex items-end justify-between">
                        {mockUsageTime.map((day, i) => (
                          <div key={i} className="flex flex-col items-center w-8">
                            <div 
                              className={`w-6 ${
                                day.minutes > 90 ? "bg-red-500" : 
                                day.minutes > 60 ? "bg-amber-500" : 
                                "bg-green-500"
                              } rounded-t-sm`} 
                              style={{ height: `${(day.minutes / 120) * 100}%` }}
                            ></div>
                            <div className="text-xs text-slate-500 mt-1">{day.day}</div>
                          </div>
                        ))}
                      </div>
                      
                      {/* 推奨ライン */}
                      <div 
                        className="absolute w-full border-t-2 border-dashed border-blue-500 flex justify-end items-center"
                        style={{ top: `${100 - ((60 / 120) * 100)}%` }}
                      >
                        <span className="text-xs text-blue-500 bg-slate-800 px-1">推奨上限: 60分</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-sm">
                      <Clock className="h-4 w-4 text-purple-500 mr-2" />
                      <span>平均: <span className="font-bold text-purple-500">{Math.round(avgUsageTime)}</span> 分/日 (週合計: <span className="font-bold">{mockUsageTime.reduce((sum, day) => sum + day.minutes, 0)}</span> 分)</span>
                    </div>
                    
                    <div className="mt-2 text-xs text-slate-400">
                      {avgUsageTime > 60 ? 
                        <span className="text-amber-400">推奨上限を超えています。利用時間の削減を検討してください。</span> : 
                        <span className="text-green-400">健全な利用時間です。このバランスを維持しましょう。</span>
                      }
                    </div>
                  </div>
                  
                  <div className={`bg-${isDarkMode ? 'slate-800' : 'slate-800'} p-4 rounded-md`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">ストレス予測</h3>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-sm text-slate-400 mb-4">現在のペースでフォローを増やし続けると、約2ヶ月後に「高」ストレスレベルに達する可能性があります。</p>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4">
              {isFirstUse ? (
                <div className="bg-slate-800 p-6 rounded-md text-center">
                  <h3 className="text-lg font-medium mb-2">推奨設定</h3>
                  <p className="text-slate-400 mb-4">あなたのSNS利用状況を入力すると、パーソナライズされた推奨設定が表示されます</p>
                  <Button onClick={() => setActiveTab("dashboard")}>
                    ダッシュボードに戻る
                  </Button>
                </div>
              ) : (
                <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>あなたへの推奨設定</h3>
                    <Button variant="outline" size="sm" onClick={() => setOpenHelp(true)} className={`text-xs ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-700'}`}>
                      <HelpCircle className="h-3 w-3 mr-1" />
                      詳細
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white'} p-3 rounded-md`}>
                      <div className={`flex items-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-1`}>
                        <Users className="h-4 w-4 mr-1" />
                        <h4 className="text-sm font-medium">推奨フォロー数</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{recommendedFollows}</div>
                        <div className={`text-sm ${
                          recommendedFollows < followCount ? (isDarkMode ? 'text-red-400' : 'text-red-600') : 
                          recommendedFollows > followCount ? (isDarkMode ? 'text-green-400' : 'text-green-600') : 
                          (isDarkMode ? 'text-amber-400' : 'text-amber-600')
                        }`}>
                          {recommendedFollows < followCount ? `${followCount - recommendedFollows}人減らす` : 
                           recommendedFollows > followCount ? `${recommendedFollows - followCount}人増やせる` : 
                           "現状維持"}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-white'} p-3 rounded-md`}>
                      <div className={`flex items-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mb-1`}>
                        <Clock className="h-4 w-4 mr-1" />
                        <h4 className="text-sm font-medium">推奨利用時間</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{recommendedTime}分</div>
                        <div className={`text-sm ${
                          recommendedTime < usageTime ? (isDarkMode ? 'text-red-400' : 'text-red-600') : 
                          (isDarkMode ? 'text-green-400' : 'text-green-600')
                        }`}>
                          {recommendedTime < usageTime ? `${usageTime - recommendedTime}分減らす` : "OK"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`mt-4 p-3 rounded-md ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                    <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-black'}`}>改善のためのアクションプラン</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>1</div>
                        <div>
                          <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>フォロー整理</p>
                          <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>定期的にフォローリストを見直し、本当に必要な人だけをフォローしましょう。</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>2</div>
                        <div>
                          <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>リスト活用</p>
                          <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>重要な人をリストにまとめて、効率的に情報をチェックしましょう。</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>3</div>
                        <div>
                          <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>時間制限</p>
                          <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>アプリの使用時間を設定し、通知で知らせるようにしましょう。</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className={`${isDarkMode ? 'bg-blue-900 text-blue-500' : 'bg-blue-100 text-blue-600'} rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5`}>4</div>
                        <div>
                          <p className={`font-medium mb-0.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>デジタルデトックス</p>
                          <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>週に1日はSNSを使わない日を作り、リフレッシュしましょう。</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className={`flex justify-between pt-0 ${isDarkMode ? 'border-t border-slate-800' : 'border-t border-gray-200'}`}>
          <Button variant="outline" onClick={() => {
            setFollowCount(0);
            setUsageTime(0);
            setIsFirstUse(true);
          }} className={`${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-gray-300 text-gray-700'}`}>
            リセット
          </Button>
          
          {(!isFirstUse || followCount > 0 || usageTime > 0) && (
            <Button onClick={startAnalysis} className={`${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`}>
              分析
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

