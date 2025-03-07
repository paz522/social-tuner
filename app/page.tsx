"use client"

import React, { useState, useEffect } from "react"
import { Mail, Activity, BarChart3, Gauge, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailAnalyzer } from "@/components/email-analyzer"
import { SNSFatigue } from "@/components/sns-fatigue"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mentalHealthScore, setMentalHealthScore] = useState(0);
  const [emailScore, setEmailScore] = useState(0);
  const [snsStressLevel, setSnsStressLevel] = useState(0);
  const [snsStressText, setSnsStressText] = useState("未測定");
  const [followCount, setFollowCount] = useState(0);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // EmailAnalyzerからスコアを受け取るハンドラー
  const handleEmailScoreUpdate = (score: number) => {
    setEmailScore(score);
    // メール診断スコアが更新されたら、メンタルヘルススコアも更新
    updateMentalHealthScore(score, snsStressLevel);
  };

  // SNSFatigueからストレスレベルを受け取るハンドラー
  const handleSnsStressUpdate = (stressPercentage: number, stressLevel: string, followCount: number) => {
    setSnsStressLevel(stressPercentage);
    setSnsStressText(stressLevel);
    setFollowCount(followCount);
    // SNS疲労度が更新されたら、メンタルヘルススコアも更新
    updateMentalHealthScore(emailScore, stressPercentage);
  };

  // メンタルヘルススコアを計算する関数
  const updateMentalHealthScore = (emailScore: number, snsStress: number) => {
    // メール診断スコアが高いほど良く、SNS疲労度が低いほど良い
    // メンタルヘルススコアは0-100の範囲
    if (emailScore === 0 && snsStress === 0) {
      setMentalHealthScore(0); // 両方未測定の場合は0
    } else if (emailScore === 0) {
      setMentalHealthScore(Math.max(0, 100 - snsStress)); // メール未測定の場合はSNSのみで計算
    } else if (snsStress === 0) {
      setMentalHealthScore(emailScore); // SNS未測定の場合はメールのみで計算
    } else {
      // 両方測定済みの場合は平均を取る
      setMentalHealthScore(Math.round((emailScore + (100 - snsStress)) / 2));
    }
  };

  return (
    <DashboardShell isDarkMode={isDarkMode}>
      <DashboardHeader
        heading="SocialTuner ダッシュボード"
        text="人間関係最適化アシスタント - あなたのコミュニケーションを最適化します"
        className={`bg-${isDarkMode ? 'slate-900' : 'white'} text-${isDarkMode ? 'white' : 'black'}`}
      >
        <div className="flex space-x-2">
          <ThemeToggle onToggle={() => setIsDarkMode(!isDarkMode)} />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 text-white border-slate-800">
              <DialogHeader>
                <DialogTitle>SocialTunerの使い方</DialogTitle>
                <DialogDescription className="text-slate-400">
                  主な機能と使用方法をご紹介します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    メール診断
                  </h3>
                  <p className="text-sm text-slate-400">
                    メール文面を入力すると、ストレスを与える可能性のある表現を自動で検出し、改善案を提案します。
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    SNS疲労度
                  </h3>
                  <p className="text-sm text-slate-400">
                    SNSの利用状況を分析し、メンタルヘルスへの影響を可視化。適切な利用バランスを提案します。
                  </p>
                </div>
                <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">ヒント</h4>
                  <ul className="text-sm text-slate-400 space-y-2">
                    <li>• 各機能は上部のタブで切り替えることができます</li>
                    <li>• 分析結果は自動で保存され、トレンドとして表示されます</li>
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardHeader>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className={`bg-${isDarkMode ? 'slate-900' : 'white'} text-${isDarkMode ? 'white' : 'black'} p-1 rounded-t-lg`}>
          <TabsTrigger value="overview" className={`data-[state=active]:bg-${isDarkMode ? 'slate-700' : 'gray-200'} text-${isDarkMode ? 'white' : 'black'}`}>概要</TabsTrigger>
          <TabsTrigger value="email" className={`data-[state=active]:bg-${isDarkMode ? 'slate-700' : 'gray-200'} text-${isDarkMode ? 'white' : 'black'}`}>メール診断</TabsTrigger>
          <TabsTrigger value="sns" className={`data-[state=active]:bg-${isDarkMode ? 'slate-700' : 'gray-200'} text-${isDarkMode ? 'white' : 'black'}`}>SNS疲労度</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className={`bg-${isDarkMode ? 'slate-900' : 'white'} text-${isDarkMode ? 'white' : 'black'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">メンタルヘルス</CardTitle>
                <Gauge className={`h-4 w-4 text-${isDarkMode ? 'white' : 'black'}`} />
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-24 mt-2">
                  <div className="absolute w-full h-full flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full border-4 border-${isDarkMode ? 'slate-700' : 'gray-300'} bg-${isDarkMode ? 'slate-800' : 'gray-200'} flex items-center justify-center`}>
                      <div className="text-2xl font-bold">{mentalHealthScore}%</div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 w-full">
                    <div className="w-full flex justify-between px-2 text-xs">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                    <div className={`h-2 w-full bg-${isDarkMode ? 'slate-700' : 'gray-300'} rounded-full overflow-hidden`}>
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${mentalHealthScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`bg-${isDarkMode ? 'slate-900' : 'white'} text-${isDarkMode ? 'white' : 'black'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">メール診断スコア</CardTitle>
                <Mail className={`h-4 w-4 text-${isDarkMode ? 'white' : 'black'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{emailScore}/100</div>
                <div className="flex items-center mt-2">
                  <div className={`h-2 w-full bg-${isDarkMode ? 'slate-700' : 'gray-300'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${emailScore}%` }}></div>
                  </div>
                </div>
                <p className="text-xs mt-2">前週比 +2.5%</p>
              </CardContent>
            </Card>
            <Card className={`bg-${isDarkMode ? 'slate-900' : 'white'} text-${isDarkMode ? 'white' : 'black'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">SNS疲労度</CardTitle>
                <Activity className={`h-4 w-4 text-${isDarkMode ? 'white' : 'black'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{snsStressText}</div>
                <div className="flex items-center mt-2">
                  <div className={`h-2 w-full bg-${isDarkMode ? 'slate-700' : 'gray-300'} rounded-full overflow-hidden`}>
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${snsStressLevel}%` }}></div>
                  </div>
                </div>
                <p className="text-xs mt-2">フォロー数: {followCount} (+28)</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className={`col-span-2 bg-${isDarkMode ? 'slate-900' : 'white'} text-${isDarkMode ? 'white' : 'black'}`}>
              <CardHeader>
                <CardTitle>週間コミュニケーション分析</CardTitle>
                <CardDescription className={`text-${isDarkMode ? 'slate-400' : 'gray-500'}`}>過去7日間のコミュニケーションパターン</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`h-[200px] flex items-center justify-center bg-${isDarkMode ? 'slate-800' : 'gray-200'} rounded-md`}>
                  <BarChart3 className={`h-8 w-8 text-${isDarkMode ? 'slate-500' : 'gray-500'}`} />
                  <span className={`ml-2 text-${isDarkMode ? 'slate-500' : 'gray-500'}`}>週間コミュニケーションチャート</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="email">
          <EmailAnalyzer isDarkMode={isDarkMode} onScoreUpdate={handleEmailScoreUpdate} />
        </TabsContent>
        <TabsContent value="sns">
          <SNSFatigue isDarkMode={isDarkMode} onStressUpdate={handleSnsStressUpdate} />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

