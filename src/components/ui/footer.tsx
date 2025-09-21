"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { brand, getCompanyName, getLogoAlt, getCopyright } from "@/config/brand"

// 기본 푸터
interface BasicFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  companyName?: string
  description?: string
  links?: {
    title: string
    items: { label: string; href: string }[]
  }[]
  socialLinks?: { label: string; href: string; icon?: React.ReactNode }[]
  newsletter?: {
    title: string
    description: string
    placeholder: string
    buttonText: string
  }
  copyright?: string
}

const BasicFooter = React.forwardRef<HTMLDivElement, BasicFooterProps>(
  ({
    className,
    companyName = getCompanyName('ko'),
    description,
    links = [],
    socialLinks = [],
    newsletter,
    copyright,
    ...props
  }, ref) => (
    <footer
      ref={ref}
      className={cn("bg-white border-t", className)}
      {...props}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={brand.logo.favicon}
                alt={getLogoAlt('ko')}
                className="w-6 h-6"
              />
              <h3 className="text-lg font-semibold text-gray-900">{companyName}</h3>
            </div>
            {description && (
              <p className="text-sm text-gray-600 max-w-xs">
                {description}
              </p>
            )}
          </div>

          {/* 링크 섹션들 */}
          {links.map((section, index) => (
            <div key={index} className="space-y-4">
              <h4 className="text-sm font-medium">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 뉴스레터 */}
          {newsletter && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">{newsletter.title}</h4>
              <p className="text-sm text-muted-foreground">
                {newsletter.description}
              </p>
              <div className="flex space-x-2">
                <Input
                  placeholder={newsletter.placeholder}
                  className="flex-1"
                />
                <Button size="sm">{newsletter.buttonText}</Button>
              </div>
            </div>
          )}
        </div>

        {/* 하단 섹션 */}
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            {copyright || getCopyright('ko')}
          </p>
          {socialLinks.length > 0 && (
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social.icon || social.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
)
BasicFooter.displayName = "BasicFooter"

// 미니멀 푸터
interface MinimalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  companyName?: string
  links?: { label: string; href: string }[]
  copyright?: string
}

const MinimalFooter = React.forwardRef<HTMLDivElement, MinimalFooterProps>(
  ({
    className,
    companyName = getCompanyName('ko'),
    links = [],
    copyright,
    ...props
  }, ref) => (
    <footer
      ref={ref}
      className={cn("border-t bg-white", className)}
      {...props}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <img
              src={brand.logo.favicon}
              alt={getLogoAlt('ko')}
              className="w-5 h-5"
            />
            <h3 className="text-sm font-medium text-gray-900">{companyName}</h3>
            <Badge variant="outline" className="text-xs">
              UI Kit
            </Badge>
          </div>

          {links.length > 0 && (
            <nav className="flex space-x-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        <div className="mt-4 pt-4 border-t text-center sm:text-left">
          <p className="text-xs text-muted-foreground">
            {copyright || getCopyright('ko')}
          </p>
        </div>
      </div>
    </footer>
  )
)
MinimalFooter.displayName = "MinimalFooter"

export { BasicFooter, MinimalFooter }