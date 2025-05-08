import { BaseCommand, args } from '@adonisjs/core/ace'
import { Codemods } from '@adonisjs/core/ace/codemods'
import stringHelpers from '@adonisjs/core/helpers/string'
import app from '@adonisjs/core/services/app'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { ts } from 'ts-morph'
import * as prietter from 'prettier'

const STUBS_ROOT = app.makePath('commands', 'stubs')

export default class MakeResource extends BaseCommand {
  static commandName = 'make:resource'
  static description = 'Creates a resource with his controller, manager, model and validators'

  @args.string({ required: false })
  declare name: string

  static options: CommandOptions = {}

  async run() {
    if(!this.name) 
      this.name = await this.prompt.ask(
        'Which name do you want to use for the new resource?',
        {
          hint: 'write the name pascal case'
        }
      )

    this.name = stringHelpers.singular(this.name)
    this.name = stringHelpers.pascalCase(this.name)
    this.logger.info(`using ${this.name} as resource name`)

    const codemods = await this.createCodemods()
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/controller.stub', {
      name: this.name
    })
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/manager.stub', {
      name: this.name
    })
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/model.stub', {
      name: this.name
    })
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/createValidator.stub', {
      name: this.name
    })
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/updateValidator.stub', {
      name: this.name
    })
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/validatorIndex.stub', {
      name: this.name
    })
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/test.stub', {
      name: this.name
    })
    await codemods.makeUsingStub(STUBS_ROOT, 'resource/factory.stub', {
      name: this.name
    })
    // await this.editAuthorizationManager({ codemods })
    this.logger.info('authorization manager updated')
    await this.editFactoryIndex({ codemods })
    this.logger.info('factory index updated')
  }

  // async editAuthorizationManager(params: {
  //   codemods: Codemods
  // }) {
  //   const project = await params.codemods.getTsMorphProject()
  //   let sourceFile = project?.getSourceFile('app/managers/authorization.manager.ts')
  //   let propertyName = stringHelpers.camelCase(this.name)

  //   if (!!sourceFile) {
  //     sourceFile.forEachChild(node => {
  //       if (node.getKindName() == 'TypeAliasDeclaration') {
  //         let identifiers = node.getChildrenOfKind(ts.SyntaxKind.Identifier)
  //         for (let i = 0; i < identifiers.length; i += 1) {
  //           let text = identifiers[i].getNodeProperty('text')
  //           if(text == 'GroupedPermissions') {
  //             let typeLiterals = node.getChildrenOfKind(ts.SyntaxKind.TypeLiteral)
  //             let typeLiteral = typeLiterals[0]
  //             typeLiteral.addProperty({
  //               name: propertyName,
  //               type: '{ \nmanage: Type\n, view: Type\n }'
  //             })
  //           }
  //         }
  //       }

  //       if(node.getKindName() == 'ClassDeclaration') {
  //         let identifiers = node.getChildrenOfKind(ts.SyntaxKind.Identifier)
  //         for (let i = 0; i < identifiers.length; i += 1) {
  //           let text = identifiers[i].getNodeProperty('text')
  //           if (text == 'AuthorizationManager') {
  //             let propertiesDeclarations = node.getChildrenOfKind(ts.SyntaxKind.PropertyDeclaration)
  //             for(let k = 0; k < propertiesDeclarations.length; k += 1) {
  //               let property = propertiesDeclarations[k]
  //               let propertyIdentifiers = property.getChildrenOfKind(ts.SyntaxKind.Identifier)
  //               if(propertyIdentifiers.some((pi) => pi.getText() == 'mapper')) {
  //                 let literalExpressions = property.getChildrenOfKind(ts.SyntaxKind.ObjectLiteralExpression)
  //                 literalExpressions[0].addPropertyAssignment({
  //                   name: propertyName,
  //                   initializer: '{ manage: AuthorizationManager._canFunction, view: AuthorizationManager._canFunction }'
  //                 })
  //               }
  //             }
  //           }
  //         }
  //       }
  //     })

  //     await sourceFile.replaceText(
  //       [sourceFile.getStartLinePos(), sourceFile.getEnd()], 
  //       await prietter.format(sourceFile.getFullText(), {
  //         trailingComma: "es5",
  //         semi: false,
  //         singleQuote: true,
  //         useTabs: false,
  //         quoteProps: "consistent",
  //         bracketSpacing: true,
  //         arrowParens: "always",
  //         printWidth: 100,
  //         plugins: ["prettier-edgejs"],
  //         parser: 'typescript'
  //       })
  //     )
  //     await sourceFile.save()
  //   }
  // }

  async editFactoryIndex(params: {
    codemods: Codemods
  }) {
    const project = await params.codemods.getTsMorphProject()
    let sourceFile = project?.getSourceFile('database/factories/index.ts')

    if(!!sourceFile) {
      sourceFile?.insertText(sourceFile.getEnd(), `\nexport { default as ${stringHelpers.pascalCase(this.name)}Factory } from './${stringHelpers.pascalCase(this.name)}Factory.js'`)

      sourceFile.replaceText(
        [sourceFile.getStartLinePos(), sourceFile.getEnd()],
        await prietter.format(sourceFile.getFullText(), {
          trailingComma: "es5",
          semi: false,
          singleQuote: true,
          useTabs: false,
          quoteProps: "consistent",
          bracketSpacing: true,
          arrowParens: "always",
          printWidth: 100,
          plugins: ["prettier-edgejs"],
          parser: 'typescript'
        })
      )
      await sourceFile.save()
    }

    
  }
}