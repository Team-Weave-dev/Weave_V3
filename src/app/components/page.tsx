"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/ui/header"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import ProjectProgress from "@/components/ui/project-progress"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { BasicHero, CenteredHero } from "@/components/ui/hero-section"
import { BasicFooter, MinimalFooter } from "@/components/ui/footer"
import { InteractiveCard } from "@/components/ui/interactive-card"
import Typography from "@/components/ui/typography"
import { PaletteSwitcher } from "@/components/ui/palette-switcher"
import { ViewModeSwitch, ViewModeSwitchItem, SimpleViewModeSwitch, type ViewMode } from "@/components/ui/view-mode-switch"
import { BarChart } from "@/components/ui/bar-chart"
import { LineChart } from "@/components/ui/line-chart"
import { PieChart } from "@/components/ui/pie-chart"
import { Chart, ChartContent, ChartHeader, ChartTitle, ChartDescription } from "@/components/ui/chart"
import Pagination from "@/components/ui/pagination"
import { AdvancedTable } from "@/components/ui/advanced-table"
import {
  brand,
  getBrandName,
  getDescription,
  getExtendedDescription,
  getLogoAlt,
  getButtonText,
  getComponentDemoText,
  getNotificationText,
  getCalendarText,
  getChartText,
  getPaletteText,
  getViewModeText,
  getProjectStatusText,
  getProjectStatusTitle,
  getLoadingText,
  getProjectStatusDescription,
  getProjectPageText,
  getDataText,
  getAuthText,
  routes,
} from "@/config/brand"
import { defaults, layout, typography } from "@/config/constants"
import type { ProjectTableConfig, ProjectTableRow, ProjectStatus } from "@/lib/types/project-table.types"
import { cn } from "@/lib/utils"
import {
  LayoutGrid,
  List,
  Loader2,
  Menu,
  Send,
  Sparkles,
} from "lucide-react"

const demoProjects: ProjectTableRow[] = [
  {
    id: "project-1",
    no: "PJT-001",
    name: getComponentDemoText.fastSpeed("ko"),
    registrationDate: "2025-01-05",
    client: brand.company.ko,
    progress: 82,
    status: "in_progress",
    dueDate: "2025-03-18",
    modifiedDate: "2025-02-12",
    paymentProgress: 60,
    paymentStatus: 'interim_completed',
    hasContract: true,
    hasBilling: true,
    hasDocuments: true,
    wbsTasks: [], // Empty WBS tasks for demo
  },
  {
    id: "project-2",
    no: "PJT-002",
    name: getComponentDemoText.easySetup("ko"),
    registrationDate: "2025-01-18",
    client: getComponentDemoText.teamCollaboration("ko"),
    progress: 45,
    status: "review",
    dueDate: "2025-04-10",
    modifiedDate: "2025-02-15",
    paymentProgress: 30,
    paymentStatus: 'advance_completed',
    hasContract: true,
    hasBilling: false,
    hasDocuments: true,
    wbsTasks: [], // Empty WBS tasks for demo
  },
  {
    id: "project-3",
    no: "PJT-003",
    name: getComponentDemoText.hoverEffect("ko"),
    registrationDate: "2024-12-28",
    client: getComponentDemoText.iconCards("ko"),
    progress: 96,
    status: "completed",
    dueDate: "2025-02-01",
    modifiedDate: "2025-02-20",
    paymentProgress: 100,
    paymentStatus: 'final_completed',
    hasContract: true,
    hasBilling: true,
    hasDocuments: true,
    wbsTasks: [], // Empty WBS tasks for demo
  },
]

const badgeStatuses: ProjectStatus[] = [
  "planning",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
]

const semanticBadgeKeys = [
  'success',
  'warning',
  'error',
  'info',
] as const

const softStatusVariantMap: Record<ProjectStatus, BadgeProps['variant']> = {
  planning: 'status-soft-planning',
  in_progress: 'status-soft-inprogress',
  review: 'status-soft-review',
  completed: 'status-soft-completed',
  on_hold: 'status-soft-onhold',
  cancelled: 'status-soft-cancelled',
}

