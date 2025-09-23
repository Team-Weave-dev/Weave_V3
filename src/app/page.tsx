"use client"

import { HeaderNavigation } from "@/components/ui/header-navigation"
import { CenteredHero } from "@/components/ui/hero-section"
import { BasicFooter } from "@/components/ui/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { 
  brand, 
  getHomeText, 
  getBrandName,
  routes
} from '@/config/brand'
import { layout, typography } from '@/config/constants'
import { 
  Briefcase, 
  Calculator, 
  BarChart3, 
  Layers, 
  CheckCircle,
  TrendingUp,
  Users,
  Shield,
  Code,
  Palette,
  Building,
  MessageSquare,
  Clock,
  FileText
} from 'lucide-react'

export default function Home() {
  const handlePrimaryAction = () => {
    window.location.href = '/dashboard'
  }

  const handleSecondaryAction = () => {
    const targetSection = document.getElementById('target-users')
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCTAAction = () => {
    window.location.href = '/dashboard'
  }

  // 아이콘 매핑
  const featureIcons = {
    project: <Briefcase className="h-12 w-12 text-primary" />,
    tax: <Calculator className="h-12 w-12 text-primary" />,
    analytics: <BarChart3 className="h-12 w-12 text-primary" />,
    integration: <Layers className="h-12 w-12 text-primary" />
  }

  const carouselIcons = [
    <FileText className="h-8 w-8 text-primary" />,
    <Calculator className="h-8 w-8 text-primary" />,
    <Clock className="h-8 w-8 text-primary" />,
    <BarChart3 className="h-8 w-8 text-primary" />
  ]

  const targetUserIcons = [
    <Code className="h-10 w-10 text-primary" />,
    <Palette className="h-10 w-10 text-primary" />,
    <Building className="h-10 w-10 text-primary" />,
    <MessageSquare className="h-10 w-10 text-primary" />
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 네비게이션 */}
      <HeaderNavigation />
      
      {/* 메인 콘텐츠 - 헤더 높이만큼 패딩 추가 */}
      <main className="pt-16">
        {/* 히어로 섹션 */}
        <CenteredHero
          badge={getHomeText.hero.badge('ko')}
          title={getHomeText.hero.title('ko')}
          subtitle={getHomeText.hero.subtitle('ko')}
          description={getHomeText.hero.description('ko')}
          primaryAction={{
            label: getHomeText.hero.primaryAction('ko'),
            onClick: handlePrimaryAction
          }}
          secondaryAction={{
            label: getHomeText.hero.secondaryAction('ko'),
            onClick: handleSecondaryAction
          }}
        />

        {/* 통계 섹션 */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{getHomeText.stats.users.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{getHomeText.stats.users.label('ko')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{getHomeText.stats.projects.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{getHomeText.stats.projects.label('ko')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{getHomeText.stats.satisfaction.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{getHomeText.stats.satisfaction.label('ko')}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{getHomeText.stats.uptime.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{getHomeText.stats.uptime.label('ko')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 타겟 사용자 섹션 */}
        <section id="target-users" className="py-20 bg-muted/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{getHomeText.targetUsers.title('ko')}</h2>
              <p className="text-lg text-muted-foreground">{getHomeText.targetUsers.subtitle('ko')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[0, 1, 2, 3].map((index) => {
                const user = getHomeText.targetUsers.getUser(index, 'ko')
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        {targetUserIcons[index]}
                      </div>
                      <CardTitle className="text-lg">{user.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{user.description}</CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* 핵심 기능 섹션 */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{getHomeText.features.title('ko')}</h2>
              <p className="text-lg text-muted-foreground">{getHomeText.features.subtitle('ko')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {(['project', 'tax', 'analytics', 'integration'] as const).map((feature) => (
                <Card key={feature} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {featureIcons[feature]}
                    </div>
                    <CardTitle className="text-xl">
                      {getHomeText.features[feature].title('ko')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {getHomeText.features[feature].description('ko')}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 캐루셀 섹션 */}
        <section className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Carousel className="w-full">
                <CarouselContent>
                  {[0, 1, 2, 3].map((index) => {
                    const item = getHomeText.carousel.getItem(index, 'ko')
                    return (
                      <CarouselItem key={index}>
                        <Card className="border-0 bg-transparent">
                          <CardContent className="flex flex-col items-center text-center p-12">
                            <div className="mb-6">
                              {carouselIcons[index]}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                            <p className="text-lg text-muted-foreground max-w-2xl">
                              {item.description}
                            </p>
                          </CardContent>
                        </Card>
                      </CarouselItem>
                    )
                  })}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {getHomeText.cta.title('ko')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {getHomeText.cta.subtitle('ko')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button size="lg" onClick={handleCTAAction} className="min-w-[200px]">
                  {getHomeText.cta.button('ko')}
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{getHomeText.cta.getFeature(index, 'ko')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 푸터 */}
        <BasicFooter
          companyName={brand.company.ko}
          description={brand.description.ko}
          links={[
            {
              title: "제품",
              items: [
                { label: "대시보드", href: "/dashboard" },
                { label: "프로젝트 관리", href: "/projects" },
                { label: "세무 신고", href: "/tax-management" },
                { label: "컴포넌트", href: routes.components }
              ]
            },
            {
              title: "회사",
              items: [
                { label: "소개", href: "#" },
                { label: "팀", href: "#" },
                { label: "채용", href: "#" },
                { label: "연락처", href: "#" }
              ]
            },
            {
              title: "지원",
              items: [
                { label: "문서", href: "#" },
                { label: "가이드", href: "#" },
                { label: "API", href: "#" },
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
            { label: "LinkedIn", href: "#" }
          ]}
        />
      </main>
    </div>
  )
}