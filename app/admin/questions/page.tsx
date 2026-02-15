"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Volume2, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Question {
  id: string
  part: number
  questionSetId: string | null
  questionOrder: number | null
  questionText: string
  infoText: string | null
  infoImageUrl: string | null
  audioUrl: string | null
  audioFileName: string | null
  imageUrl: string | null
  imageFileName: string | null
  preparationTime: number
  speakingTime: number
  questionType: string | null
  createdAt: string
}

const PART_CONFIGS = {
  1: {
    name: "Part 1: 지문 읽기",
    description: "화면에 표시된 지문을 소리내어 읽기",
    defaultPrep: 45,
    defaultSpeak: 45,
    hasImage: false,
    hasAudio: false,
    isSet: false,
    note: "총 2문제, 각 준비 45초/말하기 45초"
  },
  2: {
    name: "Part 2: 사진 묘사",
    description: "사진을 보고 묘사하기",
    defaultPrep: 45,
    defaultSpeak: 30,
    hasImage: true,
    hasAudio: false,
    isSet: false,
    note: "총 1문제, 준비 45초/말하기 30초"
  },
  3: {
    name: "Part 3: 질문에 답하기",
    description: "공통 문장 정보(텍스트+음원)를 듣고 질문에 답하기",
    defaultPrep: 3,
    defaultSpeak: 15,
    hasImage: false,
    hasAudio: true,
    isSet: true,
    note: "1세트(3문제), 공통 문장(텍스트+음원) + 질문 음원 3개, 1-2번: 15초, 3번: 30초"
  },
  4: {
    name: "Part 4: 정보 기반 답변",
    description: "제공된 정보를 바탕으로 질문에 답하기",
    defaultPrep: 3,
    defaultSpeak: 15,
    hasImage: false,
    hasAudio: true,
    isSet: true,
    note: "1세트(3문제), 제공 정보(텍스트/이미지) + 정보 읽기 45초 + 3개 질문"
  },
  5: {
    name: "Part 5: 의견 제시",
    description: "주제에 대한 자신의 의견 말하기",
    defaultPrep: 30,
    defaultSpeak: 45,
    hasImage: false,
    hasAudio: false,
    isSet: false,
    note: "총 1문제, 준비 30초/말하기 45초"
  },
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedPart, setSelectedPart] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    part: 1,
    questionText: "",
    questionText1: "",
    questionText2: "",
    questionText3: "",
    infoText: "",
    preparationTime: 45,
    speakingTime: 45,
    audioFile: null as File | null,
    imageFile: null as File | null,
    // Part 3, 4 세트용
    audioFile1: null as File | null,
    audioFile2: null as File | null,
    audioFile3: null as File | null,
    infoImageFile: null as File | null,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchQuestions()
  }, [selectedPart])

  const fetchQuestions = async () => {
    try {
      const url = selectedPart > 0 
        ? `/api/questions?part=${selectedPart}` 
        : `/api/questions`
      const res = await fetch(url)
      const data = await res.json()
      setQuestions(data.questions || [])
    } catch (error) {
      console.error("문제 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePartChange = (part: number) => {
    setSelectedPart(part)
    const config = PART_CONFIGS[part as keyof typeof PART_CONFIGS]
    setFormData({
      ...formData,
      part,
      preparationTime: config.defaultPrep,
      speakingTime: config.defaultSpeak,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    toast({
      title: "📤 문제 저장 중...",
      description: "잠시만 기다려주세요",
    })

    const form = new FormData()
    if (formData.id) form.append("id", formData.id)
    form.append("part", formData.part.toString())
    form.append("questionText", formData.questionText)
    form.append("infoText", formData.infoText || "")
    form.append("preparationTime", formData.preparationTime.toString())
    form.append("speakingTime", formData.speakingTime.toString())
    
    // Part 3, 4 세트: 3개 음성 파일
    if (formData.part === 3 || formData.part === 4) {
      // Part 3, 4: 각 질문 텍스트
      form.append("questionText1", formData.questionText1)
      form.append("questionText2", formData.questionText2)
      form.append("questionText3", formData.questionText3)
      
      if (formData.audioFile1) form.append("audioFile1", formData.audioFile1)
      if (formData.audioFile2) form.append("audioFile2", formData.audioFile2)
      if (formData.audioFile3) form.append("audioFile3", formData.audioFile3)
      
      // Part 3: 공통 문장 음원, Part 4: 정보 이미지
      if (formData.infoImageFile) {
        form.append("infoImageFile", formData.infoImageFile)
      }
    } else {
      // 다른 파트: 단일 음성/이미지
      if (formData.audioFile) form.append("audioFile", formData.audioFile)
      if (formData.imageFile) form.append("imageFile", formData.imageFile)
    }

    try {
      const method = formData.id ? "PUT" : "POST"
      const res = await fetch("/api/questions", {
        method,
        body: form
      })

      const result = await res.json()

      if (result.success) {
        toast({
          variant: "success",
          title: "✅ 저장 완료!",
          description: formData.id ? "문제가 수정되었습니다" : "새 문제가 추가되었습니다",
        })
        setShowForm(false)
        resetForm()
        fetchQuestions()
      } else {
        toast({
          variant: "destructive",
          title: "❌ 저장 실패",
          description: result.error || "처리 실패",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ 오류 발생",
        description: "문제 저장 중 오류가 발생했습니다",
      })
    }
  }

  const handleEdit = (question: Question) => {
    setFormData({
      id: question.id,
      part: question.part,
      questionText: question.questionText,
      questionText1: "",
      questionText2: "",
      questionText3: "",
      infoText: question.infoText || "",
      preparationTime: question.preparationTime,
      speakingTime: question.speakingTime,
      audioFile: null,
      imageFile: null,
      audioFile1: null,
      audioFile2: null,
      audioFile3: null,
      infoImageFile: null,
    })
    setSelectedPart(question.part)
    setShowForm(true)
  }

  const handleDelete = async (questionId: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return

    try {
      const res = await fetch(`/api/questions?id=${questionId}`, {
        method: "DELETE"
      })

      if (res.ok) {
        toast({
          variant: "success",
          title: "✅ 삭제 완료",
          description: "문제가 삭제되었습니다",
        })
        fetchQuestions()
      } else {
        toast({
          variant: "destructive",
          title: "❌ 삭제 실패",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ 오류 발생",
      })
    }
  }

  const resetForm = () => {
    const config = PART_CONFIGS[selectedPart as keyof typeof PART_CONFIGS]
    setFormData({
      id: "",
      part: selectedPart,
      questionText: "",
      questionText1: "",
      questionText2: "",
      questionText3: "",
      infoText: "",
      preparationTime: config.defaultPrep,
      speakingTime: config.defaultSpeak,
      audioFile: null,
      imageFile: null,
      audioFile1: null,
      audioFile2: null,
      audioFile3: null,
      infoImageFile: null,
    })
  }

  const currentConfig = PART_CONFIGS[selectedPart as keyof typeof PART_CONFIGS]
  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.part]) acc[q.part] = []
    acc[q.part].push(q)
    return acc
  }, {} as Record<number, Question[]>)

  if (isLoading) {
    return <div className="p-8">로딩 중...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문제 은행</h1>
          <p className="text-gray-500 mt-1">파트별 테스트 문제를 관리합니다</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm) }}>
          <Plus className="mr-2 h-4 w-4" />
          문제 추가
        </Button>
      </div>

      {/* 파트 선택 */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {Object.entries(PART_CONFIGS).map(([part, config]) => (
          <Button 
            key={part}
            variant={selectedPart === parseInt(part) ? "default" : "outline"}
            onClick={() => handlePartChange(parseInt(part))}
            className="flex-col h-auto py-3"
          >
            <span className="font-bold">Part {part}</span>
            <span className="text-xs mt-1">{config.name.split(': ')[1]}</span>
          </Button>
        ))}
      </div>

      {/* 선택된 파트 정보 */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-2">{currentConfig.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{currentConfig.description}</p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">준비 시간:</span>
              <span className="bg-white px-2 py-1 rounded">{currentConfig.defaultPrep}초</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">말하기 시간:</span>
              <span className="bg-white px-2 py-1 rounded">{currentConfig.defaultSpeak}초</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문제 추가/수정 폼 */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{formData.id ? "문제 수정" : "문제 추가"} - Part {selectedPart}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Part 1: 지문 읽기 */}
              {selectedPart === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="questionText">읽을 지문 *</Label>
                  <textarea
                    id="questionText"
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    className="flex min-h-[150px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="The annual company picnic will be held on Saturday, June 15th..."
                    required
                  />
                  <p className="text-xs text-gray-500">응시자가 소리내어 읽을 지문을 입력하세요</p>
                </div>
              )}

              {/* Part 2: 사진 묘사 */}
              {selectedPart === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="imageFile">사진 업로드 *</Label>
                    <Input
                      id="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
                    />
                    <p className="text-xs text-gray-500">응시자가 묘사할 사진을 업로드하세요</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="questionText">지시사항 (선택)</Label>
                    <textarea
                      id="questionText"
                      value={formData.questionText}
                      onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                      className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="Describe the picture in as much detail as you can."
                    />
                  </div>
                </>
              )}

              {/* Part 3: 공통 문장 + 3개 질문 세트 */}
              {selectedPart === 3 && (
                <>
                  <div className="p-4 bg-[#E3F2FD] border-2 border-blue-300 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📝 Part 3 세트 생성</h4>
                    <p className="text-sm text-gray-800">
                      공통 문장 정보(텍스트 + 음원)와 3개의 질문 음원을 한 번에 생성합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infoText">공통 문장 텍스트 *</Label>
                    <textarea
                      id="infoText"
                      value={formData.infoText}
                      onChange={(e) => setFormData({ ...formData, infoText: e.target.value })}
                      className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                      placeholder="예: I enjoy reading books in my free time.&#10;My favorite genre is mystery novels."
                      required
                    />
                    <p className="text-xs text-gray-500">3개 문제 상단에 항상 표시되는 공통 문장</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infoImageFile">공통 문장 음원 (MP3) *</Label>
                    <Input
                      id="infoImageFile"
                      type="file"
                      accept="audio/mpeg,audio/mp3"
                      onChange={(e) => setFormData({ ...formData, infoImageFile: e.target.files?.[0] || null })}
                      required
                    />
                    <p className="text-xs text-gray-500">공통 문장을 읽어주는 음원 파일</p>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">❓ 3개 질문</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
                        <Label htmlFor="questionText1" className="text-base font-semibold">1번 질문 - 준비 3초 / 말하기 15초</Label>
                        <textarea
                          id="questionText1"
                          value={formData.questionText1}
                          onChange={(e) => setFormData({ ...formData, questionText1: e.target.value })}
                          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="예: What do you like to read?"
                          required
                        />
                        <div className="space-y-2">
                          <Label htmlFor="audioFile1">1번 질문 음성 (MP3) *</Label>
                          <Input
                            id="audioFile1"
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            onChange={(e) => setFormData({ ...formData, audioFile1: e.target.files?.[0] || null })}
                            required
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
                        <Label htmlFor="questionText2" className="text-base font-semibold">2번 질문 - 준비 3초 / 말하기 15초</Label>
                        <textarea
                          id="questionText2"
                          value={formData.questionText2}
                          onChange={(e) => setFormData({ ...formData, questionText2: e.target.value })}
                          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="예: When do you usually read?"
                          required
                        />
                        <div className="space-y-2">
                          <Label htmlFor="audioFile2">2번 질문 음성 (MP3) *</Label>
                          <Input
                            id="audioFile2"
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            onChange={(e) => setFormData({ ...formData, audioFile2: e.target.files?.[0] || null })}
                            required
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
                        <Label htmlFor="questionText3" className="text-base font-semibold">3번 질문 - 준비 3초 / 말하기 30초</Label>
                        <textarea
                          id="questionText3"
                          value={formData.questionText3}
                          onChange={(e) => setFormData({ ...formData, questionText3: e.target.value })}
                          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="예: Tell me about your favorite book and why you like it."
                          required
                        />
                        <div className="space-y-2">
                          <Label htmlFor="audioFile3">3번 질문 음성 (MP3) *</Label>
                          <Input
                            id="audioFile3"
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            onChange={(e) => setFormData({ ...formData, audioFile3: e.target.files?.[0] || null })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Part 4: 제공 정보 + 3개 문제 세트 */}
              {selectedPart === 4 && (
                <>
                  <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📋 Part 4 세트 생성</h4>
                    <p className="text-sm text-blue-800">
                      하나의 제공 정보로 3개의 문제를 한 번에 생성합니다.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infoText">제공 정보 - 텍스트 *</Label>
                    <textarea
                      id="infoText"
                      value={formData.infoText}
                      onChange={(e) => setFormData({ ...formData, infoText: e.target.value })}
                      className="flex min-h-[150px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-mono"
                      placeholder="Conference Schedule&#10;9:00 AM - Registration&#10;10:00 AM - Keynote Speech&#10;12:00 PM - Lunch&#10;2:00 PM - Workshop Sessions"
                      required
                    />
                    <p className="text-xs text-gray-500">일정표, 안내문, 광고 등 (45초 읽기 시간)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="infoImageFile">제공 정보 - 이미지 (선택)</Label>
                    <Input
                      id="infoImageFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, infoImageFile: e.target.files?.[0] || null })}
                    />
                    <p className="text-xs text-gray-500">텍스트와 함께 표시할 이미지 (차트, 지도 등)</p>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">❓ 3개 질문</h4>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
                        <Label htmlFor="p4questionText1" className="text-base font-semibold">1번 질문 - 준비 3초 / 말하기 15초</Label>
                        <textarea
                          id="p4questionText1"
                          value={formData.questionText1}
                          onChange={(e) => setFormData({ ...formData, questionText1: e.target.value })}
                          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="예: What time does the conference start?"
                          required
                        />
                        <div className="space-y-2">
                          <Label htmlFor="p4audioFile1">1번 질문 음성 (MP3) *</Label>
                          <Input
                            id="p4audioFile1"
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            onChange={(e) => setFormData({ ...formData, audioFile1: e.target.files?.[0] || null })}
                            required
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
                        <Label htmlFor="p4questionText2" className="text-base font-semibold">2번 질문 - 준비 3초 / 말하기 15초</Label>
                        <textarea
                          id="p4questionText2"
                          value={formData.questionText2}
                          onChange={(e) => setFormData({ ...formData, questionText2: e.target.value })}
                          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="예: How long is the lunch break?"
                          required
                        />
                        <div className="space-y-2">
                          <Label htmlFor="p4audioFile2">2번 질문 음성 (MP3) *</Label>
                          <Input
                            id="p4audioFile2"
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            onChange={(e) => setFormData({ ...formData, audioFile2: e.target.files?.[0] || null })}
                            required
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white border-2 border-blue-200 rounded-lg space-y-3">
                        <Label htmlFor="p4questionText3" className="text-base font-semibold">3번 질문 - 준비 3초 / 말하기 30초</Label>
                        <textarea
                          id="p4questionText3"
                          value={formData.questionText3}
                          onChange={(e) => setFormData({ ...formData, questionText3: e.target.value })}
                          className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="예: Describe the main events of the conference and what attendees can expect."
                          required
                        />
                        <div className="space-y-2">
                          <Label htmlFor="p4audioFile3">3번 질문 음성 (MP3) *</Label>
                          <Input
                            id="p4audioFile3"
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            onChange={(e) => setFormData({ ...formData, audioFile3: e.target.files?.[0] || null })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Part 5: 의견 제시 */}
              {selectedPart === 5 && (
                <div className="space-y-2">
                  <Label htmlFor="questionText">질문/주제 *</Label>
                  <textarea
                    id="questionText"
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    placeholder="Some people prefer to work from home, while others prefer to work in an office. Which do you prefer? Explain your opinion with specific reasons and examples."
                    required
                  />
                  <p className="text-xs text-gray-500">응시자가 의견을 제시할 주제</p>
                </div>
              )}

              {/* 시간 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preparationTime">준비 시간 (초)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    min="0"
                    max="180"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speakingTime">말하기 시간 (초)</Label>
                  <Input
                    id="speakingTime"
                    type="number"
                    min="15"
                    max="120"
                    value={formData.speakingTime}
                    onChange={(e) => setFormData({ ...formData, speakingTime: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {formData.id ? "수정" : "등록"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm() }}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 문제 목록 */}
      {Object.keys(groupedQuestions).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            등록된 문제가 없습니다.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedQuestions).map(([part, qs]) => {
            const config = PART_CONFIGS[parseInt(part) as keyof typeof PART_CONFIGS]
            return (
              <Card key={part}>
                <CardHeader>
                  <CardTitle>{config.name} ({qs.length}문제)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {qs.map((q, idx) => (
                      <div key={q.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-sm text-gray-500">문제 {idx + 1}</div>
                            <div className="flex gap-2 text-xs">
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                준비 {q.preparationTime}초
                              </span>
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                말하기 {q.speakingTime}초
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {q.audioUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const audio = new Audio(q.audioUrl!)
                                  audio.play()
                                }}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            )}
                            {q.imageUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(q.imageUrl!, '_blank')}
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleEdit(q)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(q.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{q.questionText}</p>
                        {q.audioFileName && (
                          <p className="text-xs text-gray-500 mt-2">🎵 {q.audioFileName}</p>
                        )}
                        {q.imageFileName && (
                          <p className="text-xs text-gray-500 mt-2">🖼️ {q.imageFileName}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
