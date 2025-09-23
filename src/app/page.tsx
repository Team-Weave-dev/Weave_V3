import { brand, getBrandName, getDescription, getLogoAlt, getExtendedDescription, getButtonText, routes } from '@/config/brand'
import { layout } from '@/config/constants'

export default function Home() {
  return (
    <div className={layout.page.container}>
      <section className={`${layout.page.padding.relaxed} mx-auto flex flex-col items-center gap-4`} style={{ maxWidth: layout.container.maxWidth }}>
        <div className="flex flex-col items-center gap-4 text-center">
          <img
            src={brand.logo.favicon}
            alt={getLogoAlt('ko')}
            className={`${layout.heights.logoMedium} md:${layout.heights.logoLarge}`}
          />
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {getBrandName('ko')}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            {getDescription('ko')} {getExtendedDescription('ko')}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <a
            href={routes.components}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {getButtonText.viewComponents('ko')}
          </a>
        </div>
      </section>
    </div>
  )
}
