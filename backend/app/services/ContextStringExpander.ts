export type ExpandParams = {
  data: {
    contextString: string,
    contexts: Record<string, Record<string, any>>
  }
}

export default class ContextStringExpander {
  constructor() { }

  public static safeExpand(params: ExpandParams): string {
    try {
      return this.expand(params)
    } catch(error) {
      return ''
    }
  }

  public static expand(params: ExpandParams): string {
    let finalString = params.data.contextString

    // searching for substitution
    let reg = /\$\{[^\{]*\}/g
    let result
    while ((result = reg.exec(params.data.contextString)) !== null) {
      let dottedString = result[0].replace(/\$/g, '').replace(/\{/g, '').replace(/\}/g, '')
      let expanded = ContextStringExpander.expandContextString({
        data: {
          dottedString: dottedString,
          contexts: params.data.contexts
        }
      })

      let replaceRegex = new RegExp(result[0].replace('$', '\\$').replace('{', '\\{').replace('}', '\\}'), 'g')
      finalString = finalString.replace(replaceRegex, expanded)
    }

    return finalString
  }

  private static expandContextString(params: {
    data: {
      dottedString: string,
      contexts: Record<string, Record<string, any>>
    }
  }): string {
    // console.log({
    //   dottedString: params.data.dottedString,
    //   contexts: params.data.contexts
    // })

    let accessorArray = params.data.dottedString.split('.')

    let returnValue: any = params.data.contexts[accessorArray[0]]
    for (let i = 1; i < accessorArray.length; i += 1) {
      returnValue = returnValue[accessorArray[i]]
    }

    return returnValue
  }
}