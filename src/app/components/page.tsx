"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BasicHero, CenteredHero, SplitHero } from "@/components/ui/hero-section"
import { BasicFooter, MinimalFooter } from "@/components/ui/footer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Calendar } from "@/components/ui/calendar"
import { BarChart } from "@/components/ui/bar-chart"
import { LineChart } from "@/components/ui/line-chart"
import { PieChart } from "@/components/ui/pie-chart"
import { PaletteSwitcher, PaletteViewer } from "@/components/ui/palette-switcher"
import { ViewModeSwitch, ViewModeSwitchItem } from "@/components/ui/view-mode-switch"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { AlertCircle, Bell, Calendar as CalendarIcon, ChevronDown, FileText, Home, Settings, Users, Zap, List, Grid } from "lucide-react"
import {
  brand,
  getBrandName,
  getLogoAlt,
  getNavText,
  getNotificationText,
  getBadgeText,
  getCalendarText,
  getChartText,
  getUsageText,
  getDataText,
  getButtonText,
  getComponentDemoText,
  getPaletteText,
  getViewModeText
} from "@/config/brand"
import { defaults, layout, chart, typography } from "@/config/constants"

export default function ComponentsPage() {
  const [progressValue, setProgressValue] = useState(defaults.progress.initialValue)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const form = useForm()

  // 차트 데이터 (중앙화된 텍스트 시스템 사용)
  const barData = [
    { name: getComponentDemoText.getMonthName(1, 'ko'), value: 12 },
    { name: getComponentDemoText.getMonthName(2, 'ko'), value: 19 },
    { name: getComponentDemoText.getMonthName(3, 'ko'), value: 15 },
    { name: getComponentDemoText.getMonthName(4, 'ko'), value: 25 },
    { name: getComponentDemoText.getMonthName(5, 'ko'), value: 22 },
    { name: getComponentDemoText.getMonthName(6, 'ko'), value: 18 }
  ]

  const lineData = [
    { name: getComponentDemoText.getWeekday(0, 'ko'), value: 8 },
    { name: getComponentDemoText.getWeekday(1, 'ko'), value: 12 },
    { name: getComponentDemoText.getWeekday(2, 'ko'), value: 15 },
    { name: getComponentDemoText.getWeekday(3, 'ko'), value: 9 },
    { name: getComponentDemoText.getWeekday(4, 'ko'), value: 18 },
    { name: getComponentDemoText.getWeekday(5, 'ko'), value: 6 },
    { name: getComponentDemoText.getWeekday(6, 'ko'), value: 4 }
  ]

  const pieData = [
    { name: getComponentDemoText.getCategory('work', 'ko'), value: 40 },
    { name: getComponentDemoText.getCategory('personal', 'ko'), value: 25 },
    { name: getComponentDemoText.getCategory('meeting', 'ko'), value: 20 },
    { name: getComponentDemoText.getCategory('other', 'ko'), value: 15 }
  ]

  const handleToastClick = () => {
    toast({
      title: getNotificationText.title('ko'),
      description: getNotificationText.systemSuccess('ko'),
    })
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={brand.logo.favicon}
                    alt={getLogoAlt('ko')}
                    className={layout.heights.logoSmall}
                  />
                  <h1 className="text-2xl font-bold text-primary">{getBrandName('ko')}</h1>
                </div>
                <Badge variant="secondary">{getBadgeText.shadcnBased('ko')}</Badge>
              </div>

              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger showDropdownIcon={false}>{getNavText.home('ko')}</NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger showDropdownIcon={false}>{getNavText.docs('ko')}</NavigationMenuTrigger>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>{getNavText.projects('ko')}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink className="block p-4 w-64">
                        <div className="space-y-2">
                          <h4 className="font-medium">{getNavText.activeProjects('ko')}</h4>
                          <p className="text-sm text-muted-foreground">{getNavText.activeProjectsDesc('ko')}</p>
                        </div>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger showDropdownIcon={false}>{getNavText.team('ko')}</NavigationMenuTrigger>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <div className="flex items-center space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Bell className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getNotificationText.center('ko')}</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>UI</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>프로필</DropdownMenuItem>
                    <DropdownMenuItem>설정</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>로그아웃</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">프로젝트 네비게이션</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="mr-2 h-4 w-4" />
                    대시보드
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    문서
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    팀 협업
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    일정 관리
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    설정
                  </Button>
                </CardContent>
              </Card>

              {/* Project Progress */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">프로젝트 진행률</CardTitle>
                  <CardDescription>UI 중앙화 작업 진행상황</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>컴포넌트 통합</span>
                      <span>{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-save" />
                    <Label htmlFor="auto-save">자동 저장</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>중앙화 성공!</AlertTitle>
                <AlertDescription>
                  모든 UI 컴포넌트가 shadcn 기반으로 중앙화되었습니다. 일관된 디자인 시스템을 확인해보세요.
                </AlertDescription>
              </Alert>

              <Tabs defaultValue="components" className="space-y-6">
                {/* 뷰 모드 스위치 */}
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="components">컴포넌트</TabsTrigger>
                    <TabsTrigger value="forms">폼</TabsTrigger>
                    <TabsTrigger value="data">데이터</TabsTrigger>
                    <TabsTrigger value="layout">레이아웃</TabsTrigger>
                  </TabsList>
                  <ViewModeSwitch
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as 'list' | 'detail')}
                    aria-label={getViewModeText.title('ko')}
                    variant="default"
                  >
                    <ViewModeSwitchItem
                      value="list"
                      icon={<List className="h-4 w-4" />}
                    >
                      {getViewModeText.listView('ko')}
                    </ViewModeSwitchItem>
                    <ViewModeSwitchItem
                      value="detail"
                      icon={<Grid className="h-4 w-4" />}
                    >
                      {getViewModeText.detailView('ko')}
                    </ViewModeSwitchItem>
                  </ViewModeSwitch>
                </div>

                <TabsContent value="components" className="space-y-6">
                  <div className={viewMode === 'list' ? "space-y-4" : "grid md:grid-cols-2 gap-6"}>
                    <Card className={viewMode === 'list' ? '' : ''}>
                      <CardHeader className={viewMode === 'list' ? 'pb-3' : ''}>
                        <CardTitle className={viewMode === 'list' ? 'text-base' : ''}>버튼 컴포넌트</CardTitle>
                        <CardDescription className={viewMode === 'list' ? 'text-xs' : ''}>다양한 스타일의 버튼들</CardDescription>
                      </CardHeader>
                      <CardContent className={viewMode === 'list' ? 'space-y-2' : 'space-y-4'}>
                        <div className="flex flex-wrap gap-2">
                          <Button size={viewMode === 'list' ? 'sm' : 'default'}>Primary</Button>
                          <Button size={viewMode === 'list' ? 'sm' : 'default'} variant="secondary">Secondary</Button>
                          <Button size={viewMode === 'list' ? 'sm' : 'default'} variant="outline">Outline</Button>
                          <Button size={viewMode === 'list' ? 'sm' : 'default'} variant="ghost">Ghost</Button>
                          <Button size={viewMode === 'list' ? 'sm' : 'default'} variant="destructive">Destructive</Button>
                        </div>
                        {viewMode === 'detail' && (
                          <>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">새로운 Secondary 버튼 스타일</h4>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="secondary">{getButtonText.getSize('default', 'ko')} {getButtonText.getVariant('secondary', 'ko')}</Button>
                                <Button variant="secondary" size="sm">{getButtonText.getSize('small', 'ko')} {getButtonText.getVariant('secondary', 'ko')}</Button>
                                <Button variant="secondary" size="lg">{getButtonText.getSize('large', 'ko')} {getButtonText.getVariant('secondary', 'ko')}</Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {getComponentDemoText.getVariantDescription('default', 'ko')}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm">Small</Button>
                              <Button size="default">Default</Button>
                              <Button size="lg">Large</Button>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">업데이트된 Outline & Ghost 버튼</h4>
                              <div className="flex flex-wrap gap-2">
                                <Button variant="outline">{getButtonText.getSize('default', 'ko')} {getButtonText.getVariant('outline', 'ko')}</Button>
                                <Button variant="outline" size="sm">{getButtonText.getSize('small', 'ko')} {getButtonText.getVariant('outline', 'ko')}</Button>
                                <Button variant="ghost">{getButtonText.getSize('default', 'ko')} {getButtonText.getVariant('ghost', 'ko')}</Button>
                                <Button variant="ghost" size="sm">{getButtonText.getSize('small', 'ko')} {getButtonText.getVariant('ghost', 'ko')}</Button>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {getComponentDemoText.getVariantDescription('outline', 'ko')}<br />
                                {getComponentDemoText.getVariantDescription('ghost', 'ko')}
                              </p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className={viewMode === 'list' ? 'pb-3' : ''}>
                        <CardTitle className={viewMode === 'list' ? 'text-base' : ''}>탭 컴포넌트</CardTitle>
                        <CardDescription className={viewMode === 'list' ? 'text-xs' : ''}>새로운 탭 스타일링</CardDescription>
                      </CardHeader>
                      <CardContent className={viewMode === 'list' ? 'space-y-2' : 'space-y-4'}>
                        <div className="space-y-2">
                          {viewMode === 'detail' && <h4 className="text-sm font-medium">새로운 탭 디자인</h4>}
                          <Tabs defaultValue="tab1" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="tab1">첫 번째</TabsTrigger>
                              <TabsTrigger value="tab2">두 번째</TabsTrigger>
                              <TabsTrigger value="tab3">세 번째</TabsTrigger>
                            </TabsList>
                            {viewMode === 'detail' && (
                              <>
                                <TabsContent value="tab1" className="mt-4">
                                  <p className="text-sm text-muted-foreground">첫 번째 탭의 내용입니다.</p>
                                </TabsContent>
                                <TabsContent value="tab2" className="mt-4">
                                  <p className="text-sm text-muted-foreground">두 번째 탭의 내용입니다.</p>
                                </TabsContent>
                                <TabsContent value="tab3" className="mt-4">
                                  <p className="text-sm text-muted-foreground">세 번째 탭의 내용입니다.</p>
                                </TabsContent>
                              </>
                            )}
                          </Tabs>
                          {viewMode === 'detail' && (
                            <p className="text-xs text-muted-foreground">
                              기본: 흰색 배경 + 검은색 텍스트 → 활성화시 Primary 색상 텍스트 + 굵은 폰트 + Primary 하단 언더라인
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className={viewMode === 'list' ? 'pb-3' : ''}>
                        <CardTitle className={viewMode === 'list' ? 'text-base' : ''}>뷰 모드 스위치</CardTitle>
                        <CardDescription className={viewMode === 'list' ? 'text-xs' : ''}>두 가지 스타일의 스위치 컴포넌트</CardDescription>
                      </CardHeader>
                      <CardContent className={viewMode === 'list' ? 'space-y-2' : 'space-y-4'}>
                        <div className="space-y-4">
                          {viewMode === 'detail' && <h4 className="text-sm font-medium">Default Variant (뷰 모드 전환용)</h4>}
                          <ViewModeSwitch
                            value="list"
                            onValueChange={() => {}}
                            aria-label="뷰 모드 선택"
                            variant="default"
                          >
                            <ViewModeSwitchItem value="list" icon={<List className="h-4 w-4" />}>
                              리스트 뷰
                            </ViewModeSwitchItem>
                            <ViewModeSwitchItem value="detail" icon={<Grid className="h-4 w-4" />}>
                              상세 뷰
                            </ViewModeSwitchItem>
                          </ViewModeSwitch>
                          {viewMode === 'detail' && (
                            <p className="text-xs text-muted-foreground">
                              회색 배경에 활성 버튼은 흰색 배경 + Primary 색상 텍스트 + 그림자 효과
                            </p>
                          )}
                        </div>
                        {viewMode === 'detail' && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Toggle Variant (일반 토글용)</h4>
                            <ViewModeSwitch
                              value="on"
                              onValueChange={() => {}}
                              aria-label="토글 선택"
                              variant="toggle"
                            >
                              <ViewModeSwitchItem value="on">켜기</ViewModeSwitchItem>
                              <ViewModeSwitchItem value="off">끄기</ViewModeSwitchItem>
                            </ViewModeSwitch>
                            <p className="text-xs text-muted-foreground">
                              테두리가 있으며 활성 버튼은 Primary 배경 + 흰색 텍스트
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>네비게이션 메뉴</CardTitle>
                        <CardDescription>조건부 드롭다운 아이콘이 적용된 메뉴</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">{getComponentDemoText.menuExample('ko')}</h4>
                          <p className="text-xs text-muted-foreground">
                            {getComponentDemoText.menuDescription('ko')}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">드롭다운 아이콘 제어</h4>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <code className="text-xs">
                              {`<NavigationMenuTrigger showDropdownIcon={false}>홈</NavigationMenuTrigger>`}
                            </code>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            showDropdownIcon 속성으로 드롭다운 아이콘 표시 여부를 제어할 수 있습니다.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>입력 컴포넌트</CardTitle>
                        <CardDescription>폼 입력 요소들</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Input placeholder="텍스트 입력..." />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="옵션을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="option1">옵션 1</SelectItem>
                            <SelectItem value="option2">옵션 2</SelectItem>
                            <SelectItem value="option3">옵션 3</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="terms" />
                          <Label htmlFor="terms">약관에 동의합니다</Label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.getStatusTitle('ko')}</CardTitle>
                      <CardDescription>{getComponentDemoText.getStatusDescription('ko')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge>{getComponentDemoText.getBadgeVariant('default', 'ko')}</Badge>
                        <Badge variant="success">{getComponentDemoText.getStatusText('success', 'ko')}</Badge>
                        <Badge variant="warning">{getComponentDemoText.getStatusText('warning', 'ko')}</Badge>
                        <Badge variant="error">{getComponentDemoText.getStatusText('error', 'ko')}</Badge>
                        <Badge variant="info">{getComponentDemoText.getStatusText('info', 'ko')}</Badge>
                        <Badge variant="secondary">{getComponentDemoText.getBadgeVariant('secondary', 'ko')}</Badge>
                        <Badge variant="outline">{getComponentDemoText.getBadgeVariant('outline', 'ko')}</Badge>
                      </div>
                      <Button onClick={handleToastClick} className="mb-4">
                        Toast 알림 보기
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.getProjectStatusTitle('ko')}</CardTitle>
                      <CardDescription>{getComponentDemoText.getProjectStatusDescription('ko')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="project-review">{getComponentDemoText.getProjectStatus('review', 'ko')}</Badge>
                        <Badge variant="project-complete">{getComponentDemoText.getProjectStatus('complete', 'ko')}</Badge>
                        <Badge variant="project-cancelled">{getComponentDemoText.getProjectStatus('cancelled', 'ko')}</Badge>
                        <Badge variant="project-planning">{getComponentDemoText.getProjectStatus('planning', 'ko')}</Badge>
                        <Badge variant="project-onhold">{getComponentDemoText.getProjectStatus('onHold', 'ko')}</Badge>
                        <Badge variant="project-inprogress">{getComponentDemoText.getProjectStatus('inProgress', 'ko')}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>{getPaletteText.title('ko')}</CardTitle>
                        <PaletteSwitcher showCurrentName={true} />
                      </div>
                      <CardDescription>{getPaletteText.description('ko')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <PaletteViewer />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>캐러셀 컴포넌트</CardTitle>
                      <CardDescription>이미지나 콘텐츠를 슬라이드로 표시하는 캐러셀</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">기본 캐러셀</h4>
                        <Carousel className="w-full max-w-xs mx-auto">
                          <CarouselContent>
                            <CarouselItem>
                              <div className="p-1">
                                <Card>
                                  <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">1</span>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                            <CarouselItem>
                              <div className="p-1">
                                <Card>
                                  <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">2</span>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                            <CarouselItem>
                              <div className="p-1">
                                <Card>
                                  <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">3</span>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                            <CarouselItem>
                              <div className="p-1">
                                <Card>
                                  <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">4</span>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                            <CarouselItem>
                              <div className="p-1">
                                <Card>
                                  <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-4xl font-semibold">5</span>
                                  </CardContent>
                                </Card>
                              </div>
                            </CarouselItem>
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                        <p className="text-xs text-muted-foreground text-center">
                          좌우 화살표를 클릭하거나 드래그하여 슬라이드를 넘겨보세요.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">다중 아이템 캐러셀</h4>
                        <Carousel
                          opts={{
                            align: "start",
                          }}
                          className="w-full max-w-sm mx-auto"
                        >
                          <CarouselContent>
                            {Array.from({ length: 8 }).map((_, index) => (
                              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                  <Card>
                                    <CardContent className="flex aspect-square items-center justify-center p-4">
                                      <span className="text-2xl font-semibold">{index + 1}</span>
                                    </CardContent>
                                  </Card>
                                </div>
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                          <CarouselPrevious />
                          <CarouselNext />
                        </Carousel>
                        <p className="text-xs text-muted-foreground text-center">
                          한 번에 여러 아이템을 표시하는 캐러셀입니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>향상된 카드 스타일</CardTitle>
                      <CardDescription>다양한 카드 디자인 변형</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">그라데이션 카드</h4>
                        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                          <CardHeader>
                            <CardTitle className="text-primary">프리미엄 기능</CardTitle>
                            <CardDescription>특별한 기능들을 경험해보세요</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                              향상된 기능과 더 나은 성능을 제공합니다.
                            </p>
                            <Button variant="outline" size="sm">
                              업그레이드
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">{getComponentDemoText.hoverEffect('ko')}</h4>
                        <Card className="transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                          <CardHeader>
                            <CardTitle>{getComponentDemoText.interactive('ko')}</CardTitle>
                            <CardDescription>{getComponentDemoText.hoverDescription('ko')}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {getComponentDemoText.hoverInstruction('ko')}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">{getComponentDemoText.iconCards('ko')}</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <Card className="text-center">
                            <CardContent className="pt-6">
                              <Zap className="mx-auto h-8 w-8 text-primary mb-2" />
                              <h3 className="font-medium">{getComponentDemoText.fastSpeed('ko')}</h3>
                              <p className="text-xs text-muted-foreground">{getComponentDemoText.fastSpeedDesc('ko')}</p>
                            </CardContent>
                          </Card>
                          <Card className="text-center">
                            <CardContent className="pt-6">
                              <Settings className="mx-auto h-8 w-8 text-primary mb-2" />
                              <h3 className="font-medium">{getComponentDemoText.easySetup('ko')}</h3>
                              <p className="text-xs text-muted-foreground">{getComponentDemoText.easySetupDesc('ko')}</p>
                            </CardContent>
                          </Card>
                          <Card className="text-center">
                            <CardContent className="pt-6">
                              <Users className="mx-auto h-8 w-8 text-primary mb-2" />
                              <h3 className="font-medium">{getComponentDemoText.teamCollaboration('ko')}</h3>
                              <p className="text-xs text-muted-foreground">{getComponentDemoText.teamCollaborationDesc('ko')}</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="forms" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.projectCreate('ko')}</CardTitle>
                      <CardDescription>{getComponentDemoText.projectCreateDesc('ko')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="project-name">{getComponentDemoText.projectName('ko')}</Label>
                          <Input id="project-name" placeholder={getComponentDemoText.projectNamePlaceholder('ko')} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project-type">{getComponentDemoText.projectType('ko')}</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder={getComponentDemoText.selectType('ko')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="web">{getComponentDemoText.webApp('ko')}</SelectItem>
                              <SelectItem value="mobile">{getComponentDemoText.mobileApp('ko')}</SelectItem>
                              <SelectItem value="desktop">{getComponentDemoText.desktopApp('ko')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">{getComponentDemoText.projectDescription('ko')}</Label>
                        <Textarea id="description" placeholder={getComponentDemoText.projectDescPlaceholder('ko')} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="public" />
                        <Label htmlFor="public">{getComponentDemoText.publicProject('ko')}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">
                          <Zap className="mr-2 h-4 w-4" />
                          {getComponentDemoText.createProject('ko')}
                        </Button>
                        <Button variant="outline">{getButtonText.cancel('ko')}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-6">
                  {/* 캘린더 & 차트 섹션 제목 */}
                  <div className="text-center space-y-2 mb-8">
                    <h2 className={typography.title.section}>
                      {getDataText.calendarAndCharts('ko')}
                    </h2>
                    <p className={typography.text.description}>
                      {getDataText.calendarAndChartsDesc('ko')}
                    </p>
                  </div>

                  {/* 캘린더 섹션 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <Card>
                        <CardHeader>
                          <CardTitle>{getCalendarText.title('ko')}</CardTitle>
                          <CardDescription>{getCalendarText.description('ko')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-lg border"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>{getCalendarText.selectedDate('ko')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDate ? (
                            <div className="space-y-4">
                              <div className="text-2xl font-bold">
                                {selectedDate.toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  weekday: 'long'
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {selectedDate.toLocaleDateString('ko-KR', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                })} • {selectedDate.toLocaleDateString('ko-KR', { weekday: 'long' })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              {getCalendarText.selectDate('ko')}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* 차트 섹션 */}
                  <div className="space-y-6">
                    <h3 className={typography.title.card}>{getChartText.title('ko')}</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 막대 차트 */}
                      <BarChart
                        data={barData}
                        title={getChartText.barChart.title('ko')}
                        description={getChartText.barChart.description('ko')}
                        color={chart.colors.primary}
                        showGrid={true}
                        showTooltip={true}
                        showAxis={true}
                        variant="default"
                        size="default"
                        animate={true}
                      />

                      {/* 라인 차트 */}
                      <LineChart
                        data={lineData}
                        title={getChartText.lineChart.title('ko')}
                        description={getChartText.lineChart.description('ko')}
                        color={chart.colors.secondary}
                        strokeWidth={3}
                        showGrid={true}
                        showTooltip={true}
                        showDots={true}
                        smooth={true}
                        variant="default"
                        size="default"
                        animate={true}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 파이 차트 */}
                      <PieChart
                        data={pieData}
                        title={getChartText.pieChart.title('ko')}
                        description={getChartText.pieChart.description('ko')}
                        showLegend={true}
                        showTooltip={true}
                        showPercent={true}
                        variant="default"
                        size="default"
                        animate={true}
                        outerRadius={65}
                      />

                      {/* 통계 카드 */}
                      <Card>
                        <CardHeader>
                          <CardTitle>{getChartText.statistics.title('ko')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-chart-1/10 rounded-lg">
                              <div className="text-2xl font-bold text-foreground">121</div>
                              <div className="text-sm text-foreground">{getChartText.statistics.totalEvents('ko')}</div>
                            </div>
                            <div className="text-center p-4 bg-chart-2/10 rounded-lg">
                              <div className="text-2xl font-bold text-foreground">17.3</div>
                              <div className="text-sm text-foreground">{getChartText.statistics.monthlyAverage('ko')}</div>
                            </div>
                            <div className="text-center p-4 bg-chart-3/10 rounded-lg">
                              <div className="text-2xl font-bold text-foreground">{getChartText.statistics.friday('ko')}</div>
                              <div className="text-sm text-foreground">{getChartText.statistics.busiestDay('ko')}</div>
                            </div>
                            <div className="text-center p-4 bg-chart-4/10 rounded-lg">
                              <div className="text-2xl font-bold text-foreground">2.5시간</div>
                              <div className="text-sm text-foreground">{getChartText.statistics.averageLength('ko')}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* 사용법 안내 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{getUsageText.title('ko')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">{getUsageText.calendarUsage('ko')}</h4>
                          <code className="block p-2 bg-muted rounded text-sm">
                            {`import { Calendar } from '@/components/ui/calendar'`}
                          </code>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">{getUsageText.chartUsage('ko')}</h4>
                          <code className="block p-2 bg-muted rounded text-sm">
                            {`import { BarChart, LineChart, PieChart } from '@/components/ui/[chart-name]'`}
                          </code>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">{getUsageText.features.title('ko')}</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li><strong>cva</strong>: {getUsageText.features.cva('ko')}</li>
                            <li><strong>forwardRef</strong>: {getUsageText.features.forwardRef('ko')}</li>
                            <li><strong>TypeScript</strong>: {getUsageText.features.typescript('ko')}</li>
                            <li><strong>shadcn/ui</strong>: {getUsageText.features.shadcn('ko')}</li>
                            <li><strong>접근성</strong>: {getUsageText.features.accessibility('ko')}</li>
                            <li><strong>디자인 토큰</strong>: {getUsageText.features.designTokens('ko')}</li>
                            <li><strong>Variants</strong>: {getUsageText.features.variants('ko')}</li>
                            <li><strong>커스터마이징</strong>: {getUsageText.features.customization('ko')}</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 기존 팀 멤버 목록 유지 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>팀 멤버 목록</CardTitle>
                      <CardDescription>프로젝트 참여 멤버들</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>멤버</TableHead>
                            <TableHead>역할</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>마지막 활동</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>김</AvatarFallback>
                              </Avatar>
                              <span>김개발</span>
                            </TableCell>
                            <TableCell>프론트엔드 개발자</TableCell>
                            <TableCell>
                              <Badge>{getComponentDemoText.getStatusText('active', 'ko')}</Badge>
                            </TableCell>
                            <TableCell>2분 전</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>이</AvatarFallback>
                              </Avatar>
                              <span>이디자인</span>
                            </TableCell>
                            <TableCell>UI/UX 디자이너</TableCell>
                            <TableCell>
                              <Badge>{getComponentDemoText.getStatusText('online', 'ko')}</Badge>
                            </TableCell>
                            <TableCell>방금 전</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="flex items-center space-x-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>박</AvatarFallback>
                              </Avatar>
                              <span>박백엔드</span>
                            </TableCell>
                            <TableCell>백엔드 개발자</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getComponentDemoText.getStatusText('offline', 'ko')}</Badge>
                            </TableCell>
                            <TableCell>1시간 전</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="layout" className="space-y-6">
                  {/* 히어로 섹션들 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>히어로 섹션</CardTitle>
                      <CardDescription>다양한 스타일의 히어로 섹션 컴포넌트</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">기본 히어로 섹션</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <BasicHero
                            title="혁신적인 UI 시스템"
                            subtitle="생산성을 높이는 컴포넌트 라이브러리"
                            description="shadcn/ui 기반의 완전히 커스터마이징 가능한 컴포넌트들로 더 빠르게 개발하세요."
                            badge="v1.0"
                            primaryAction={{
                              label: "시작하기",
                              onClick: () => toast({ description: "시작하기 버튼이 클릭되었습니다!" })
                            }}
                            secondaryAction={{
                              label: "문서 보기",
                              onClick: () => toast({ description: "문서 보기 버튼이 클릭되었습니다!" })
                            }}
                            className="py-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">중앙정렬 히어로 섹션</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <CenteredHero
                            title="중앙화된 UI"
                            subtitle="하나의 소스, 무한한 가능성"
                            description="모든 컴포넌트가 하나의 시스템으로 통합되어 일관성 있는 사용자 경험을 제공합니다."
                            badge="신규"
                            primaryAction={{
                              label: "체험하기",
                              onClick: () => toast({ description: "체험하기 버튼이 클릭되었습니다!" })
                            }}
                            secondaryAction={{
                              label: "가이드",
                              onClick: () => toast({ description: "가이드 버튼이 클릭되었습니다!" })
                            }}
                            className="py-8"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">분할 레이아웃 히어로 섹션</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <SplitHero
                            title="개발자를 위한 도구"
                            subtitle="코드부터 디자인까지"
                            description="개발자와 디자이너가 함께 사용할 수 있는 완벽한 디자인 시스템을 경험해보세요."
                            badge="프로"
                            primaryAction={{
                              label: "다운로드",
                              onClick: () => toast({ description: "다운로드 버튼이 클릭되었습니다!" })
                            }}
                            secondaryAction={{
                              label: "데모 보기",
                              onClick: () => toast({ description: "데모 보기 버튼이 클릭되었습니다!" })
                            }}
                            className="py-8"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 푸터 컴포넌트들 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>푸터 컴포넌트</CardTitle>
                      <CardDescription>다양한 스타일의 푸터 디자인</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">기본 푸터</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <BasicFooter
                            companyName="UI Components"
                            description="현대적이고 접근성이 뛰어난 UI 컴포넌트 라이브러리입니다."
                            links={[
                              {
                                title: "제품",
                                items: [
                                  { label: "컴포넌트", href: "#" },
                                  { label: "템플릿", href: "#" },
                                  { label: "테마", href: "#" }
                                ]
                              },
                              {
                                title: "지원",
                                items: [
                                  { label: "문서", href: "#" },
                                  { label: "가이드", href: "#" },
                                  { label: "커뮤니티", href: "#" }
                                ]
                              }
                            ]}
                            newsletter={{
                              title: "뉴스레터",
                              description: "최신 업데이트를 받아보세요",
                              placeholder: "이메일 주소",
                              buttonText: "구독"
                            }}
                            socialLinks={[
                              { label: "GitHub", href: "#" },
                              { label: "Twitter", href: "#" },
                              { label: "Discord", href: "#" }
                            ]}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">미니멀 푸터</h4>
                        <div className="border rounded-lg overflow-hidden">
                          <MinimalFooter
                            companyName="UI Kit"
                            links={[
                              { label: "개인정보처리방침", href: "#" },
                              { label: "이용약관", href: "#" },
                              { label: "지원", href: "#" }
                            ]}
                            copyright="© 2024 UI Kit. 모든 권리 보유."
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* FAQ 섹션 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>FAQ 섹션</CardTitle>
                      <CardDescription>자주 묻는 질문들</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="item-1">
                          <AccordionTrigger>중앙화 시스템의 장점은 무엇인가요?</AccordionTrigger>
                          <AccordionContent>
                            shadcn 기반의 중앙화된 컴포넌트 시스템은 일관된 디자인, 유지보수 편의성,
                            그리고 개발 생산성 향상을 제공합니다. 모든 컴포넌트가 표준화되어 있어
                            팀 간 협업이 원활해집니다.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                          <AccordionTrigger>기존 프로젝트와의 호환성은?</AccordionTrigger>
                          <AccordionContent>
                            기존 컴포넌트를 shadcn 표준으로 점진적 마이그레이션이 가능합니다.
                            글로벌 CSS 변수를 통한 테마 시스템으로 기존 디자인을 그대로 유지할 수 있습니다.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                          <AccordionTrigger>커스터마이징은 어떻게 하나요?</AccordionTrigger>
                          <AccordionContent>
                            Tailwind CSS 변수와 shadcn의 variant 시스템을 통해
                            브랜드에 맞는 커스터마이징이 용이합니다.
                            컴포넌트별로 독립적인 스타일 조정이 가능합니다.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <Toaster />
      </div>
    </TooltipProvider>
  )
}