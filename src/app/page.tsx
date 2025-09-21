import { brand, getBrandName, getDescription, getLogoAlt, getExtendedDescription, getButtonText, getDataText, routes } from '@/config/brand'
import { layout, typography } from '@/config/constants'

export default function Home() {
  return (
    <div className="container relative">
      <section className={`mx-auto flex flex-col items-center gap-2`} style={{maxWidth: layout.container.maxWidth, padding: layout.spacing.section.lg}}>
        <div className="flex items-center justify-center gap-4 mb-2">
          <img
            src={brand.logo.favicon}
            alt={getLogoAlt('ko')}
            className={`${layout.heights.logoMedium} md:${layout.heights.logoLarge}`}
          />
          <h1 className={`text-center ${typography.title.hero}`}>
            {getBrandName('ko')}
          </h1>
        </div>
        <span className={`text-center ${typography.text.body}`} style={{maxWidth: layout.container.textMaxWidth}}>
          {getDescription('ko')}
          {getExtendedDescription('ko')}
        </span>
        <div className="flex w-full items-center justify-center py-4 md:pb-10">
          <a
            href={routes.components}
            className={`inline-flex ${layout.heights.button} items-center justify-center rounded-md bg-primary px-8 ${typography.text.button} text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`}
          >
            {getButtonText.viewComponents('ko')}
          </a>
        </div>
      </section>
    </div>
  )
}