const softSemanticVariantMap: Record<typeof semanticBadgeKeys[number], BadgeProps['variant']> = {
  success: 'status-soft-success',
  warning: 'status-soft-warning',
  error: 'status-soft-error',
  info: 'status-soft-info',
}

export default function ComponentsPage() {
  const { toast } = useToast()
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paginationPage, setPaginationPage] = useState(1)
  const [advancedTableConfig, setAdvancedTableConfig] = useState<ProjectTableConfig>(() => ({
    columns: [
      {
        id: "no",
        key: "no",
        label: getProjectPageText.projectNo("ko"),
        sortable: true,
        filterable: true,
        visible: true,
        order: 0,
        type: "text",
      },
      {
        id: "name",
        key: "name",
        label: getComponentDemoText.projectName("ko"),
        sortable: true,
        filterable: true,
        visible: true,
        order: 1,
        type: "text",
      },
      {
        id: "client",
        key: "client",
        label: getProjectPageText.client("ko"),
        sortable: true,
        filterable: true,
        visible: true,
        order: 2,
        type: "text",
      },
      {
        id: "status",
        key: "status",
        label: getProjectPageText.projectStatus("ko"),
        sortable: true,
        filterable: true,
        visible: true,
        order: 3,
        type: "status",
      },
      {
        id: "progress",
        key: "progress",
        label: getProjectPageText.progress("ko"),
        sortable: true,
        filterable: false,
        visible: true,
        order: 4,
        type: "progress",
      },
    ],
    filters: {
      searchQuery: "",
      statusFilter: "all",
      clientFilter: "all",
      dateRange: undefined,
      customFilters: {},
    },
    sort: {
      column: "no",
      direction: "asc",
    },
    pagination: {
      page: 1,
      pageSize: 5,
      total: demoProjects.length,
    },
  }))

  const mdLogoSize = useMemo(
    () =>
      layout.heights.logoLarge
        .split(" ")
        .map((cls) => `md:${cls}`)
        .join(" "),
    []
  )

  const barData = useMemo(
    () => [
      { name: getComponentDemoText.getMonthName(1, "ko"), value: 12 },
      { name: getComponentDemoText.getMonthName(2, "ko"), value: 19 },
      { name: getComponentDemoText.getMonthName(3, "ko"), value: 15 },
      { name: getComponentDemoText.getMonthName(4, "ko"), value: 25 },
      { name: getComponentDemoText.getMonthName(5, "ko"), value: 22 },
      { name: getComponentDemoText.getMonthName(6, "ko"), value: 18 },
    ],
    []
  )

  const lineData = useMemo(
    () => [
      { name: getComponentDemoText.getWeekday(0, "ko"), value: 8 },
      { name: getComponentDemoText.getWeekday(1, "ko"), value: 12 },
      { name: getComponentDemoText.getWeekday(2, "ko"), value: 15 },
      { name: getComponentDemoText.getWeekday(3, "ko"), value: 9 },
      { name: getComponentDemoText.getWeekday(4, "ko"), value: 18 },
      { name: getComponentDemoText.getWeekday(5, "ko"), value: 6 },
      { name: getComponentDemoText.getWeekday(6, "ko"), value: 4 },
    ],
    []
  )

  const pieData = useMemo(
    () => [
      { name: getComponentDemoText.getCategory("work", "ko"), value: 40 },
      { name: getComponentDemoText.getCategory("personal", "ko"), value: 25 },
      { name: getComponentDemoText.getCategory("meeting", "ko"), value: 20 },
      { name: getComponentDemoText.getCategory("other", "ko"), value: 15 },
    ],
    []
  )

  const simpleTableRows = useMemo(
    () => [
      { project: brand.company.ko, status: "completed" as const, progress: 92 },
      {
        project: getComponentDemoText.fastSpeed("ko"),
        status: "in_progress" as const,
        progress: defaults.progress.initialValue,
      },
      {
        project: getComponentDemoText.easySetup("ko"),
        status: "review" as const,
        progress: 48,
      },
      {
        project: getComponentDemoText.hoverEffect("ko"),
        status: "completed" as const,
        progress: 100,
      },
      {
        project: getComponentDemoText.teamCollaboration("ko"),
        status: "in_progress" as const,
        progress: 68,
      },
    ],
    []
  )

  const itemsPerPage = 3
  const paginatedRows = useMemo(() => {
    const start = (paginationPage - 1) * itemsPerPage
    return simpleTableRows.slice(start, start + itemsPerPage)
  }, [paginationPage, simpleTableRows])

  const handleToast = () => {
    toast({
      title: getNotificationText.title("ko"),
      description: getNotificationText.systemSuccess("ko"),
    })
  }

  const handleLoadingClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1200)
  }

  const handleAdvancedConfigChange = (nextConfig: ProjectTableConfig) => {
    setAdvancedTableConfig({
      ...nextConfig,
      pagination: {
        ...nextConfig.pagination,
        total: demoProjects.length,
      },
    })
  }

  const chartLegendItems = [
    getComponentDemoText.getCategory("work", "ko"),
    getComponentDemoText.getCategory("personal", "ko"),
    getComponentDemoText.getCategory("meeting", "ko"),
    getComponentDemoText.getCategory("other", "ko"),
  ]

  const form = useForm<{ email: string; message: string }>({
    defaultValues: {
      email: "",
      message: "",
    },
  })

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main
          className={cn(
            layout.page.container,
            layout.page.padding.default,
            "pt-[calc(3.5rem+1.5rem)] pb-20",
          )}
        >
          <div className={cn(layout.page.section.stack)}>
            <Tabs defaultValue="buttons" className="space-y-8 pt-6">
              <TabsList className="flex flex-wrap justify-center gap-2">
                <TabsTrigger value="buttons">{getComponentDemoText.sections.buttons.title("ko")}</TabsTrigger>
                <TabsTrigger value="forms">{getComponentDemoText.sections.forms.title("ko")}</TabsTrigger>
                <TabsTrigger value="feedback">{getComponentDemoText.sections.feedback.title("ko")}</TabsTrigger>
                <TabsTrigger value="data">{getComponentDemoText.sections.data.title("ko")}</TabsTrigger>
                <TabsTrigger value="layout">{getComponentDemoText.sections.layout.title("ko")}</TabsTrigger>
              </TabsList>

              <TabsContent value="buttons" className={cn(layout.page.section.stack)}>
                <div className={cn("grid", layout.page.section.gridGap, "lg:grid-cols-2")}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.sections.buttons.title("ko")}</CardTitle>
                      <CardDescription>
                        {getComponentDemoText.sections.buttons.description("ko")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        <Button>{getButtonText.getVariant("primary", "ko")}</Button>
                        <Button variant="secondary">
                          {getButtonText.getVariant("secondary", "ko")}
                        </Button>
                        <Button variant="outline">
                          {getButtonText.getVariant("outline", "ko")}
                        </Button>
                        <Button variant="ghost">
                          {getButtonText.getVariant("ghost", "ko")}
                        </Button>
                        <Button variant="destructive">
                          {getButtonText.getVariant("destructive", "ko")}
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <LoadingButton
                          loading={isLoading}
                          onClick={handleLoadingClick}
                          loadingPlacement="right"
                          loadingText={getLoadingText.pleaseWait("ko")}
                        >
                          {getButtonText.submit("ko")}
                        </LoadingButton>
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Semantic States</h4>
                          <p className="text-xs text-muted-foreground">성공/경고/오류/정보 상태에 대한 소프트 배지</p>
                          <div className="flex flex-wrap gap-2">
                            {semanticBadgeKeys.map((key) => (
                              <Badge key={`semantic-${key}`} variant={softSemanticVariantMap[key]}>
                                {getComponentDemoText.getStatusText(key, 'ko')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-foreground">Project States</h4>
                          <p className="text-xs text-muted-foreground">프로젝트 단계 6종에 대한 소프트 배지</p>
                          <div className="flex flex-wrap gap-2">
                            {badgeStatuses.map((status) => (
                              <Badge key={`status-${status}`} variant={softStatusVariantMap[status]}>
                                {getProjectStatusText(status, 'ko')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>

              <TabsContent value="forms" className={cn(layout.page.section.stack)}>
                <div className={cn("grid", layout.page.section.gridGap, "lg:grid-cols-2")}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.sections.forms.title("ko")}</CardTitle>
                      <CardDescription>
                        {getComponentDemoText.sections.forms.description("ko")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="demo-input">
                            {getComponentDemoText.projectName("ko")}
                          </Label>
                          <Input
                            id="demo-input"
                            placeholder={getComponentDemoText.projectNamePlaceholder("ko")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demo-select">
                            {getComponentDemoText.projectType("ko")}
                          </Label>
                          <Select>
                            <SelectTrigger id="demo-select">
                              <SelectValue placeholder={getComponentDemoText.selectType("ko")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="web">{getComponentDemoText.webApp("ko")}</SelectItem>
                              <SelectItem value="mobile">{getComponentDemoText.mobileApp("ko")}</SelectItem>
                              <SelectItem value="desktop">{getComponentDemoText.desktopApp("ko")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demo-textarea">
                          {getComponentDemoText.projectDescription("ko")}
                        </Label>
                        <Textarea
                          id="demo-textarea"
                          placeholder={getComponentDemoText.projectDescPlaceholder("ko")}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="demo-checkbox" defaultChecked />
                          <Label htmlFor="demo-checkbox">
                            {getComponentDemoText.publicProject("ko")}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="auto-save"
                            checked={isAutoSaveEnabled}
                            onCheckedChange={setIsAutoSaveEnabled}
                          />
                          <Label htmlFor="auto-save">
                            {getComponentDemoText.getStatusText("active", "ko")}
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.projectCreate("ko")}</CardTitle>
                      <CardDescription>{getComponentDemoText.projectCreateDesc("ko")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Form {...form}>
                        <form className="space-y-4">
                          <FormField
                            control={form.control}
                            name="email"
                            rules={{ required: getComponentDemoText.hoverInstruction("ko") }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="user@example.com" {...field} />
                                </FormControl>
                                <FormDescription>{getNotificationText.title("ko")}</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="message"
                            rules={{ required: getComponentDemoText.hoverInstruction("ko") }}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{getComponentDemoText.projectDescription("ko")}</FormLabel>
                                <FormControl>
                                  <Textarea placeholder={getComponentDemoText.projectDescPlaceholder("ko")} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex items-center gap-2">
                            <Button type="submit" className="gap-2">
                              <Send className="h-4 w-4" />
                              {getComponentDemoText.createProject("ko")}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{getCalendarText.title("ko")}</CardTitle>
                    <CardDescription>{getCalendarText.description("ko")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                    <p className="text-sm text-muted-foreground">
                      {getCalendarText.selectedDate("ko")}: {selectedDate?.toLocaleDateString("ko-KR")}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className={cn(layout.page.section.stack)}>
                <div className={cn("grid", layout.page.section.gridGap, "lg:grid-cols-2")}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.sections.feedback.title("ko")}</CardTitle>
                      <CardDescription>
                        {getComponentDemoText.sections.feedback.description("ko")}
                      </CardDescription>
                    </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertTitle>{getNotificationText.title("ko")}</AlertTitle>
                      <AlertDescription>
                        {getNotificationText.systemSuccess("ko")}
                      </AlertDescription>
                    </Alert>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Progress · Base</h4>
                        <p className="text-xs text-muted-foreground">
                          CSS 변수 기반의 기본 Progress 컴포넌트
                        </p>
                        <div className="space-y-2">
                          <Progress value={defaults.progress.initialValue} className="w-full" />
                          <span className="block text-xs text-muted-foreground text-right">
                            {defaults.progress.initialValue}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Project Progress · Soft Palette</h4>
                        <p className="text-xs text-muted-foreground">
                          `ProjectProgress` 컴포넌트 (팔레트 연동)
                        </p>
                        <ProjectProgress
                          value={defaults.progress.initialValue}
                          showLabel
                          labelPlacement="bottom"
                          labelClassName="text-xs text-muted-foreground"
                          className="max-w-full"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button className="gap-2" onClick={handleToast}>
                        <Sparkles className="h-4 w-4" />
                        {getNotificationText.center("ko")}
                      </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline">
                              {getComponentDemoText.hoverEffect("ko")}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getComponentDemoText.hoverInstruction("ko")}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{getViewModeText.title("ko")}</CardTitle>
                      <CardDescription>{getViewModeText.description("ko")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <Menu className="h-4 w-4" />
                            Dialog
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{getComponentDemoText.teamCollaboration("ko")}</DialogTitle>
                            <DialogDescription>
                              {getComponentDemoText.teamCollaborationDesc("ko")}
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button onClick={() => setIsDialogOpen(false)}>
                              {getButtonText.save("ko")}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <Menu className="h-4 w-4" />
                            Sheet
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>{getComponentDemoText.getStatusTitle("ko")}</SheetTitle>
                            <SheetDescription>
                              {getComponentDemoText.getStatusDescription("ko")}
                            </SheetDescription>
                          </SheetHeader>
                          <div className="space-y-3 pt-4">
                            {demoProjects.map((project) => (
                              <div key={project.id} className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                  <p className="font-medium">{project.name}</p>
                                  <p className="text-xs text-muted-foreground">{project.no}</p>
                                </div>
                                <Badge variant={softStatusVariantMap[project.status]}>
                                  {getProjectStatusText(project.status, 'ko')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </SheetContent>
                      </Sheet>

                      <SimpleViewModeSwitch
                        mode={viewMode}
                        onModeChange={setViewMode}
                        ariaLabel={getViewModeText.title("ko")}
                        labels={{
                          list: getViewModeText.listView("ko"),
                          detail: getViewModeText.detailView("ko"),
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="data" className={cn(layout.page.section.stack)}>
                <div className={cn("grid", layout.page.section.gridGap, "lg:grid-cols-2")}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.sections.data.title("ko")}</CardTitle>
                      <CardDescription>
                        {getComponentDemoText.sections.data.description("ko")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{getComponentDemoText.projectName("ko")}</TableHead>
                              <TableHead>{getProjectStatusTitle("ko")}</TableHead>
                              <TableHead>{getProjectPageText.projectProgress("ko")}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedRows.map((row) => (
                              <TableRow key={`${row.project}-${row.status}`}>
                                <TableCell>{row.project}</TableCell>
                                <TableCell>
                                  <Badge variant={softStatusVariantMap[row.status]}>
                                    {getProjectStatusText(row.status, 'ko')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <ProjectProgress value={row.progress} size="sm" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <Pagination
                        currentPage={paginationPage}
                        totalPages={Math.ceil(simpleTableRows.length / itemsPerPage)}
                        onPageChange={setPaginationPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={simpleTableRows.length}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.projectStatus("ko")}</CardTitle>
                      <CardDescription>{getProjectPageText.projectInfo("ko")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <Accordion type="single" collapsible>
                        {demoProjects.map((project) => (
                          <AccordionItem key={project.id} value={project.id}>
                            <AccordionTrigger>{project.name}</AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <p>{getProjectPageText.projectNo("ko")}: {project.no}</p>
                                <p>{getProjectPageText.projectStatus("ko")}: {getProjectStatusText(project.status, "ko")}</p>
                                <ProjectProgress value={project.progress} size="sm" />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>

                      <Tabs defaultValue="overview" className="space-y-2">
                        <TabsList>
                          <TabsTrigger value="overview">{getProjectPageText.tabOverview("ko")}</TabsTrigger>
                          <TabsTrigger value="documentManagement">{getProjectPageText.tabDocumentManagement("ko")}</TabsTrigger>
                          <TabsTrigger value="taxManagement">{getProjectPageText.tabTaxManagement("ko")}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="text-sm text-muted-foreground">
                          {getProjectPageText.overviewDesc("ko")}
                        </TabsContent>
                        <TabsContent value="documentManagement" className="text-sm text-muted-foreground">
                          {getProjectPageText.documentManagementDesc("ko")}
                        </TabsContent>
                        <TabsContent value="taxManagement" className="text-sm text-muted-foreground">
                          {getProjectPageText.taxManagementDesc("ko")}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>

                <div className={cn("grid", layout.page.section.gridGap, "lg:grid-cols-2")}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{getChartText.title("ko")}</CardTitle>
                      <CardDescription>{getChartText.description("ko")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs defaultValue="bar" className="space-y-4">
                        <TabsList>
                          <TabsTrigger value="bar">{getChartText.barChart.title("ko")}</TabsTrigger>
                          <TabsTrigger value="line">{getChartText.lineChart.title("ko")}</TabsTrigger>
                          <TabsTrigger value="pie">{getChartText.pieChart.title("ko")}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="bar" className="h-64">
                          <BarChart data={barData} showLegend showTooltip animate />
                        </TabsContent>
                        <TabsContent value="line" className="h-64">
                          <LineChart data={lineData} showLegend showTooltip animate />
                        </TabsContent>
                        <TabsContent value="pie" className="h-64">
                          <PieChart data={pieData} showLegend showTooltip animate />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{getComponentDemoText.sections.data.description("ko")}</CardTitle>
                      <CardDescription>{getComponentDemoText.hoverDescription("ko")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Chart
                        title={getProjectStatusTitle("ko")}
                        description={getProjectStatusDescription("ko")}
                        showLegend
                      >
                        <ChartHeader>
                          <ChartTitle>{getComponentDemoText.fastSpeed("ko")}</ChartTitle>
                          <ChartDescription>{getComponentDemoText.fastSpeedDesc("ko")}</ChartDescription>
                        </ChartHeader>
                        <ChartContent className="flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">
                            {chartLegendItems.join(" • ")}
                          </span>
                        </ChartContent>
                      </Chart>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Table</CardTitle>
                    <CardDescription>{getProjectPageText.projectInfo("ko")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AdvancedTable
                      data={demoProjects}
                      config={advancedTableConfig}
                      onConfigChange={handleAdvancedConfigChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

            <TabsContent value="layout" className={cn(layout.page.section.stack)}>
              <Card>
                <CardHeader>
                  <CardTitle>{getComponentDemoText.layoutHero.centeredTitle("ko")}</CardTitle>
                  <CardDescription>{getComponentDemoText.layoutHero.centeredDescription("ko")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <img
                      src={brand.logo.favicon}
                      alt={getLogoAlt("ko")}
                      className={cn(layout.heights.logoMedium, mdLogoSize)}
                    />
                  </div>
                  <div className="space-y-4 text-center">
                    <Typography variant="h2" color="accent">
                      {getBrandName("ko")}
                    </Typography>
                    <Typography variant="body1" color="secondary" className="mx-auto max-w-2xl">
                      {getDescription("ko")} {getExtendedDescription("ko")}
                    </Typography>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button asChild>
                      <Link href={routes.home}>{getButtonText.viewComponents("ko")}</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={routes.components}>{getPaletteText.preview("ko")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{getComponentDemoText.menuExample("ko")}</CardTitle>
                  <CardDescription>{getComponentDemoText.menuDescription("ko")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-xl overflow-hidden bg-card">
                    <Header variant="preview" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getAuthText.login("ko")} / {getAuthText.signup("ko")}
                    버튼과 프로필 드롭다운은 `headerNavigation` 설정을 수정하면 즉시 반영됩니다.
                  </p>
                </CardContent>
              </Card>

              <div className={cn("grid", layout.page.section.gridGap, "lg:grid-cols-2")}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>{getComponentDemoText.iconCards("ko")}</CardTitle>
                    <CardDescription>{getComponentDemoText.hoverDescription("ko")}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <Typography variant="caption" color="tertiary" className="uppercase tracking-wide">
                        {getComponentDemoText.iconCards("ko")}
                      </Typography>
                      <Card className="border-dashed">
                        <CardHeader>
                          <Typography variant="h3" color="accent" className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            {getComponentDemoText.fastSpeed("ko")}
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            {getComponentDemoText.fastSpeedDesc("ko")}
                          </Typography>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Typography variant="body1">
                            {getComponentDemoText.teamCollaborationDesc("ko")}
                          </Typography>
                          <Typography variant="caption" color="tertiary">
                            {getComponentDemoText.hoverInstruction("ko")}
                          </Typography>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-3">
                      <Typography variant="caption" color="tertiary" className="uppercase tracking-wide">
                        {getComponentDemoText.interactive("ko")}
                      </Typography>
                      <InteractiveCard className="h-full">
                        <CardHeader className="space-y-2">
                          <Typography variant="h3" color="accent" className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 animate-pulse" />
                            {getComponentDemoText.easySetup("ko")}
                          </Typography>
                          <Typography variant="body2" color="secondary">
                            {getComponentDemoText.easySetupDesc("ko")}
                          </Typography>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-3">
                          <Typography variant="body2" color="secondary">
                            {getComponentDemoText.hoverDescription("ko")}
                          </Typography>
                          <Button size="sm" className="gap-1">
                            <Sparkles className="h-4 w-4" />
                            {getButtonText.save("ko")}
                          </Button>
                        </CardContent>
                      </InteractiveCard>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {`${getComponentDemoText.iconCards("ko")}`} Carousel
                    </CardTitle>
                    <CardDescription>{getComponentDemoText.hoverInstruction("ko")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Carousel className="w-full" opts={{ align: "start" }}>
                      <CarouselContent>
                        {demoProjects.map((project) => (
                          <CarouselItem
                            key={project.id}
                            className="sm:basis-4/5 lg:basis-1/2 xl:basis-[40%]"
                          >
                            <InteractiveCard className="h-full">
                              <CardHeader className="space-y-1">
                                <Typography variant="h4" color="primary" className="text-lg font-semibold">
                                  {project.name}
                                </Typography>
                                <Typography variant="body2" color="secondary">
                                  {project.client}
                                </Typography>
                              </CardHeader>
                              <CardContent className="flex items-center justify-between pt-4">
                                <Typography variant="caption" color="tertiary">
                                  {project.no}
                                </Typography>
                                <Badge variant={softStatusVariantMap[project.status]}>
                                  {getProjectStatusText(project.status, 'ko')}
                                </Badge>
                              </CardContent>
                            </InteractiveCard>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden sm:flex" />
                      <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hero Sections</CardTitle>
                  <CardDescription>{getComponentDemoText.teamCollaborationDesc("ko")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <BasicHero
                    className="rounded-lg border"
                    title={getBrandName("ko")}
                    badge={brand.company.ko}
                    description={getDescription("ko")}
                    primaryAction={{ label: getButtonText.submit("ko") }}
                    secondaryAction={{ label: getButtonText.cancel("ko") }}
                  />
                  <CenteredHero
                    className="rounded-lg border"
                    title={getComponentDemoText.teamCollaboration("ko")}
                    description={getComponentDemoText.teamCollaborationDesc("ko")}
                    primaryAction={{ label: getButtonText.save("ko") }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Footers</CardTitle>
                  <CardDescription>{getProjectPageText.headerDescription("ko")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BasicFooter className="rounded-lg border" />
                  <MinimalFooter className="rounded-lg border" />
                </CardContent>
              </Card>
            </TabsContent>

            </Tabs>
          </div>
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
