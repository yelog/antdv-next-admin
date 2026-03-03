#!/usr/bin/env node

/**
 * CRUD Generator CLI
 *
 * Usage:
 *   node scripts/generator/index.js generate --name=User --module=system
 *   node scripts/generator/index.js generate --name=Order --module=business --template=master-detail
 */

const path = require('node:path')
const { program } = require('commander')
const fs = require('fs-extra')
const handlebars = require('handlebars')

// Template registry
const templates = {
  'simple-list': {
    name: 'Simple List',
    description: 'Basic CRUD table with search and pagination',
    files: ['view.hbs', 'api.hbs', 'store.hbs', 'locale.hbs', 'mock.hbs'],
  },
  'complex-form': {
    name: 'Complex Form',
    description: 'Multi-step or dynamic form with validation',
    files: ['view-complex.hbs', 'api.hbs', 'store.hbs', 'locale.hbs', 'mock.hbs'],
  },
  'master-detail': {
    name: 'Master Detail',
    description: 'Split layout with master table and detail panel',
    files: ['view-master-detail.hbs', 'api.hbs', 'store.hbs', 'locale.hbs', 'mock.hbs'],
  },
}

program
  .name('crud-generator')
  .description('Generate CRUD scaffolding for antdv-next-admin')
  .version('1.0.0')

program
  .command('generate')
  .description('Generate CRUD scaffolding')
  .requiredOption('-n, --name <name>', 'Entity name (e.g., User, Order)')
  .requiredOption('-m, --module <module>', 'Module name (e.g., system, business)')
  .option('-t, --template <template>', 'Template type', 'simple-list')
  .option('--api-prefix <prefix>', 'API prefix', '/api')
  .action(async (options) => {
    console.log(`Generating ${options.template} scaffolding for ${options.name}...`)

    const templateConfig = templates[options.template]
    if (!templateConfig) {
      console.error(`Template "${options.template}" not found. Available: ${Object.keys(templates).join(', ')}`)
      process.exit(1)
    }

    const context = {
      name: options.name,
      module: options.module,
      apiPrefix: options.apiPrefix,
      lowerName: options.name.toLowerCase(),
      pluralName: options.name.endsWith('s') ? options.name : `${options.name}s`,
      kebabName: options.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
    }

    const outputDir = path.join(process.cwd(), 'src', 'views', context.module, context.kebabName)

    // Create output directory
    await fs.ensureDir(outputDir)

    // Generate files
    const generatedFiles = []

    // 1. Generate View
    const viewTemplate = await fs.readFile(
      path.join(__dirname, 'templates', 'view.hbs'),
      'utf-8',
    )
    const viewCompiled = handlebars.compile(viewTemplate)
    const viewContent = viewCompiled(context)
    const viewPath = path.join(outputDir, 'index.vue')
    await fs.writeFile(viewPath, viewContent)
    generatedFiles.push(viewPath)

    // 2. Generate API
    const apiDir = path.join(process.cwd(), 'src', 'api')
    await fs.ensureDir(apiDir)
    const apiTemplate = await fs.readFile(
      path.join(__dirname, 'templates', 'api.hbs'),
      'utf-8',
    )
    const apiCompiled = handlebars.compile(apiTemplate)
    const apiContent = apiCompiled(context)
    const apiPath = path.join(apiDir, `${context.lowerName}.ts`)
    await fs.writeFile(apiPath, apiContent)
    generatedFiles.push(apiPath)

    // 3. Generate Store (optional)
    const storeDir = path.join(process.cwd(), 'src', 'stores')
    const storeTemplate = await fs.readFile(
      path.join(__dirname, 'templates', 'store.hbs'),
      'utf-8',
    )
    const storeCompiled = handlebars.compile(storeTemplate)
    const storeContent = storeCompiled(context)
    const storePath = path.join(storeDir, `${context.lowerName}.ts`)
    await fs.writeFile(storePath, storeContent)
    generatedFiles.push(storePath)

    // 4. Generate Mock
    const mockDir = path.join(process.cwd(), 'mock', 'handlers')
    await fs.ensureDir(mockDir)
    const mockTemplate = await fs.readFile(
      path.join(__dirname, 'templates', 'mock.hbs'),
      'utf-8',
    )
    const mockCompiled = handlebars.compile(mockTemplate)
    const mockContent = mockCompiled(context)
    const mockPath = path.join(mockDir, `${context.lowerName}.mock.ts`)
    await fs.writeFile(mockPath, mockContent)
    generatedFiles.push(mockPath)

    // 5. Generate i18n keys (append to existing)
    const i18nPath = path.join(process.cwd(), 'src', 'locales', 'zh-CN.ts')
    const i18nTemplate = await fs.readFile(
      path.join(__dirname, 'templates', 'locale.hbs'),
      'utf-8',
    )
    const i18nCompiled = handlebars.compile(i18nTemplate)
    const i18nContent = i18nCompiled(context)
    console.log(`\nAppend the following to ${i18nPath}:`)
    console.log('---')
    console.log(i18nContent)
    console.log('---')

    console.log(`\n✅ Generated ${generatedFiles.length} files:`)
    generatedFiles.forEach(file => console.log(`  - ${path.relative(process.cwd(), file)}`))

    console.log(`\n📋 Next steps:`)
    console.log(`  1. Add route to src/router/routes.ts`)
    console.log(`  2. Update i18n translations in src/locales/*.ts`)
    console.log(`  3. Customize the generated files as needed`)
  })

program
  .command('list-templates')
  .description('List available templates')
  .action(() => {
    console.log('Available templates:')
    Object.entries(templates).forEach(([key, config]) => {
      console.log(`  ${key.padEnd(15)} - ${config.description}`)
    })
  })

program
  .command('from-openapi')
  .description('Generate from OpenAPI spec')
  .requiredOption('-s, --spec <path>', 'Path to OpenAPI spec file')
  .requiredOption('-m, --module <module>', 'Module name')
  .action(async (options) => {
    console.log(`Generating from OpenAPI spec: ${options.spec}`)
    // TODO: Implement OpenAPI parsing
    console.log('⚠️  OpenAPI generation not yet implemented')
  })

program.parse()
